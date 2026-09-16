import React from 'react';
import { AITutorView } from './AITutorView';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = ''
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <AITutorView 
          initialPrompt={initialPrompt}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
