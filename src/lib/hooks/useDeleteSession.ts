'use client';

import { useState } from 'react';

export function useDeleteSession() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteSession, isDeleting };
}
