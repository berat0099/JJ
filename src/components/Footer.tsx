import React from 'react';
import { Download, Globe, Heart, Shield, Terminal, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  lang: Language;
  onNavClick: (navId: string) => void;
  onOpenSeoInspector: () => void;
  onOpenDiagnosticConsole?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavClick, onOpenSeoInspector, onOpenDiagnosticConsole }) => {
  const t = translations[lang];

  return (
    <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-12 text-slate-400 text-xs relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div
              onClick={() => onNavClick('hero')}
              className="flex items-center gap-3 cursor-pointer inline-flex"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">MediaStream</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {t.aboutDesc}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm">{t.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavClick('hero')} className="hover:text-white transition-colors">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('platforms')} className="hover:text-white transition-colors">
                  {t.navPlatforms}
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('faq')} className="hover:text-white transition-colors">
                  {t.navFaq}
                </button>
              </li>
              {onOpenDiagnosticConsole && (
                <li>
                  <button
                    onClick={onOpenDiagnosticConsole}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Ağ & Teşhis Konsolu</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-white text-sm">{t.legalLinks}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#contact" onClick={() => onNavClick('contact')} className="hover:text-white transition-colors">
                  {t.navContact}
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  {t.privacyPolicy}
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  {t.termsOfService}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} MediaStream Inc. {t.allRightsReserved}</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Modern Glassmorphism Design</span>
            <span>•</span>
            <span className="text-purple-400">React + Next.js + Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
