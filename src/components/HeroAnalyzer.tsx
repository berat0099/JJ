import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Sparkles,
  Clipboard,
  Zap,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface HeroAnalyzerProps {
  lang: Language;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export const HeroAnalyzer: React.FC<HeroAnalyzerProps> = ({ lang, onAnalyze, isAnalyzing }) => {
  const [inputUrl, setInputUrl] = useState('');
  const t = translations[lang];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
      }
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    setInputUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyze(inputUrl.trim());
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-20 overflow-hidden">
      {/* Background Animated Gradient Blobs & Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/30 via-purple-600/30 to-pink-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-blue-600/15 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs font-semibold text-blue-300 shadow-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{t.heroTag}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </motion.div>

        {/* Main Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-10 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Video ve Ses Dosyalarınızı{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Hızlıca Hazırlayın
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Bağlantınızı yapıştırın ve mevcut format seçeneklerini görüntüleyin.
          </p>
        </motion.div>

        {/* Central Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group"
        >
          {/* Glowing Outline */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />

          <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* URL Input Row */}
              <div className="relative flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <Search className="w-5 h-5 text-blue-400" />
                  </div>

                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    required
                    className="w-full pl-12 pr-24 py-4 sm:py-5 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  />

                  {/* Clear & Paste Quick Buttons inside input */}
                  <div className="absolute right-3 flex items-center gap-1.5">
                    {inputUrl && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Clear"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-all"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{t.btnPaste}</span>
                    </button>
                  </div>
                </div>

                {/* Analyze Action Button */}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-purple-900/40 hover:shadow-purple-900/70 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.btnAnalyzing}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <span>{t.btnAnalyze}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Badges footer inside hero card */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-white/5 pt-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>%100 Güvenli & SSL Şifreli</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Anında Cihaza İndirme</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>4K / 60FPS & 320kbps MP3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
