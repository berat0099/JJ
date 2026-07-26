import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  History,
  Heart,
  Bell,
  Key,
  Shield,
  Download,
  Trash2,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Sparkles,
  LogOut
} from 'lucide-react';
import { UserProfile, DownloadHistoryItem, FavoriteItem, Language } from '../types';
import { translations } from '../data/translations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  lang: Language;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'favorites' | 'notifications' | 'api'>('profile');
  const [copiedKey, setCopiedKey] = useState(false);
  const t = translations[lang];

  const userKeyHistory = user ? `mediastream_history_${user.id || user.email}` : null;
  const userKeyFavorites = user ? `mediastream_favorites_${user.id || user.email}` : null;

  const [historyItems, setHistoryItems] = useState<DownloadHistoryItem[]>([]);
  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);

  React.useEffect(() => {
    if (user && isOpen) {
      try {
        const savedHistory = userKeyHistory ? localStorage.getItem(userKeyHistory) : null;
        setHistoryItems(savedHistory ? JSON.parse(savedHistory) : []);

        const savedFavs = userKeyFavorites ? localStorage.getItem(userKeyFavorites) : null;
        setFavoritesList(savedFavs ? JSON.parse(savedFavs) : []);
      } catch (e) {
        setHistoryItems([]);
        setFavoritesList([]);
      }
    }
  }, [user, isOpen, userKeyHistory, userKeyFavorites]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    setHistoryItems([]);
    if (userKeyHistory) {
      localStorage.setItem(userKeyHistory, JSON.stringify([]));
    }
  };

  const handleRemoveFavorite = (favId: string) => {
    const updated = favoritesList.filter((f) => f.id !== favId);
    setFavoritesList(updated);
    if (userKeyFavorites) {
      localStorage.setItem(userKeyFavorites, JSON.stringify(updated));
    }
  };

  const copyApiKey = () => {
    if (user.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Summary Bar */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-extrabold shadow-sm">
                {user.plan}
              </span>
              <span className="text-[10px] text-slate-400">Üyelik: {user.joinedDate}</span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          )}
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Genel Bakış</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.historyTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'favorites'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t.favoritesTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'notifications'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t.notificationsTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'api'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Anahtarları</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-white">{user.totalDownloads}</span>
                  <span className="block text-[11px] text-slate-400 mt-1">Toplam İndirme</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-purple-400">{user.bandwidthUsed}</span>
                  <span className="block text-[11px] text-slate-400 mt-1">Kullanılan Bant Genişliği</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
                  <span className="text-2xl font-black text-emerald-400">Sınırsız</span>
                  <span className="block text-[11px] text-slate-400 mt-1">Günlük 4K İndirme Limiti</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-purple-500/30">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Pro Ayrıcalıklarınız Aktif
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Sırasız ultra hızlı indirme, filigramsız TikTok/Reels dönüştürme ve stüdyo kalitesinde 320kbps MP3 çıkarma paketinizde tanımlıdır.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-medium">Son İndirilen Medyalar</span>
                {historyItems.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.clearHistoryBtn}</span>
                  </button>
                )}
              </div>

              {historyItems.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">{t.noHistory}</p>
              ) : (
                historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-xs truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.platform} • <span className="text-amber-400">{item.quality}</span> • {item.size}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {favoritesList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">{t.noFavorites}</p>
              ) : (
                favoritesList.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3"
                  >
                    <img
                      src={fav.thumbnail}
                      alt={fav.title}
                      className="w-16 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-xs truncate">{fav.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fav.platform} • Eklenme: {fav.addedAt}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Bell className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Sistem Güncellemesi v2.4 Yayımlandı</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    TikTok filigramsız indirme sunucuları %40 hızlandırıldı ve 4K YouTube HDR dönüştürücü güncellendi.
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Bugün 12:00</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Geliştirici REST API Gizli Anahtarı
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={user.apiKey || 'ms_live_sk_9832104928301928409182309'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-purple-300"
                  />
                  <button
                    onClick={copyApiKey}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Bu anahtar ile günlük 10,000 medya analiz sorgusunu programatik olarak çalıştırabilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
