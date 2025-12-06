'use client';

import { useState } from 'react';

interface DeleteSessionResult {
  success: boolean;
  error?: string;
}

export function useDeleteSession() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSession = async (sessionId: string): Promise<DeleteSessionResult> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to delete session';

        // DEBUG: Enhanced error logging
        console.error('[DELETE SESSION CLIENT] Request failed:', {
          sessionId,
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorMessage,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: errorMessage
        };
      }

      // DEBUG: Success logging
      console.log('[DELETE SESSION CLIENT] Request succeeded:', {
        sessionId,
        status: response.status,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Network error occurred';

      console.error('Error deleting session:', {
        sessionId,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteSession, isDeleting };
}
