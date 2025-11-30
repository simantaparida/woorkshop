import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { generateToken } from '@/lib/utils/helpers';
import { validateSessionName, validateFeatures, sanitizeString } from '@/lib/utils/validation';
import type { CreateSessionInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionInput = await request.json();
    const { hostName, projectName, sessionGoal, durationHours, expiresAt, features } = body;

    // Validate input
    const sessionNameError = validateSessionName(projectName);
    if (sessionNameError) {
      return NextResponse.json({ error: sessionNameError }, { status: 400 });
    }

    const featuresError = validateFeatures(features);
    if (featuresError) {
      return NextResponse.json({ error: featuresError }, { status: 400 });
    }

    if (!hostName || hostName.trim().length === 0) {
      return NextResponse.json({ error: 'Host name is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const hostToken = generateToken();

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .insert({
        title: sanitizeString(projectName),
        description: sessionGoal ? sanitizeString(sessionGoal) : null,
        created_by: sanitizeString(hostName),
        host_token: hostToken,
        tool_type: 'voting-board',
        status: 'open',
        // Legacy voting board columns
        project_name: sanitizeString(projectName),
        host_name: sanitizeString(hostName),
        session_goal: sessionGoal || null,
        duration_hours: durationHours ?? null,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create host player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        session_id: session.id,
        name: sanitizeString(hostName),
        is_host: true,
      })
      .select()
      .single();

    if (playerError || !player) {
      console.error('Player creation error:', playerError);
      // Clean up session if player creation fails
      await supabase.from('sessions_unified').delete().eq('id', session.id);
      return NextResponse.json(
        { error: 'Failed to create host player' },
        { status: 500 }
      );
    }

    // Create features
    const featureInserts = features.map((feature) => ({
      session_id: session.id,
      title: sanitizeString(feature.title),
      description: feature.description ? sanitizeString(feature.description) : null,
      category: feature.category || null,
      effort: null,
      impact: null,
      reference_links: feature.referenceLinks || [],
    }));

    const { error: featuresInsertError } = await supabase
      .from('features')
      .insert(featureInserts);

    if (featuresInsertError) {
      console.error('Features creation error:', featuresInsertError);
      // Clean up session if features creation fails
      await supabase.from('sessions_unified').delete().eq('id', session.id);
      return NextResponse.json(
        { error: 'Failed to create features' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        hostToken,
        playerId: player.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
