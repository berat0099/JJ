import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';

interface UserAuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (user: UserProfile) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  lang,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Check admin credentials or role
      const isAdminUser = cleanEmail === 'berat001999@gmail.com' || password === 'berat123' || password === 'admin123';

      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Lütfen adınızı ve soyadınızı girin.');
          return;
        }
        if (password.length < 4) {
          setErrorMessage('Şifreniz en az 4 karakter olmalıdır.');
          return;
        }

        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          avatar: isAdminUser
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          role: isAdminUser ? 'admin' : 'user',
          plan: isAdminUser ? 'Pro Unlimited' : 'Free',
          joinedDate: 'Bugün',
          totalDownloads: 0,
          bandwidthUsed: '0 GB',
          apiKey: 'ms_live_sk_' + Math.random().toString(36).substring(2, 15),
        };

        // Save registered user
        try {
          const existing = JSON.parse(localStorage.getItem('mediastream_users') || '[]');
          localStorage.setItem('mediastream_users', JSON.stringify([...existing, { ...newUser, password }]));
        } catch (e) {
          console.error(e);
        }

        onLoginSuccess(newUser);
        onClose();
      } else if (mode === 'login') {
        if (isAdminUser) {
          const adminUser: UserProfile = {
            id: 'usr-admin-1',
            name: name || 'Berat Yılmaz (Admin)',
            email: cleanEmail || 'berat001999@gmail.com',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            role: 'admin',
            plan: 'Pro Unlimited',
            joinedDate: '15 Mart 2025',
            totalDownloads: 342,
            bandwidthUsed: '84.6 GB',
            apiKey: 'ms_live_sk_9832104928301928409182309',
          };
          onLoginSuccess(adminUser);
          onClose();
        } else {
          // Standard login check
          let matchedUser: UserProfile | null = null;
          try {
            const existing = JSON.parse(localStorage.getItem('mediastream_users') || '[]');
            const found = existing.find((u: any) => u.email === cleanEmail && u.password === password);
            if (found) {
              const { password: _, ...profile } = found;
              matchedUser = profile;
            }
          } catch (e) {
            console.error(e);
          }

          if (matchedUser) {
            onLoginSuccess(matchedUser);
            onClose();
          } else {
            // Default login creation for demo if user enters standard details
            const defaultUser: UserProfile = {
              id: `usr-${Math.floor(Math.random() * 9000 + 1000)}`,
              name: cleanEmail.split('@')[0] || 'Kullanıcı',
              email: cleanEmail,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: 'user',
              plan: 'Free',
              joinedDate: 'Bugün',
              totalDownloads: 1,
              bandwidthUsed: '0.1 GB',
              apiKey: 'ms_live_sk_' + Math.random().toString(36).substring(2, 15),
            };
            onLoginSuccess(defaultUser);
            onClose();
          }
        }
      } else if (mode === 'forgot') {
        setSuccessMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-900/40 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-white">
            {mode === 'login' && t.loginTitle}
            {mode === 'register' && t.registerTitle}
            {mode === 'forgot' && t.forgotPasswordTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            MediaStream hesabınızla tüm 4K dönüştürme geçmişinizi senkronize edin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span>✅ {successMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.nameLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t.passwordLabel}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    {t.forgotPassLink}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && t.navLogin}
                  {mode === 'register' && t.navRegister}
                  {mode === 'forgot' && 'Sıfırlama Bağlantısı Gönder'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Simulation Button */}
        {mode !== 'forgot' && (
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>{t.btnGoogleLogin}</span>
            </button>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              {t.noAccountText}{' '}
              <button
                onClick={() => setMode('register')}
                className="text-purple-400 font-bold hover:underline"
              >
                {t.navRegister}
              </button>
            </p>
          ) : (
            <p>
              {t.hasAccountText}{' '}
              <button
                onClick={() => setMode('login')}
                className="text-purple-400 font-bold hover:underline"
              >
                {t.navLogin}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
