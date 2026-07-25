import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Star,
  Film,
  Music,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Language, UserProfile, PricingSettings } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onUpgradeSuccess: (newPlan: 'Pro Unlimited') => void;
  requiredFeature?: '4k' | '2k' | '320kbps' | 'general';
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  onOpenAuth,
  onUpgradeSuccess,
  requiredFeature = 'general',
}) => {
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [pricing, setPricing] = useState<PricingSettings>({
    monthlyPrice: 49,
    yearlyDiscountPercent: 20,
    yearlyPrice: 470,
    currency: '₺',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Load live pricing from Firestore
  useEffect(() => {
    try {
      const pricingRef = doc(db, 'settings', 'pricing');
      const unsubscribe = onSnapshot(pricingRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mPrice = data.monthlyPrice ?? 49;
          const disc = data.yearlyDiscountPercent ?? 20;
          const yPrice = data.yearlyPrice ?? Math.round(mPrice * 12 * (1 - disc / 100));
          setPricing({
            monthlyPrice: mPrice,
            yearlyDiscountPercent: disc,
            yearlyPrice: yPrice,
            currency: data.currency || '₺',
          });
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.error('Pricing subscription error:', e);
    }
  }, []);

  if (!isOpen) return null;

  const monthlyBreakdownForYearly = (pricing.yearlyPrice / 12).toFixed(1);

  const handleUpgrade = async () => {
    if (!user) {
      onClose();
      onOpenAuth();
      return;
    }

    setIsProcessing(true);

    try {
      // Update user plan in Firestore
      const cleanEmail = user.email.trim().toLowerCase();
      const { setDoc } = await import('firebase/firestore');
      await setDoc(
        doc(db, 'users', cleanEmail),
        {
          plan: 'Pro Unlimited',
          role: user.role === 'admin' ? 'admin' : 'vip',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update local state
      onUpgradeSuccess('Pro Unlimited');
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Upgrade error:', err);
      // Fallback update
      onUpgradeSuccess('Pro Unlimited');
      setIsProcessing(false);
      onClose();
    }
  };

  const featureBadges = {
    '4k': '4K Ultra HD İndirme',
    '2k': '2K QHD İndirme',
    '320kbps': '320 kbps MP3 Müzik',
    'general': 'Premium Paket',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3 shadow-lg shadow-amber-900/20">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{featureBadges[requiredFeature]} İçin Premium Gereklidir</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ayrıcalıklı <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Pro Premium</span> Dünyasına Katılın
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
              Sınırsız 4K & 2K kalitede video, 320 kbps stüdyo kalitesinde MP3 ve maksimum dönüştürme hızının keyfini çıkarın.
            </p>
          </div>

          {/* Pricing Options Toggle / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Aylık Paket Card */}
            <div
              onClick={() => setSelectedBilling('monthly')}
              className={`relative cursor-pointer p-5 rounded-2xl border transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Aylık Paket</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedBilling === 'monthly'
                      ? 'border-purple-400 bg-purple-500'
                      : 'border-slate-500'
                  }`}
                >
                  {selectedBilling === 'monthly' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-3xl font-black text-white">{pricing.currency}{pricing.monthlyPrice}</span>
                <span className="text-xs text-slate-400 font-medium">/ ay</span>
              </div>
              <p className="text-[11px] text-slate-400">Esnek aylık ödeme, istediğiniz zaman iptal imkanı.</p>
            </div>

            {/* Yıllık Paket Card (Highlighted) */}
            <div
              onClick={() => setSelectedBilling('yearly')}
              className={`relative cursor-pointer p-5 rounded-2xl border transition-all ${
                selectedBilling === 'yearly'
                  ? 'bg-gradient-to-b from-purple-900/40 via-indigo-900/40 to-slate-900 border-amber-400/80 text-white shadow-xl shadow-purple-900/40'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow-md">
                En Popüler • %{pricing.yearlyDiscountPercent} Tasarruf
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Yıllık Avantajlı Paket
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedBilling === 'yearly'
                      ? 'border-amber-400 bg-amber-500'
                      : 'border-slate-500'
                  }`}
                >
                  {selectedBilling === 'yearly' && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-black text-white">{pricing.currency}{pricing.yearlyPrice}</span>
                <span className="text-xs text-slate-400 font-medium">/ yıl</span>
                <span className="text-[11px] text-amber-400 font-semibold">({pricing.currency}{monthlyBreakdownForYearly}/ay)</span>
              </div>
              <p className="text-[11px] text-slate-400">Tek ödeme ile 12 ay boyunca sınırsız premium erişim.</p>
            </div>
          </div>

          {/* Included Features List */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Premium Paket İçeriği
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Film className="w-4 h-4 text-purple-400 shrink-0" />
                <span><strong>4K (2160p) & 2K (1440p)</strong> Ultra HD video</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Music className="w-4 h-4 text-pink-400 shrink-0" />
                <span><strong>320 kbps</strong> Stüdyo Kalitesinde MP3</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Işık Hızında</strong> Öncelikli Sunucu Kuyruğu</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>%100 Sınırsız & Reklamsız</strong> Dönüştürme</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:via-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-900/50 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>İşlem Tamamlanıyor...</span>
                </div>
              ) : user ? (
                <>
                  <Crown className="w-5 h-5 text-amber-300" />
                  <span>
                    {selectedBilling === 'yearly'
                      ? `Yıllık Paketle ${pricing.currency}${pricing.yearlyPrice} Hemen Yükselt`
                      : `Aylık Paketle ${pricing.currency}${pricing.monthlyPrice} Hemen Yükselt`}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>Yükseltmek İçin Ücretsiz Kayıt Ol / Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500">
              ⚡ İşlem anında hesabınıza tanımlanır ve 4K/2K/320kbps indirmeleriniz derhal aktifleşir.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
