import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  User,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  LogOut,
  History,
  Heart,
  Settings,
  Bell
} from 'lucide-react';
import { Language, ThemeMode, UserProfile, Announcement } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  user: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  activeNav: string;
  onNavClick: (navId: string) => void;
  announcement?: Announcement | null;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  activeNav,
  onNavClick,
  announcement,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = translations[lang];

  const navItems = [
    { id: 'hero', label: t.navHome },
    { id: 'platforms', label: t.navPlatforms },
    { id: 'api', label: t.navApi },
    { id: 'faq', label: t.navFaq },
    { id: 'contact', label: t.navContact },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/10 bg-slate-950/70 transition-colors duration-300">
      {/* Announcement Bar if active */}
      {announcement && announcement.active && (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>{announcement.title}</span>
          {announcement.link && (
            <a
              href={announcement.link}
              className="underline font-bold hover:text-amber-200 transition-colors"
            >
              Detaylar →
            </a>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => onNavClick('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-11 h-11 rounded-2xl bg-slate-900 border border-white/20 flex items-center justify-center text-white shadow-xl">
                <Download className="w-6 h-6 text-blue-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  MediaStream
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider font-mono">
                CONVERTER & DOWNLOADER
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 relative ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md shadow-purple-900/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Lang, Theme, Admin, Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(lang === 'tr' ? 'en' : 'tr')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all hover:scale-105"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all hover:scale-105"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Admin Panel Quick Access */}
            <button
              onClick={onOpenAdmin}
              className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center gap-1.5 transition-all hover:shadow-lg hover:shadow-purple-900/40"
              title="Admin Kontrol Paneli"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.navAdmin}</span>
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-purple-400/50"
                  />
                  <span className="text-xs font-medium text-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-2 z-50 text-xs"
                    >
                      <div className="px-3 py-2.5 border-b border-white/10">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                          {user.plan}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>{t.navProfile}</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.historyTitle}</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>{t.favoritesTitle}</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-purple-400" />
                          <span>{t.navAdmin}</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t.navLogout}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
                >
                  {t.navLogin}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-purple-900/30 transition-all hover:scale-105"
                >
                  {t.navRegister}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onLanguageChange(lang === 'tr' ? 'en' : 'tr')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300"
            >
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl overflow-hidden px-4 py-6"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                    activeNav === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t.navAdmin}</span>
                </button>

                {user ? (
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{t.navProfile} ({user.name})</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        onOpenAuth('login');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                    >
                      {t.navLogin}
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth('register');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold"
                    >
                      {t.navRegister}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
