import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resumeTitle: string;
}

export const DeleteResumeModal: React.FC<DeleteResumeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  resumeTitle,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Resume"
      description={`Are you sure you want to permanently delete "${resumeTitle}"? This action cannot be undone.`}
      maxWidth="sm"
    >
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Delete Resume
        </Button>
      </div>
    </Modal>
  );
};
