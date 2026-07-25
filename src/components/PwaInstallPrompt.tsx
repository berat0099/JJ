import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface PwaInstallPromptProps {
  lang: Language;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ lang }) => {
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  if (dismissed) return null;

  const handleInstall = () => {
    setInstalled(true);
    setTimeout(() => {
      setDismissed(true);
    }, 2500);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-xs w-full pointer-events-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-4 rounded-2xl bg-slate-900/95 border border-purple-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>

          {installed ? (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold py-1">
              <CheckCircle2 className="w-5 h-5" />
              <span>MediaStream Uygulaması Yüklendi!</span>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">PWA Mobil Uygulaması</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Anında erişim için ana ekranınıza ekleyin.
                </p>
                <button
                  onClick={handleInstall}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Uygulamayı Yükle</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
