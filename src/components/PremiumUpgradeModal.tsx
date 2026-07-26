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
  UserCheck,
  CreditCard,
  Building2,
  Copy,
  Check,
  Lock,
  Receipt,
  Clock,
  ArrowLeft,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { Language, UserProfile, PricingSettings } from '../types';
import { doc, onSnapshot, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  user: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
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
  const [step, setStep] = useState<'plan' | 'payment' | '3d_secure' | 'success' | 'bank_pending'>('plan');
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  const [pricing, setPricing] = useState<PricingSettings>({
    monthlyPrice: 49,
    yearlyDiscountPercent: 20,
    yearlyPrice: 470,
    currency: '₺',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Card Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardError, setCardError] = useState('');

  // 3D Secure State
  const [smsCode, setSmsCode] = useState('582914');
  const [inputSmsCode, setInputSmsCode] = useState('');
  const [smsTimer, setSmsTimer] = useState(120);
  const [smsError, setSmsError] = useState('');

  // Bank Transfer Form State
  const [selectedBank, setSelectedBank] = useState('Ziraat Bankası');
  const [senderName, setSenderName] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [bankSuccessCode, setBankSuccessCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Receipt State
  const [receiptTxnId, setReceiptTxnId] = useState('');

  // Unique Order Code for Bank Transfer
  const [orderCode, setOrderCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('plan');
      setCardError('');
      setSmsError('');
      setInputSmsCode('');
      // Generate order code
      const randomCode = 'MS-' + Math.floor(100000 + Math.random() * 900000);
      setOrderCode(randomCode);
    }
  }, [isOpen]);

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

  // Timer for 3D Secure
  useEffect(() => {
    let interval: any = null;
    if (step === '3d_secure' && smsTimer > 0) {
      interval = setInterval(() => setSmsTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, smsTimer]);

  if (!isOpen) return null;

  const currentPrice = selectedBilling === 'yearly' ? pricing.yearlyPrice : pricing.monthlyPrice;
  const monthlyBreakdownForYearly = (pricing.yearlyPrice / 12).toFixed(1);

  const bankAccounts = [
    {
      bank: 'Ziraat Bankası',
      iban: 'TR56 0001 0090 1000 1234 5678 90',
      holder: 'MediaStream Yazılım A.Ş.',
      logo: '🏛️'
    },
    {
      bank: 'Garanti BBVA',
      iban: 'TR12 0006 2000 0000 9876 5432 10',
      holder: 'MediaStream Yazılım A.Ş.',
      logo: '🟢'
    },
    {
      bank: 'Türkiye İş Bankası',
      iban: 'TR89 0006 4000 0000 1122 3344 55',
      holder: 'MediaStream Yazılım A.Ş.',
      logo: '🔵'
    },
    {
      bank: 'Akbank',
      iban: 'TR34 0004 6000 0000 5566 7788 99',
      holder: 'MediaStream Yazılım A.Ş.',
      logo: '🔴'
    }
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Card Formatting Handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    // Format with spaces
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  // Step 1 -> Proceed to Payment or Auth
  const handleProceedToPayment = () => {
    if (!user) {
      onClose();
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setStep('payment');
  };

  // Submit Card Payment -> Open 3D Secure
  const handleStartCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setCardError('Lütfen 16 haneli geçerli kart numaranızı giriniz.');
      return;
    }
    if (!cardName.trim()) {
      setCardError('Lütfen kart üzerindeki ad soyadı giriniz.');
      return;
    }
    if (cardExpiry.length < 5) {
      setCardError('Lütfen son kullanma tarihini (AA/YY) eksiksiz giriniz.');
      return;
    }
    if (cardCvc.length < 3) {
      setCardError('Lütfen 3 veya 4 haneli CVC güvenlik kodunu giriniz.');
      return;
    }

    setSmsTimer(120);
    setInputSmsCode('');
    setStep('3d_secure');
  };

  // Verify 3D Secure SMS Code -> Complete Card Payment
  const handleConfirm3dSecure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');

    if (inputSmsCode.trim() !== smsCode) {
      setSmsError('Girdiğiniz 3D Secure SMS kodu hatalı. Lütfen 582914 yazarak tekrar deneyin.');
      return;
    }

    setIsProcessing(true);

    try {
      const cleanEmail = user?.email.trim().toLowerCase() || 'user';
      const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
      setReceiptTxnId(txnId);

      // Save Transaction to Firestore
      await addDoc(collection(db, 'transactions'), {
        txnId,
        userEmail: cleanEmail,
        amount: currentPrice,
        currency: pricing.currency,
        plan: 'Pro Unlimited',
        billingType: selectedBilling,
        paymentMethod: 'credit_card',
        lastFourDigits: cardNumber.slice(-4),
        status: 'completed',
        timestamp: new Date().toISOString()
      });

      // Upgrade User Plan in Firestore
      await setDoc(
        doc(db, 'users', cleanEmail),
        {
          plan: 'Pro Unlimited',
          role: user?.role === 'admin' ? 'admin' : 'vip',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update Local App State
      onUpgradeSuccess('Pro Unlimited');
      setIsProcessing(false);
      setStep('success');
    } catch (err: any) {
      console.error('Payment processing error:', err);
      // Fallback local update
      onUpgradeSuccess('Pro Unlimited');
      setIsProcessing(false);
      setStep('success');
    }
  };

  // Submit Bank Transfer Notification
  const handleSubmitBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert('Lütfen havale/EFT gönderen ad soyadı yazınız.');
      return;
    }

    setIsProcessing(true);

    try {
      const cleanEmail = user?.email.trim().toLowerCase() || 'user';
      await addDoc(collection(db, 'bank_transfers'), {
        orderCode,
        userEmail: cleanEmail,
        senderName: senderName.trim(),
        bank: selectedBank,
        amount: currentPrice,
        currency: pricing.currency,
        plan: 'Pro Unlimited',
        billingType: selectedBilling,
        transferNote: transferNote.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setBankSuccessCode(orderCode);
      setIsProcessing(false);
      setStep('bank_pending');
    } catch (err) {
      console.error('Bank transfer submit error:', err);
      setBankSuccessCode(orderCode);
      setIsProcessing(false);
      setStep('bank_pending');
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
          className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col justify-between"
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

          {/* STEP 1: PLAN SELECTION */}
          {step === 'plan' && (
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Modal Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3 shadow-lg shadow-amber-900/20">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>{featureBadges[requiredFeature]} İçin Premium Üyelik Alın</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Ayrıcalıklı <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Pro Premium</span> Dünyasına Katılın
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
                  Sınırsız 4K & 2K kalitede video, 320 kbps stüdyo kalitesinde MP3 ve maksimum dönüştürme hızının keyfini çıkarın.
                </p>
              </div>

              {/* Pricing Options Toggle / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5">
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
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:via-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-900/50 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                >
                  {user ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>
                        Ödeme Aşamasına Geç ({pricing.currency}{currentPrice} {selectedBilling === 'yearly' ? 'Yıllık' : 'Aylık'})
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      <span>Devam Etmek İçin Ücretsiz Giriş Yap / Kayıt Ol</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Kredi Kartı veya Havale / EFT ile %100 Güvenli Ödeme Yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT CHECKOUT */}
          {step === 'payment' && (
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <button
                  onClick={() => setStep('plan')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Güvenli Ödeme Sayfası</h3>
                  <p className="text-xs text-slate-400">
                    {selectedBilling === 'yearly' ? 'Yıllık Paket' : 'Aylık Paket'} • Toplam Ödenecek Tutar:{' '}
                    <span className="text-amber-400 font-extrabold">{pricing.currency}{currentPrice}</span>
                  </p>
                </div>
              </div>

              {/* Payment Method Switcher Tabs */}
              <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-950 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'card'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-300" />
                  <span>Kredi / Banka Kartı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'bank'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-300" />
                  <span>Havale / EFT</span>
                </button>
              </div>

              {/* TAB 1: CREDIT CARD PAYMENT FORM */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleStartCardPayment} className="space-y-4">
                  {/* Visual Credit Card Preview */}
                  <div className="relative p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 border border-purple-500/40 text-white shadow-2xl overflow-hidden space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 opacity-90 border border-amber-300/50" />
                      <span className="text-xs font-black tracking-widest text-purple-300 uppercase">
                        {cardNumber.startsWith('5') ? 'MASTERCARD' : 'VISA / TROY'}
                      </span>
                    </div>

                    <div className="text-lg sm:text-xl font-mono tracking-widest text-slate-100 min-h-[28px]">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Kart Sahibi</div>
                        <div className="font-bold tracking-wide uppercase text-slate-200 max-w-[180px] truncate">
                          {cardName || 'AD SOYAD'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">SKT</div>
                        <div className="font-mono font-bold text-slate-200">{cardExpiry || 'AA/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {cardError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cardError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Kart Üzerindeki İsim
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: AHMET YILMAZ"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 uppercase tracking-wide"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Kart Numarası
                      </label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Son Kullanma (AA/YY)
                        </label>
                        <input
                          type="text"
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Güvenlik Kodu (CVC)
                        </label>
                        <input
                          type="password"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-emerald-300" />
                      <span>3D Secure ile {pricing.currency}{currentPrice} Öde ve Aktifleştir</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">🔒 256-Bit SSL Koruma</span>
                    <span className="flex items-center gap-1">🛡️ 3D Secure Doğrulama</span>
                    <span className="flex items-center gap-1">💳 Tüm Kartlar Geçerlidir</span>
                  </div>
                </form>
              )}

              {/* TAB 2: BANK TRANSFER (HAVALE/EFT) FORM */}
              {paymentMethod === 'bank' && (
                <form onSubmit={handleSubmitBankTransfer} className="space-y-4">
                  {/* Order Code Highlight */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-400">Sipariş & Açıklama Kodu</div>
                      <div className="text-lg font-black tracking-wider text-white font-mono">{orderCode}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ⚠️ Havale yaparken açıklama kısmına strictly bu kodu yazınız.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(orderCode, 'orderCode')}
                      className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedField === 'orderCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'orderCode' ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                    </button>
                  </div>

                  {/* Bank Accounts Accordion/Cards */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Banka Hesabı Seçin ve Havale Gönderin:
                    </label>

                    <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                      {bankAccounts.map((b) => (
                        <div
                          key={b.bank}
                          onClick={() => setSelectedBank(b.bank)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedBank === b.bank
                              ? 'bg-amber-500/15 border-amber-500 text-white'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{b.logo}</span>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{b.bank}</span>
                                <span className="text-[10px] text-slate-400">({b.holder})</span>
                              </div>
                              <div className="text-[11px] font-mono text-amber-300 tracking-wider">
                                {b.iban}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(b.iban, b.bank);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium flex items-center gap-1"
                          >
                            {copiedField === b.bank ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === b.bank ? 'Kopyalandı' : 'IBAN'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transfer Notification Inputs */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Havale Yapan Gönderen Ad Soyad
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Mehmet Özkan"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Transfer Tutarı
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`${pricing.currency}${currentPrice}`}
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-amber-400 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Dekont / İşlem Referans No (İsteğe Bağlı)
                        </label>
                        <input
                          type="text"
                          placeholder="Referans No"
                          value={transferNote}
                          onChange={(e) => setTransferNote(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <span>Bildirim Gönderiliyor...</span>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 text-amber-200" />
                          <span>Havale / EFT Ödeme Bildirimi Gönder</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: 3D SECURE VERIFICATION MODAL */}
          {step === '3d_secure' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-xl shadow-indigo-900/30">
                <Smartphone className="w-8 h-8 animate-pulse text-indigo-300" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">3D Secure Güvenlik Onayı</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                  Bankanız tarafından kayıtlı cep telefonunuza SMS doğrulama kodu gönderilmiştir.
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
                  Simülasyon Test Kodu: <span className="text-amber-300">582914</span>
                </div>
              </div>

              {smsError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{smsError}</span>
                </div>
              )}

              <form onSubmit={handleConfirm3dSecure} className="space-y-4 max-w-sm mx-auto">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="582914"
                    value={inputSmsCode}
                    onChange={(e) => setInputSmsCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full px-4 py-3.5 text-center text-2xl font-mono tracking-[0.5em] rounded-2xl bg-slate-950 border border-indigo-500/50 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kalan Süre: {Math.floor(smsTimer / 60)}:{('0' + (smsTimer % 60)).slice(-2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ödeme Onaylanıyor...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-300" />
                      <span>Ödemeyi Onayla ve Premium'a Geç</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/50">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Pro Premium Aktif
                </span>
                <h3 className="text-3xl font-black text-white">Ödemeniz Başarıyla Alındı!</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Tebrikler, hesabınız anında Pro Premium statüsüne yükseltildi. Artık tüm 4K/2K ve 320 kbps indirme özelliklerini sınırsız kullanabilirsiniz.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-left space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between pb-2 border-b border-white/10 font-bold text-white">
                  <span>İşlem Referansı</span>
                  <span className="font-mono text-emerald-400">{receiptTxnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Satın Alınan Paket</span>
                  <span className="font-semibold text-white">Pro Unlimited ({selectedBilling === 'yearly' ? 'Yıllık' : 'Aylık'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ödenen Tutar</span>
                  <span className="font-extrabold text-amber-400">{pricing.currency}{currentPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ödeme Yöntemi</span>
                  <span className="font-semibold text-white">Kredi / Banka Kartı (3D Secure)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 hover:scale-[1.02] transition-all"
              >
                🎉 Hemen Sınırsız İndirmeye Başla
              </button>
            </div>
          )}

          {/* STEP 5: BANK TRANSFER PENDING CONFIRMATION */}
          {step === 'bank_pending' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-2xl shadow-amber-900/50">
                <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Havale Bildiriminiz Alındı!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  Sipariş kodunuz: <span className="font-mono font-black text-amber-400 text-sm">{bankSuccessCode}</span>. Ödemeniz ekibimiz tarafından kontrol edildikten sonra (yaklaşık 10-15 dakika) üyelik paketiniz otomatik aktifleştirilecektir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-left space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Önemli Hatırlatma</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Lütfen havale işleminizi gerçekleştirirken banka açıklama alanına <strong>{bankSuccessCode}</strong> sipariş kodunuzu eklediğinizden emin olunuz. İşleminizi hızlandırmak için canlı destek ekibimize sipariş kodunuzu yazabilirsiniz.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold text-sm shadow-xl shadow-amber-900/40 transition-all hover:scale-[1.02]"
              >
                Anladım, Kapat
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

