import React from 'react';
import AddTrade from '@/pages/AddTrade';
import { Trade } from '@/types';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCreated: (savedTrade: Trade) => void;
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onTradeCreated
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto p-4 sm:p-6">
        <AddTrade
          isModal={true}
          onSuccess={(savedTrade) => {
            onTradeCreated(savedTrade);
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
