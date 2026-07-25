import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import { Language } from '../types';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: 'MediaStream tamamen ücretsiz mi? Herhangi bir indirme sınırı var mı?',
      a: 'Evet! MediaStream platformumuz %100 ücretsizdir. Standart kullanımda indirme sayısı sınırı bulunmamaktadır. 4K 60FPS ve 320kbps MP3 dönüşümlerini sınırsız gerçekleştirebilirsiniz.',
    },
    {
      q: 'TikTok videolarını logosuz / filigramsız nasıl indirebilirim?',
      a: 'TikTok bağlantısını kopyalayıp ana sayfadaki kutuya yapıştırmanız yeterlidir. Sistemimiz TikTok sunucusundan filigramsız orijinal MP4 video akışını otomatik tespit eder.',
    },
    {
      q: 'YouTube 4K videoları indirirken ses kayboluyor mu?',
      a: 'Hayır! Bazı sitelerde 4K videolarda ses ayrı indirilir. MediaStream sunucu tarafında video ve ses akışlarını anlık olarak birleştirerek %100 senkronize MP4 dosyası sunar.',
    },
    {
      q: 'İndirdiğim dosyalar sunucularınızda saklanıyor mu?',
      a: 'Kesinlikle hayır. Gizliliğiniz birinci önceliğimizdir. Dosyalar dönüştürme anında geçici ara belleğe alınır ve indirme tamamlandığında anında imha edilir.',
    },
    {
      q: 'Mobil cihazımda (iPhone/Android) video indirebilir miyim?',
      a: 'Evet! MediaStream tam PWA (Progressive Web App) ve mobil tarayıcı uyumludur. Dilerseniz indirme sonucunda oluşturulan QR kodu telefon kamerasından taratarak doğrudan cihazınıza indirebilirsiniz.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="faq" className="py-20 relative bg-slate-950/50 border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Sıkça Sorulan Sorular (SSS)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Merak Edilen Sorular ve Yanıtlar
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Soru veya kelime ara..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-white text-sm flex justify-between items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
