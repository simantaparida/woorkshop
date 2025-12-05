import { getSupabaseServer } from '@/lib/supabase/server';
import type {
  PFSessionData,
  PFIndividualStatement,
  PFStatementPin,
  PFFinalStatement,
  PFSessionParticipant,
  CreatePFSessionInput,
  JoinPFSessionInput,
  SubmitPFStatementInput,
  TogglePFPinInput,
  FinalizePFStatementInput,
} from '@/types';

/**
 * Create a new Problem Framing session (SERVER-SIDE)
 * Auto-adds the facilitator as the first participant with rollback on failure
 */
export async function createPFSession(data: CreatePFSessionInput): Promise<{ sessionId: string }> {
  // Validate inputs
  if (!data.title?.trim()) {
    throw new Error('Title is required and cannot be empty');
  }
  if (!data.facilitatorId?.trim()) {
    throw new Error('Facilitator ID is required');
  }
  if (!data.facilitatorName?.trim()) {
    throw new Error('Facilitator name is required');
  }

  const supabase = getSupabaseServer();

  // Create sessions_unified record
  const { data: session, error: sessionError } = await supabase
    .from('sessions_unified')
    .insert({
      tool_type: 'problem-framing',
      title: data.title,
      description: data.description || null,
      created_by: data.facilitatorId,
      status: 'setup',
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    throw sessionError || new Error('Failed to create session');
  }

  const sessionId = session.id;

  // Auto-add facilitator as first participant
  const { error: participantError } = await supabase
    .from('pf_session_participants')
    .insert({
      session_id: sessionId,
      participant_id: data.facilitatorId,
      participant_name: data.facilitatorName,
      is_facilitator: true,
      has_submitted: false,
    });

  // If participant creation fails, rollback session creation
  if (participantError) {
    console.error('Failed to add facilitator as participant, rolling back session:', participantError);

    // Rollback: Delete the session
    const { error: deleteError } = await supabase
      .from('sessions_unified')
      .delete()
      .eq('id', sessionId);

    if (deleteError) {
      console.error('Failed to rollback session:', deleteError);
    }

    throw new Error('Failed to create session: Unable to add facilitator as participant');
  }

  return { sessionId };
}

/**
 * Join an existing Problem Framing session (SERVER-SIDE)
 */
export async function joinPFSession(input: JoinPFSessionInput): Promise<PFSessionParticipant> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('pf_session_participants')
    .insert({
      session_id: input.sessionId,
      participant_id: input.participantId,
      participant_name: input.participantName,
      is_facilitator: false,
      has_submitted: false,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to join session');

  return data as PFSessionParticipant;
}

/**
 * Submit individual problem statement (SERVER-SIDE)
 */
export async function submitStatement(input: SubmitPFStatementInput): Promise<PFIndividualStatement> {
  const supabase = getSupabaseServer();

  // Insert statement
  const { data: statement, error: statementError } = await supabase
    .from('pf_individual_statements')
    .insert({
      session_id: input.sessionId,
      participant_id: input.participantId,
      participant_name: input.participantName,
      statement: input.statement,
    })
    .select()
    .single();

  if (statementError) throw statementError;
  if (!statement) throw new Error('Failed to submit statement');

  // Update participant has_submitted flag
  const { error: updateError } = await supabase
    .from('pf_session_participants')
    .update({ has_submitted: true })
    .eq('session_id', input.sessionId)
    .eq('participant_id', input.participantId);

  if (updateError) throw updateError;

  return statement as PFIndividualStatement;
}

/**
 * Toggle pin on a statement (SERVER-SIDE)
 */
export async function togglePin(input: TogglePFPinInput): Promise<void> {
  const supabase = getSupabaseServer();

  // Check if pin exists
  const { data: existingPin } = await supabase
    .from('pf_statement_pins')
    .select('id')
    .eq('statement_id', input.statementId)
    .eq('pinned_by_participant_id', input.participantId)
    .single();

  if (existingPin) {
    // Remove pin
    const { error } = await supabase
      .from('pf_statement_pins')
      .delete()
      .eq('id', existingPin.id);

    if (error) throw error;
  } else {
    // Add pin
    const { error } = await supabase
      .from('pf_statement_pins')
      .insert({
        statement_id: input.statementId,
        pinned_by_participant_id: input.participantId,
        pinned_by_participant_name: input.participantName,
      });

    if (error) throw error;
  }
}

/**
 * Finalize the final problem statement (SERVER-SIDE)
 */
export async function finalizePFStatement(input: FinalizePFStatementInput): Promise<PFFinalStatement> {
  const supabase = getSupabaseServer();

  // Insert or update final statement
  const { data, error } = await supabase
    .from('pf_final_statement')
    .upsert({
      session_id: input.sessionId,
      statement: input.statement,
      finalized_by_participant_id: input.participantId,
      finalized_by_participant_name: input.participantName,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to finalize statement');

  // Update session status to completed
  const { error: statusError } = await supabase
    .from('sessions_unified')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', input.sessionId);

  if (statusError) throw statusError;

  return data as PFFinalStatement;
}

/**
 * Get complete Problem Framing session data (SERVER-SIDE)
 */
export async function getPFSessionData(sessionId: string): Promise<PFSessionData> {
  const supabase = getSupabaseServer();

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('sessions_unified')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;
  if (!session) throw new Error('Session not found');

  // Fetch participants
  const { data: participants, error: participantsError } = await supabase
    .from('pf_session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });

  if (participantsError) throw participantsError;

  // Fetch individual statements with pins
  const { data: statements, error: statementsError } = await supabase
    .from('pf_individual_statements')
    .select(`
      *,
      pf_statement_pins (*)
    `)
    .eq('session_id', sessionId)
    .order('submitted_at', { ascending: true });

  if (statementsError) throw statementsError;

  // Fetch final statement
  const { data: finalStatement, error: finalError } = await supabase
    .from('pf_final_statement')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  // finalError is expected if no final statement yet

  // Fetch attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .from('pf_attachments')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (attachmentsError) {
    console.warn('Attachments table not found or query failed:', attachmentsError);
  }

  // Process statements to add pin counts
  const processedStatements: PFIndividualStatement[] = (statements || []).map((stmt: any) => ({
    ...stmt,
    pins: stmt.pf_statement_pins || [],
    pin_count: stmt.pf_statement_pins?.length || 0,
  }));

  // Determine current step based on session status and data
  let currentStep: 1 | 2 | 3 | 4 | 5 = 1;
  if (finalStatement) {
    currentStep = 5;
  } else if (processedStatements.length > 0) {
    const allSubmitted = participants?.every((p: PFSessionParticipant) => p.has_submitted);
    if (allSubmitted) {
      currentStep = 3; // Team review
    } else {
      currentStep = 2; // Individual inputs
    }
  }

  return {
    session,
    topic_title: session.title,
    topic_description: session.description,
    participants: participants || [],
    individual_statements: processedStatements,
    final_statement: finalStatement as PFFinalStatement | null,
    attachments: (attachments as any[]) || [],
    current_step: currentStep,
  };
}

/**
 * Advance to next step (facilitator only) (SERVER-SIDE)
 */
export async function advanceStep(sessionId: string, nextStep: number): Promise<void> {
  const supabase = getSupabaseServer();

  // Map step to status
  const statusMap: Record<number, string> = {
    2: 'input',
    3: 'review',
    4: 'finalize',
    5: 'summary',
  };

  const status = statusMap[nextStep] || 'setup';

  const { error} = await supabase
    .from('sessions_unified')
    .update({ status })
    .eq('id', sessionId);

  if (error) throw error;
}
