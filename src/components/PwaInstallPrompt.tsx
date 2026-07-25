import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, CheckCircle2, Share, PlusSquare } from 'lucide-react';
import { Language } from '../types';

interface PwaInstallPromptProps {
  lang: Language;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check iOS user agent
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setDismissed(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => setDismissed(true), 2500);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback for browsers without direct prompt trigger: show instructions
      alert('Mobil cihazınızın veya tarayıcınızın menüsünden "Ana Ekrana Ekle" veya "Uygulamayı Yükle" seçeneğine dokunun.');
    }
  };

  return (
    <>
      <div className="fixed bottom-5 left-5 z-40 max-w-sm w-full pointer-events-auto px-2 sm:px-0">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="p-4 rounded-2xl bg-slate-900/95 border border-purple-500/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden ring-1 ring-purple-500/30"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            {installed ? (
              <div className="flex items-center gap-3 text-emerald-400 text-xs font-bold py-1">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>MediaStream Mobil Uygulaması Yüklendi!</span>
              </div>
            ) : (
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shrink-0 mt-0.5 shadow-lg shadow-purple-600/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="pr-4">
                  <h4 className="font-bold text-white text-xs sm:text-sm">MediaStream PWA Mobil</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Uygulamayı telefonunuza yükleyip tam ekran ve internetsiz modda kullanın.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-purple-900/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Uygulamayı Telefona Yükle</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 relative text-slate-100 shadow-2xl"
            >
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">iPhone / iPad Yükleme</h3>
                  <p className="text-xs text-slate-400">Safari tarayıcısında 2 basit adım:</p>
                </div>
              </div>

              <div className="space-y-3 my-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <p className="text-slate-300">
                    Ekranın altındaki <Share className="w-4 h-4 inline text-blue-400 mx-1" /> <strong>Paylaş</strong> ikonuna dokunun.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <p className="text-slate-300">
                    Menüyü kaydırıp <PlusSquare className="w-4 h-4 inline text-emerald-400 mx-1" /> <strong>Ana Ekrana Ekle</strong> seçeneğini seçin.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
              >
                Anladım
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

