import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface SafeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemsToDelete: string[];
  itemsPreserved?: string[];
  expectedConfirmationText: string;
  confirmButtonLabel?: string;
}

export function SafeDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemsToDelete,
  itemsPreserved,
  expectedConfirmationText,
  confirmButtonLabel = 'Permanently Delete'
}: SafeDeleteModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = typedConfirmation.trim() === expectedConfirmationText.trim();

  const handleExecute = async () => {
    if (!isConfirmed || isDeleting) return;
    setError(null);
    try {
      setIsDeleting(true);
      await onConfirm();
      setTypedConfirmation('');
      onClose();
    } catch (err: any) {
      console.error('Safe delete failed:', err);
      setError(err.message || 'Failed to delete data. Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{description}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Scope list */}
          <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-2">
            <div>
              <span className="font-semibold text-red-700 dark:text-red-400 block mb-1">Scope of Deletion:</span>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                {itemsToDelete.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {itemsPreserved && itemsPreserved.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-green-700 dark:text-green-400 block mb-1">What remains safe:</span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                  {itemsPreserved.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="delete-confirm-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              To proceed, please type <span className="font-mono bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">{expectedConfirmationText}</span> below:
            </Label>
            <Input
              id="delete-confirm-input"
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={expectedConfirmationText}
              className="font-mono text-sm"
              disabled={isDeleting}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTypedConfirmation('');
                setError(null);
                onClose();
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecute}
              disabled={!isConfirmed || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                confirmButtonLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
