/**
 * Authorization Utilities for API Routes
 *
 * These functions provide server-side authorization checks to ensure
 * users can only access and modify their own resources.
 *
 * Security Model:
 * - Session owners (created_by = user.id) can UPDATE/DELETE sessions
 * - Anyone with session ID can READ (for guest access)
 * - Application-level validation required for guest operations (via host_token)
 */

import { getSupabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/types';

type Session = Database['public']['Tables']['sessions_unified']['Row'];

/**
 * Gets the currently authenticated user
 *
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUser() {
  const supabase = getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Verifies that the current user owns the specified session
 *
 * @param sessionId - The session ID to check ownership for
 * @returns Object with success flag and session data if authorized
 */
export async function verifySessionOwnership(sessionId: string): Promise<{
  authorized: boolean;
  session: Session | null;
  error?: string;
}> {
  // Get authenticated user
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authorized: false,
      session: null,
      error: 'Authentication required'
    };
  }

  // Fetch session
  const supabase = getSupabaseServer();
  const { data: session, error: fetchError } = await supabase
    .from('sessions_unified')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) {
    return {
      authorized: false,
      session: null,
      error: 'Session not found'
    };
  }

  // Verify ownership
  if (session.created_by !== user.id) {
    return {
      authorized: false,
      session,
      error: 'You do not have permission to modify this session'
    };
  }

  return {
    authorized: true,
    session
  };
}

/**
 * Verifies that the user has access to view a session
 * This allows both owners and anyone with the session ID (for guest access)
 *
 * @param sessionId - The session ID to check access for
 * @returns Object with success flag and session data if accessible
 */
export async function verifySessionAccess(sessionId: string): Promise<{
  authorized: boolean;
  session: Session | null;
  isOwner: boolean;
  error?: string;
}> {
  const supabase = getSupabaseServer();

  // Fetch session (RLS allows anyone to read)
  const { data: session, error: fetchError } = await supabase
    .from('sessions_unified')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) {
    return {
      authorized: false,
      session: null,
      isOwner: false,
      error: 'Session not found'
    };
  }

  // Check if user is owner
  const user = await getAuthenticatedUser();
  const isOwner = user !== null && session.created_by === user.id;

  return {
    authorized: true,
    session,
    isOwner
  };
}

/**
 * Verifies host token for session-level operations
 * Used for guest-friendly operations that require host privileges
 *
 * @param sessionId - The session ID
 * @param providedToken - The host token provided by the client
 * @returns Object with authorization status
 */
export async function verifyHostToken(
  sessionId: string,
  providedToken: string | null
): Promise<{
  authorized: boolean;
  session: Session | null;
  error?: string;
}> {
  if (!providedToken) {
    return {
      authorized: false,
      session: null,
      error: 'Host token required'
    };
  }

  const supabase = getSupabaseServer();

  // Fetch session
  const { data: session, error: fetchError } = await supabase
    .from('sessions_unified')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) {
    return {
      authorized: false,
      session: null,
      error: 'Session not found'
    };
  }

  // Extract host_token from session_config
  const sessionConfig = session.session_config as Record<string, any> | null | undefined;
  const hostToken = sessionConfig?.host_token || (session as any).host_token;

  if (!hostToken) {
    return {
      authorized: false,
      session,
      error: 'Host token not configured for this session'
    };
  }

  // Verify token match
  if (hostToken !== providedToken) {
    return {
      authorized: false,
      session,
      error: 'Invalid host token'
    };
  }

  return {
    authorized: true,
    session
  };
}

/**
 * Verifies that the current user owns the specified workshop
 *
 * @param workshopId - The workshop ID to check ownership for
 * @returns Object with success flag and workshop data if authorized
 */
export async function verifyWorkshopOwnership(workshopId: string): Promise<{
  authorized: boolean;
  workshop: any | null;
  error?: string;
}> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authorized: false,
      workshop: null,
      error: 'Authentication required'
    };
  }

  const supabase = getSupabaseServer();
  const { data: workshop, error: fetchError } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', workshopId)
    .single();

  if (fetchError || !workshop) {
    return {
      authorized: false,
      workshop: null,
      error: 'Workshop not found'
    };
  }

  if (workshop.created_by !== user.id) {
    return {
      authorized: false,
      workshop,
      error: 'You do not have permission to modify this workshop'
    };
  }

  return {
    authorized: true,
    workshop
  };
}

/**
 * Verifies that the current user owns the specified project
 *
 * @param projectId - The project ID to check ownership for
 * @returns Object with success flag and project data if authorized
 */
export async function verifyProjectOwnership(projectId: string): Promise<{
  authorized: boolean;
  project: any | null;
  error?: string;
}> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authorized: false,
      project: null,
      error: 'Authentication required'
    };
  }

  const supabase = getSupabaseServer();
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) {
    return {
      authorized: false,
      project: null,
      error: 'Project not found'
    };
  }

  if (project.created_by !== user.id) {
    return {
      authorized: false,
      project,
      error: 'You do not have permission to modify this project'
    };
  }

  return {
    authorized: true,
    project
  };
}

/**
 * Helper to check if a user is authenticated
 *
 * @returns True if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return user !== null;
}

/**
 * Helper to get user ID or throw error
 * Useful for operations that absolutely require authentication
 *
 * @throws Error if user is not authenticated
 * @returns The user ID
 */
export async function requireAuth(): Promise<string> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user.id;
}
