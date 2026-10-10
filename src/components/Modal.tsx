import React from 'react';

export interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};
