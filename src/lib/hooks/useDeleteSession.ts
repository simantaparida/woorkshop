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

        console.error('Delete failed:', errorMessage, {
          sessionId,
          status: response.status,
          statusText: response.statusText,
        });

        return {
          success: false,
          error: errorMessage
        };
      }

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
