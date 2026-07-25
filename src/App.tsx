import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroAnalyzer } from './components/HeroAnalyzer';
import { AnalysisResult } from './components/AnalysisResult';
import { SupportedPlatforms } from './components/SupportedPlatforms';
import { FeaturesGrid } from './components/FeaturesGrid';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { ApiDocsSection } from './components/ApiDocsSection';
import { UserAuthModal } from './components/UserAuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SeoSchemaInspector } from './components/SeoSchemaInspector';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { UpdateNotification } from './components/UpdateNotification';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import {
  Language,
  ThemeMode,
  UserProfile,
  MediaAnalysisResult,
  ToastMessage,
  Announcement
} from './types';
import { mockSampleMedia, mockUserProfile } from './data/sampleData';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('tr');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mediastream_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [analyzedMedia, setAnalyzedMedia] = useState<MediaAnalysisResult | null>(
    mockSampleMedia.youtube
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [seoInspectorOpen, setSeoInspectorOpen] = useState(false);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>({
    id: 'ann-1',
    title: '🔥 MediaStream v2.4 Yayımlandı: 4K 60FPS & 320kbps MP3 Dönüştürücü Aktif!',
    type: 'info',
    active: true,
  });

  // Real-time Firestore synchronization for Admin settings & announcements
  React.useEffect(() => {
    try {
      const settingsRef = doc(db, 'settings', 'general');
      const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.isMaintenanceMode === 'boolean') {
            setIsMaintenanceMode(data.isMaintenanceMode);
          }
          if (data.announcementText !== undefined) {
            setAnnouncement({
              id: 'ann-1',
              title: data.announcementText || '',
              type: 'info',
              active: !!data.announcementActive,
            });
          }
        }
      }, (error) => {
        console.warn('Firestore onSnapshot error:', error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAnalyzeUrl = async (url: string) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Sunucu analizi başarısız oldu');
      }

      const resultMedia: MediaAnalysisResult = await response.json();

      setAnalyzedMedia(resultMedia);
      addToast('success', 'Analiz Tamamlandı!', `${resultMedia.platform} bağlantısı başarıyla çözümlendi.`);

      setTimeout(() => {
        const el = document.getElementById('analysis-result');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      addToast('error', 'Analiz Hatası', 'Sunucu ile bağlantı kurulamadı veya geçersiz bir URL girildi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    const el = document.getElementById(navId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`${theme} min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white transition-colors duration-300`}>
      {/* Maintenance Mode Overlay */}
      {isMaintenanceMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-4 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white">Sistem Bakım Modunda</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md">
            MediaStream sunucularında planlı 4K dönüştürücü altyapı güncellemesi yapılmaktadır. Lütfen birkaç dakika sonra tekrar deneyin.
          </p>
          <button
            onClick={() => setIsMaintenanceMode(false)}
            className="mt-6 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
          >
            Bakım Modunu Kapat (Admin Demosu)
          </button>
        </div>
      )}

      {/* Main App Layout */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        user={user}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onLogout={() => {
          setUser(null);
          try {
            localStorage.removeItem('mediastream_active_user');
          } catch (e) {
            console.error(e);
          }
          addToast('info', 'Çıkış Yapıldı', 'Hesabınızdan güvenle çıkış yaptınız.');
        }}
        activeNav={activeNav}
        onNavClick={handleNavClick}
        announcement={announcement}
      />

      <main className="space-y-4">
        {/* Hero Section with URL Analyzer */}
        <HeroAnalyzer
          lang={lang}
          onAnalyze={handleAnalyzeUrl}
          isAnalyzing={isAnalyzing}
        />

        {/* Media Analysis Result */}
        {analyzedMedia && (
          <AnalysisResult
            media={analyzedMedia}
            lang={lang}
            onSaveFavorite={() => {
              addToast('success', 'Favorilere Eklendi', 'Bu bağlantı favori listenize kaydedildi.');
            }}
          />
        )}

        {/* Feature Highlights Grid */}
        <FeaturesGrid lang={lang} />

        {/* Supported Platforms */}
        <SupportedPlatforms
          lang={lang}
          onSelectPlatform={(pName) => {
            addToast('info', `${pName} Seçildi`, `Bağlantınızı yapıştırarak ${pName} içeriklerini 4K indirebilirsiniz.`);
            handleNavClick('hero');
          }}
        />

        {/* FAQ Section */}
        <FaqSection lang={lang} />

        {/* Contact Section */}
        <ContactSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onNavClick={handleNavClick}
        onOpenSeoInspector={() => setSeoInspectorOpen(true)}
      />

      {/* Modals & Overlays */}
      <UserAuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        lang={lang}
        onLoginSuccess={(newUser) => {
          setUser(newUser);
          try {
            localStorage.setItem('mediastream_active_user', JSON.stringify(newUser));
          } catch (e) {
            console.error(e);
          }
          addToast('success', 'Hoş Geldiniz!', `${newUser.name} olarak başarıyla giriş yaptınız.`);
        }}
      />

      {user && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          lang={lang}
        />
      )}

      <AdminPanelModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        lang={lang}
        user={user}
        onUpdateAnnouncement={async (ann) => {
          setAnnouncement(ann);
          try {
            await setDoc(doc(db, 'settings', 'general'), {
              announcementText: ann.title,
              announcementActive: ann.active,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            addToast('success', 'Duyuru Canlıya Alındı', 'Duyuru tüm kullanıcıların ekranında anlık güncellendi.');
          } catch (e) {
            console.error(e);
            addToast('success', 'Duyuru Güncellendi', 'Duyuru yerel olarak yayına alındı.');
          }
        }}
        onToggleMaintenanceMode={async (val) => {
          setIsMaintenanceMode(val);
          try {
            await setDoc(doc(db, 'settings', 'general'), {
              isMaintenanceMode: val,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            addToast('warning', 'Bakım Modu Değiştirildi', `Bakım modu ${val ? 'AKTİF edildi' : 'KAPATILDI'}. Tüm ziyaretçilerin ekranına anlık yansıdı.`);
          } catch (e) {
            console.error(e);
            addToast('warning', 'Bakım Modu Değiştirildi', `Bakım modu ${val ? 'aktif edildi' : 'kapatıldı'}.`);
          }
        }}
        isMaintenanceMode={isMaintenanceMode}
      />

      {/* PWA Floating Banner, Update Notification & Toast System */}
      <UpdateNotification />
      <PwaInstallPrompt lang={lang} />
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
