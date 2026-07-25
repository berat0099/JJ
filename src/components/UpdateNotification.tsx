import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X, Zap } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const UpdateNotification: React.FC = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [versionNote, setVersionNote] = useState<string>('Sistem performansı ve yeni indirme modülleri güncellendi.');
  const initialLoadTime = useRef(Date.now());
  const initialBuildIdRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Fetch initial server build version
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.buildId) {
          initialBuildIdRef.current = data.buildId;
        }
      })
      .catch((e) => console.warn('Version check error:', e));

    // Polling server /api/version every 15 seconds for automatic deployment detection
    const versionInterval = setInterval(() => {
      fetch('/api/version')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.buildId) {
            if (initialBuildIdRef.current === null) {
              initialBuildIdRef.current = data.buildId;
            } else if (data.buildId !== initialBuildIdRef.current) {
              setVersionNote('Siteye yeni güncelleme yayınlandı! Sistem otomatik güncelleniyor.');
              setShowUpdatePrompt(true);
            }
          }
        })
        .catch(() => {});
    }, 15000);

    // 1. Real-time Firestore sync for remote version updates
    let unsubscribe: () => void = () => {};
    try {
      const settingsRef = doc(db, 'settings', 'general');
      unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const lastUpdateAt = data.lastVersionUpdate ? new Date(data.lastVersionUpdate).getTime() : 0;
          
          // Trigger if an update was published AFTER this client opened the page
          if (lastUpdateAt > initialLoadTime.current + 2000) {
            if (data.updateNote) {
              setVersionNote(data.updateNote);
            }
            setShowUpdatePrompt(true);
          }
        }
      });
    } catch (e) {
      console.warn('Update listener error:', e);
    }

    // 2. Service Worker controller change (PWA background update detection)
    const handleSwUpdate = () => {
      setShowUpdatePrompt(true);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSwUpdate);
    }

    return () => {
      clearInterval(versionInterval);
      unsubscribe();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSwUpdate);
      }
    };
  }, []);

  // 5-second countdown auto-reload timer
  useEffect(() => {
    if (showUpdatePrompt) {
      setCountdown(5);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showUpdatePrompt]);

  const handleManualReload = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowUpdatePrompt(false);
  };

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className="p-4 rounded-2xl bg-slate-900/95 border-2 border-purple-500/70 backdrop-blur-2xl shadow-2xl shadow-purple-900/50 text-slate-100 relative overflow-hidden"
          >
            {/* Top glowing progress bar showing 5s countdown */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-950">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400"
              />
            </div>

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-500 text-white shrink-0 shadow-lg shadow-purple-600/30 animate-pulse">
                <Zap className="w-6 h-6" />
              </div>

              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Yeni Sürüm
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold font-mono">
                    {countdown}s içinde yenilenecek
                  </span>
                </div>

                <h4 className="font-extrabold text-white text-sm mt-1">
                  ⚡ Yeni Güncelleme Mevcut!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  {versionNote} Lütfen yeni özellikleri kullanmak için sayfayı yenileyin.
                </p>

                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    onClick={handleManualReload}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-purple-900/40 flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Şimdi Yenile ({countdown}s)</span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs transition-colors"
                  >
                    Daha Sonra
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
