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
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { SeoSchemaInspector } from './components/SeoSchemaInspector';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { UpdateNotification } from './components/UpdateNotification';
import { DiagnosticConsole } from './components/DiagnosticConsole';

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
import { ShieldAlert, RefreshCw, AlertTriangle, Terminal } from 'lucide-react';

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
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [seoInspectorOpen, setSeoInspectorOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requiredPremiumFeature, setRequiredPremiumFeature] = useState<'4k' | '2k' | '320kbps' | 'general'>('general');

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
    setAnalysisError(null);
    setLastAnalyzedUrl(url);

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
      const errMsg = 'YouTube sunucu IP doğrulaması engeline takıldı veya ağ kısıtlaması yaşandı.';
      setAnalysisError(errMsg);
      addToast('error', 'Analiz Hatası', errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleFavorite = (media: MediaAnalysisResult) => {
    if (!user) {
      addToast('info', 'Giriş Yapın', 'Bağlantıları favorilerinize eklemek için lütfen giriş yapın.');
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    try {
      const userKey = `mediastream_favorites_${user.id || user.email}`;
      const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
      const alreadyFav = existing.some((f: any) => f.url === media.url || f.id === media.id);

      if (alreadyFav) {
        const filtered = existing.filter((f: any) => f.url !== media.url && f.id !== media.id);
        localStorage.setItem(userKey, JSON.stringify(filtered));
        addToast('info', 'Favorilerden Çıkarıldı', 'Bu bağlantı favorilerinizden kaldırıldı.');
      } else {
        const newFav = {
          id: `fav-${Date.now()}`,
          url: media.url,
          title: media.title,
          platform: media.platform,
          thumbnail: media.thumbnail,
          addedAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        };
        localStorage.setItem(userKey, JSON.stringify([newFav, ...existing]));
        addToast('success', 'Favorilere Eklendi', 'Bu bağlantı favori listenize kaydedildi.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);

    if (navId === 'diagnostic') {
      if (user?.role === 'admin') {
        setDiagnosticModalOpen(true);
      }
      return;
    }

    const el = document.getElementById(navId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
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

        {/* Analysis Error & Diagnostic Banner */}
        {analysisError && (
          <div className="max-w-4xl mx-auto px-4 my-6">
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold block text-sm text-white">YouTube / Platform Bağlantı Uyarısı</span>
                  <span className="text-xs text-rose-300 leading-relaxed">{analysisError}</span>
                </div>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setDiagnosticModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-colors flex items-center gap-2 shrink-0 shadow-lg"
                >
                  <Terminal className="w-4 h-4" />
                  <span>🔍 Ağ Teşhis Konsolunu Çalıştır</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Media Analysis Result */}
        {analyzedMedia && (
          <AnalysisResult
            media={analyzedMedia}
            lang={lang}
            user={user}
            onSaveFavorite={handleToggleFavorite}
            onOpenDiagnosticConsole={user?.role === 'admin' ? () => setDiagnosticModalOpen(true) : undefined}
            onOpenPremiumModal={(feat) => {
              setRequiredPremiumFeature(feat);
              setUpgradeModalOpen(true);
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

        {/* API Docs Section - ONLY Visible to Admin */}
        {user?.role === 'admin' && <ApiDocsSection lang={lang} />}

        {/* Contact Section */}
        <ContactSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        user={user}
        onNavClick={handleNavClick}
        onOpenSeoInspector={() => setSeoInspectorOpen(true)}
        onOpenDiagnosticConsole={user?.role === 'admin' ? () => setDiagnosticModalOpen(true) : undefined}
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
          onLogout={() => {
            setUser(null);
            try {
              localStorage.removeItem('mediastream_active_user');
            } catch (e) {
              console.error(e);
            }
            addToast('info', 'Çıkış Yapıldı', 'Hesabınızdan güvenle çıkış yaptınız.');
          }}
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

      <PremiumUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requiredFeature={requiredPremiumFeature}
        lang={lang}
        user={user}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onUpgradeSuccess={(newPlan) => {
          if (user) {
            const updated = { ...user, plan: newPlan };
            setUser(updated);
            try {
              localStorage.setItem('mediastream_active_user', JSON.stringify(updated));
            } catch (e) {
              console.error(e);
            }
          }
          addToast('success', '👑 Tebrikler! Üyeliğiniz Yükseltildi', `${newPlan} paketine başarıyla geçiş yaptınız! Sınırsız 4K ve 320kbps indirmeler aktif.`);
        }}
      />

      {/* PWA Floating Banner, Diagnostic Console, Update Notification & Toast System */}
      {user?.role === 'admin' && (
        <DiagnosticConsole
          isOpen={diagnosticModalOpen}
          onClose={() => setDiagnosticModalOpen(false)}
          onRetryAnalysis={() => {
            if (lastAnalyzedUrl) {
              handleAnalyzeUrl(lastAnalyzedUrl);
            }
          }}
        />
      )}
      <UpdateNotification />
      <PwaInstallPrompt lang={lang} />
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
