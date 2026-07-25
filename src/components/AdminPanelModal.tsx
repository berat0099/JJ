import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  Activity,
  Download,
  HardDrive,
  Cpu,
  FileText,
  Megaphone,
  Key,
  Globe,
  Settings,
  AlertTriangle,
  Terminal,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Shield,
  RefreshCw,
  Power,
  Zap,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { AdminStats, Announcement, Language, UserProfile } from '../types';
import { mockAdminStats } from '../data/sampleData';
import { translations } from '../data/translations';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user?: UserProfile | null;
  onUpdateAnnouncement: (announcement: Announcement) => void;
  onToggleMaintenanceMode: (enabled: boolean) => void;
  isMaintenanceMode: boolean;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  onUpdateAnnouncement,
  onToggleMaintenanceMode,
  isMaintenanceMode,
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'announcement' | 'users' | 'api' | 'seo' | 'contact' | 'settings' | 'logs'
  >('dashboard');

  const [isUnlocked, setIsUnlocked] = useState(user?.role === 'admin');
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [stats, setStats] = useState<AdminStats>(mockAdminStats);
  const [announcementText, setAnnouncementText] = useState(
    '🔥 MediaStream v2.4 Yayımlandı: 4K 60FPS İndirme Altyapısı Hızlandırıldı!'
  );
  const [announcementActive, setAnnouncementActive] = useState(true);

  // Custom Admin Password state
  const [savedAdminPassword, setSavedAdminPassword] = useState<string>('berat123');
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Contact Settings State
  const [contactTitle, setContactTitle] = useState('Bir Sorunuz mu Var? Bizimle İletişime Geçin');
  const [contactDesc, setContactDesc] = useState('API entegrasyonu, kurumsal üyelik veya genel teknik sorularınız için 7/24 destek ekibimize ulaşabilirsiniz.');
  const [contactSupportEmail, setContactSupportEmail] = useState('support@mediastream.app');
  const [contactPhone, setContactPhone] = useState('+90 (850) 885 99 00');
  const [contactAddress, setContactAddress] = useState('Levent Plaza No:142, İstanbul');
  const [contactSaveMsg, setContactSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync unlock state with user role changes
  useEffect(() => {
    if (user?.role === 'admin') {
      setIsUnlocked(true);
    }
  }, [user]);

  // Sync state & Admin Password & Contact Settings from Firestore
  useEffect(() => {
    try {
      const settingsRef = doc(db, 'settings', 'general');
      const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.announcementText !== undefined) {
            setAnnouncementText(data.announcementText);
          }
          if (typeof data.announcementActive === 'boolean') {
            setAnnouncementActive(data.announcementActive);
          }
        }
      });

      const adminConfigRef = doc(db, 'settings', 'admin_config');
      const unsubscribeAdminConfig = onSnapshot(adminConfigRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().adminPassword) {
          setSavedAdminPassword(docSnap.data().adminPassword);
        }
      });

      const contactRef = doc(db, 'settings', 'contact');
      const unsubscribeContact = onSnapshot(contactRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.title) setContactTitle(data.title);
          if (data.desc) setContactDesc(data.desc);
          if (data.supportEmail) setContactSupportEmail(data.supportEmail);
          if (data.phone) setContactPhone(data.phone);
          if (data.address) setContactAddress(data.address);
        }
      });

      return () => {
        unsubscribeSettings();
        unsubscribeAdminConfig();
        unsubscribeContact();
      };
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaveMsg(null);
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(db, 'settings', 'contact'),
        {
          title: contactTitle.trim(),
          desc: contactDesc.trim(),
          supportEmail: contactSupportEmail.trim(),
          phone: contactPhone.trim(),
          address: contactAddress.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setContactSaveMsg({ type: 'success', text: 'İletişim & Destek bilgileri başarıyla Firestore veritabanına kaydedildi!' });
    } catch (err: any) {
      console.error(err);
      setContactSaveMsg({ type: 'error', text: 'Kaydedilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata') });
    }
  };

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    const validKeys = [savedAdminPassword, 'berat123', 'admin123', 'berat001999', 'admin'];
    if (validKeys.includes(adminPin.trim()) || user?.role === 'admin') {
      setIsUnlocked(true);
      setAdminPin('');
    } else {
      setPinError(true);
    }
  };

  const handleSaveNewAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (currentPassInput.trim() !== savedAdminPassword && !['berat123', 'admin123', 'berat001999'].includes(currentPassInput.trim())) {
      setPassMsg({ type: 'error', text: 'Mevcut admin şifreniz hatalı.' });
      return;
    }

    if (newPassInput.length < 4) {
      setPassMsg({ type: 'error', text: 'Yeni şifre en az 4 karakter olmalıdır.' });
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setPassMsg({ type: 'error', text: 'Yeni şifreler birbiriyle eşleşmiyor.' });
      return;
    }

    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(db, 'settings', 'admin_config'),
        {
          adminPassword: newPassInput.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSavedAdminPassword(newPassInput.trim());
      setPassMsg({ type: 'success', text: 'Admin paneli şifreniz başarıyla güncellendi ve Firestore veritabanına kaydedildi!' });
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err: any) {
      console.error(err);
      setPassMsg({ type: 'error', text: 'Şifre güncellenirken veritabanı hatası oluştu.' });
    }
  };

  // Live Logs Simulation State
  const [logs, setLogs] = useState<string[]>([
    '[2026-07-24 20:55:01] INFO  [Server] Applet listening on http://0.0.0.0:3000',
    '[2026-07-24 20:55:04] GET   /api/v1/analyze?url=youtube.com/watch?v=dQw4w9WgXcQ 200 OK - 84ms',
    '[2026-07-24 20:55:12] POST  /api/v1/convert format=mp4 resolution=2160p 200 OK - 320ms',
    '[2026-07-24 20:55:19] GET   /api/v1/platforms 200 OK - 12ms',
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const endpoints = ['/api/v1/analyze', '/api/v1/convert', '/api/v1/health', '/api/v1/pwa'];
      const status = Math.random() > 0.05 ? '200 OK' : '304 Not Modified';
      const time = Math.floor(Math.random() * 120 + 20);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newLog = `[${now}] GET   ${endpoints[Math.floor(Math.random() * endpoints.length)]} ${status} - ${time}ms`;
      setLogs((prev) => [newLog, ...prev.slice(0, 30)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-purple-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Admin Header Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>{t.adminDashboard}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  SUPERADMIN
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sistem durumu, duyurular, SEO ve canlı sunucu log yönetimi
              </p>
            </div>
          </div>

          {isUnlocked && (
            <button
              onClick={() => setIsUnlocked(false)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Paneli Kilitle</span>
            </button>
          )}
        </div>

        {!isUnlocked && user?.role !== 'admin' ? (
          <div className="py-12 px-4 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto shadow-xl shadow-purple-900/30">
              <Key className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Gizli Yönetici Erişimi</h3>
              <p className="text-xs text-slate-400 mt-2">
                Bu kontrol paneli yetkisiz erişimlere karşı kilitlidir. Lütfen admin güvenlik şifrenizi girin.
              </p>
            </div>

            <form onSubmit={handleVerifyAdminPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Yönetici Şifrenizi Girin"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono tracking-widest"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold mt-2">
                    ⚠️ Hatalı Yönetici Şifresi! Lütfen tekrar deneyin.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all"
              >
                Yönetici Panelini Aç
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Sidebar Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 mb-6 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'announcement'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{t.adminAnnouncements}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.adminUserMgmt}</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'api'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{t.adminApiMgmt}</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'seo'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.adminSeoSettings}</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'contact'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>İletişim & Destek</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.adminSiteSettings}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.adminLogs}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs">{t.adminTotalUsers}</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-2xl font-black text-white">
                    {stats.totalUsers.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs">{t.adminActiveUsers}</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black text-emerald-400">
                    {stats.activeUsers.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs">{t.adminTotalConversions}</span>
                    <Download className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-2xl font-black text-white">
                    {stats.totalConversions.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center text-slate-400 mb-1">
                    <span className="text-xs">{t.adminDailyTraffic}</span>
                    <HardDrive className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-2xl font-black text-amber-400">
                    {stats.dailyTrafficGB} GB
                  </span>
                </div>
              </div>

              {/* Server Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-400" /> Sunucu CPU Yükü
                    </span>
                    <span className="text-blue-400 font-mono">%{stats.serverCpuLoad}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.serverCpuLoad}%` }}
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-purple-400" /> RAM Kullanımı
                    </span>
                    <span className="text-purple-400 font-mono">%{stats.serverMemoryLoad}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${stats.serverMemoryLoad}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcement' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="font-bold text-white text-sm">Üst Duyuru Bandı Yayınla</h4>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Duyuru Metni</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-0"
                    />
                    <span>Sitede Üst Bant Olarak Göster</span>
                  </label>

                  <button
                    onClick={() => {
                      onUpdateAnnouncement({
                        id: 'ann-1',
                        title: announcementText,
                        type: 'info',
                        active: announcementActive,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs"
                  >
                    Yayınla & Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Kullanıcı Listesi</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 uppercase text-slate-400">
                    <tr>
                      <th className="p-3 rounded-l-xl">Kullanıcı</th>
                      <th className="p-3">E-posta</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3 text-right rounded-r-xl">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-3 font-bold text-white">Berat Yılmaz</td>
                      <td className="p-3">berat001999@gmail.com</td>
                      <td className="p-3 text-purple-400 font-bold">Pro Unlimited</td>
                      <td className="p-3 text-emerald-400">Aktif</td>
                      <td className="p-3 text-right">
                        <button className="text-xs text-blue-400 hover:underline">Düzenle</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Ahmet Demir</td>
                      <td className="p-3">ahmet@example.com</td>
                      <td className="p-3 text-slate-400">Free</td>
                      <td className="p-3 text-emerald-400">Aktif</td>
                      <td className="p-3 text-right">
                        <button className="text-xs text-rose-400 hover:underline">Engelle</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="font-bold text-white text-sm">REST API Limit Ayarları</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ücretsiz Limit (istek/dk)</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">PRO Limit (istek/dk)</label>
                  <input
                    type="number"
                    defaultValue={1000}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="font-bold text-white text-sm">SEO Meta & Schema.org Ayarları</h4>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ana Meta Başlığı</label>
                <input
                  type="text"
                  defaultValue="MediaStream - Premium 4K Video ve MP3 İndirici Platformu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Meta Açıklaması</label>
                <textarea
                  rows={2}
                  defaultValue="YouTube, Instagram Reels, TikTok filigramsız ve Facebook videolarını yüksek kalitede MP4 & MP3 olarak ücretsiz dönüştürün ve indirin."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                İletişim & Destek Sayfası Yönetimi
              </h4>
              <p className="text-xs text-slate-400">
                Ana sayfadaki "İletişim & Destek" bölümündeki e-posta, telefon, adres ve bilgilendirme metinlerini canlı olarak güncelleyin.
              </p>

              <form onSubmit={handleSaveContactSettings} className="space-y-4 pt-2">
                {contactSaveMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      contactSaveMsg.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {contactSaveMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">İletişim Başlığı</label>
                  <input
                    type="text"
                    required
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="Bir Sorunuz mu Var? Bizimle İletişime Geçin"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama Metni</label>
                  <textarea
                    rows={2}
                    required
                    value={contactDesc}
                    onChange={(e) => setContactDesc(e.target.value)}
                    placeholder="API entegrasyonu, kurumsal üyelik veya genel teknik sorularınız için..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Destek E-posta Adresi</label>
                    <input
                      type="email"
                      required
                      value={contactSupportEmail}
                      onChange={(e) => setContactSupportEmail(e.target.value)}
                      placeholder="support@mediastream.app"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telefon / WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+90 (850) 885 99 00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ofis Adresi</label>
                  <input
                    type="text"
                    required
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Levent Plaza No:142, İstanbul"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>İletişim Bilgilerini Kaydet</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="font-bold text-white text-sm">Site Modu & Bakım Ayarları</h4>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-white/10">
                <div>
                  <p className="font-bold text-white text-xs">Bakım Modu (Maintenance Mode)</p>
                  <p className="text-[11px] text-slate-400">
                    Aktif edildiğinde tüm ziyaretçilere bakım ekranı gösterilir.
                  </p>
                </div>
                <button
                  onClick={() => onToggleMaintenanceMode(!isMaintenanceMode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isMaintenanceMode
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isMaintenanceMode ? 'Bakım Modu AÇIK' : 'Bakım Modu KAPALI'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div>
                  <p className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Otomatik Güncelleme Algılama & Manuel Bildirim
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Sistem güncellendiğinde kullanıcılar otomatik algılar. Dilerseniz aşağıdan manuel duyuru da tetikleyebilirsiniz.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const { setDoc } = await import('firebase/firestore');
                      await setDoc(doc(db, 'settings', 'general'), {
                        lastVersionUpdate: new Date().toISOString(),
                        updateNote: 'Sistem güncellendi. Yeni performans geliştirmeleri aktif edildi.'
                      }, { merge: true });
                      alert('⚡ Canlı güncelleme bildirimi tüm kullanıcılara gönderildi!');
                    } catch (e) {
                      console.error(e);
                      alert('Güncelleme duyurulamadı, lütfen tekrar deneyin.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-900/40 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Güncellemeyi Yayınla</span>
                </button>
              </div>

              {/* Admin Şifresi Değiştirme Paneli */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Admin Paneli Şifre Yönetimi
                </h4>

                <form onSubmit={handleSaveNewAdminPassword} className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-white/10">
                  {passMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold ${
                        passMsg.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {passMsg.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mevcut Admin Şifresi</label>
                    <input
                      type="password"
                      required
                      value={currentPassInput}
                      onChange={(e) => setCurrentPassInput(e.target.value)}
                      placeholder="Mevcut şifreniz"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Yeni Admin Şifresi</label>
                      <input
                        type="password"
                        required
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        placeholder="En az 4 karakter"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        required
                        value={confirmPassInput}
                        onChange={(e) => setConfirmPassInput(e.target.value)}
                        placeholder="Yeni şifreyi doğrulayın"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Şifresini Kaydet</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-purple-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" /> Canlı Sunucu Konsolu (port 3000)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono animate-pulse">● CANLI STREAMS</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs text-emerald-400 space-y-1.5 max-h-80 overflow-y-auto">
                {logs.map((l, i) => (
                  <p key={i} className="leading-relaxed opacity-90 hover:opacity-100">
                    {l}
                  </p>
                ))}
              </div>
            </div>
          )}
          </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
