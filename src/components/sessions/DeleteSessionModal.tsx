'use client';

import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionTitle: string;
  participantCount: number;
  isDeleting: boolean;
}

export function DeleteSessionModal({
  isOpen,
  onClose,
  onConfirm,
  sessionTitle,
  participantCount,
  isDeleting,
}: DeleteSessionModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Session?"
      message={`Are you sure you want to delete "${sessionTitle}"? This will permanently remove all data including ${participantCount} participant${participantCount !== 1 ? 's' : ''}, votes/statements, and results. This action cannot be undone.`}
      confirmText="Delete Session"
      cancelText="Cancel"
      isLoading={isDeleting}
      type="danger"
    />
  );
}
