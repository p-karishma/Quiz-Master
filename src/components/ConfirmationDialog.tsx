import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-transform"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isDestructive 
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all cursor-pointer min-h-[44px] ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 active:scale-95'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
