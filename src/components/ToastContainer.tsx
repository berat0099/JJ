import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 text-sm text-white ${
                isSuccess
                  ? 'bg-emerald-950/80 border-emerald-500/40 shadow-emerald-950/50'
                  : isError
                  ? 'bg-rose-950/80 border-rose-500/40 shadow-rose-950/50'
                  : isWarning
                  ? 'bg-amber-950/80 border-amber-500/40 shadow-amber-950/50'
                  : 'bg-slate-900/90 border-blue-500/40 shadow-blue-950/50'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white leading-tight">{toast.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
