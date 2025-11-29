import { supabase } from '@/lib/supabase/client';
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
 * Create a new Problem Framing session
 */
export async function createPFSession(data: CreatePFSessionInput): Promise<{ sessionId: string }> {
  // Create tool_session record
  const { data: session, error: sessionError } = await supabase
    .from('tool_sessions')
    .insert({
      tool_slug: 'problem-framing',
      title: data.title,
      description: data.description || null,
      created_by: data.facilitatorId,
      status: 'setup',
    })
    .select('id')
    .single();

  if (sessionError) throw sessionError;
  if (!session) throw new Error('Failed to create session');

  // Create facilitator as first participant
  const { error: participantError } = await supabase
    .from('pf_session_participants')
    .insert({
      tool_session_id: session.id,
      participant_id: data.facilitatorId,
      participant_name: data.facilitatorName,
      is_facilitator: true,
      has_submitted: false,
    });

  if (participantError) throw participantError;

  return { sessionId: session.id };
}

/**
 * Join an existing Problem Framing session
 */
export async function joinPFSession(input: JoinPFSessionInput): Promise<PFSessionParticipant> {
  const { data, error } = await supabase
    .from('pf_session_participants')
    .insert({
      tool_session_id: input.sessionId,
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
 * Submit individual problem statement
 */
export async function submitStatement(input: SubmitPFStatementInput): Promise<PFIndividualStatement> {
  // Insert statement
  const { data: statement, error: statementError } = await supabase
    .from('pf_individual_statements')
    .insert({
      tool_session_id: input.sessionId,
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
    .eq('tool_session_id', input.sessionId)
    .eq('participant_id', input.participantId);

  if (updateError) throw updateError;

  return statement as PFIndividualStatement;
}

/**
 * Toggle pin on a statement
 */
export async function togglePin(input: TogglePFPinInput): Promise<void> {
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
 * Finalize the final problem statement
 */
export async function finalizePFStatement(input: FinalizePFStatementInput): Promise<PFFinalStatement> {
  // Insert or update final statement
  const { data, error } = await supabase
    .from('pf_final_statement')
    .upsert({
      tool_session_id: input.sessionId,
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
    .from('tool_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', input.sessionId);

  if (statusError) throw statusError;

  return data as PFFinalStatement;
}

/**
 * Get complete Problem Framing session data
 */
export async function getPFSessionData(sessionId: string): Promise<PFSessionData> {
  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('tool_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;
  if (!session) throw new Error('Session not found');

  // Fetch participants
  const { data: participants, error: participantsError } = await supabase
    .from('pf_session_participants')
    .select('*')
    .eq('tool_session_id', sessionId)
    .order('joined_at', { ascending: true });

  if (participantsError) throw participantsError;

  // Fetch individual statements with pins
  const { data: statements, error: statementsError } = await supabase
    .from('pf_individual_statements')
    .select(`
      *,
      pf_statement_pins (*)
    `)
    .eq('tool_session_id', sessionId)
    .order('submitted_at', { ascending: true });

  if (statementsError) throw statementsError;

  // Fetch final statement
  const { data: finalStatement, error: finalError } = await supabase
    .from('pf_final_statement')
    .select('*')
    .eq('tool_session_id', sessionId)
    .single();

  // finalError is expected if no final statement yet

  // Fetch attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .from('pf_attachments')
    .select('*')
    .eq('tool_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (attachmentsError) throw attachmentsError;

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
 * Advance to next step (facilitator only)
 */
export async function advanceStep(sessionId: string, nextStep: number): Promise<void> {
  // Map step to status
  const statusMap: Record<number, string> = {
    2: 'input',
    3: 'review',
    4: 'finalize',
    5: 'summary',
  };

  const status = statusMap[nextStep] || 'setup';

  const { error } = await supabase
    .from('tool_sessions')
    .update({ status })
    .eq('id', sessionId);

  if (error) throw error;
}
