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
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios'>('android');

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

    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setActiveGuideTab('ios');
    }

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
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstalled(true);
          setTimeout(() => setDismissed(true), 2500);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
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
                    Uygulamayı telefonunuza yükleyip tam ekran ve hızlı modda kullanın.
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

      {/* Universal Installation Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 relative text-slate-100 shadow-2xl"
            >
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Mobil Ana Ekrana Ekle</h3>
                  <p className="text-xs text-slate-400">MediaStream'i cihazınıza 2 adımda kurun:</p>
                </div>
              </div>

              {/* OS Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4">
                <button
                  onClick={() => setActiveGuideTab('android')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeGuideTab === 'android'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📱 Android (Chrome / Brave)
                </button>
                <button
                  onClick={() => setActiveGuideTab('ios')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeGuideTab === 'ios'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🍎 iPhone / iPad (Safari)
                </button>
              </div>

              {/* Tab Content */}
              {activeGuideTab === 'android' ? (
                <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <p className="text-slate-300">
                      Tarayıcınızın sağ üst köşesindeki <strong>⋮ (Üç Nokta)</strong> menü simgesine dokunun.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <p className="text-slate-300">
                      Menüden <PlusSquare className="w-4 h-4 inline text-purple-400 mx-1" /> <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <p className="text-slate-300">
                      Açılan onay ekranında <strong>"Yükle" / "Ekle"</strong> butonuna basarak kısayol oluşturun.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <p className="text-slate-300">
                      Safari tarayıcısının altındaki <Share className="w-4 h-4 inline text-blue-400 mx-1" /> <strong>Paylaş</strong> simgesine dokunun.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <p className="text-slate-300">
                      Menüyü aşağı kaydırıp <PlusSquare className="w-4 h-4 inline text-emerald-400 mx-1" /> <strong>"Ana Ekrana Ekle"</strong> butonuna basın.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <p className="text-slate-300">
                      Sağ üstteki <strong>"Ekle"</strong> düğmesine dokunarak kurulumu tamamlayın.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    setInstalled(true);
                    setShowGuideModal(false);
                    setTimeout(() => setDismissed(true), 2000);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Anladım, Kurulumu Tamamladım</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

