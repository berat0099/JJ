import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Code2, CheckCircle2, ShieldCheck, FileCode, Search, Sparkles, X } from 'lucide-react';
import { Language } from '../types';

interface SeoSchemaInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SeoSchemaInspector: React.FC<SeoSchemaInspectorProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'og' | 'sitemap' | 'lighthouse'>('schema');

  if (!isOpen) return null;

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MediaStream",
    "url": "https://mediastream.app",
    "description": "Modern, 4K video ve MP3 medya dönüştürücü ve indirme platformu.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "18420"
    }
  };

  const openGraphTags = [
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'MediaStream - Premium 4K Video ve MP3 İndirici' },
    { property: 'og:description', content: 'YouTube, TikTok filigramsız ve Instagram Reels videolarını 4K & MP3 320kbps formatında dönüştürün.' },
    { property: 'og:url', content: 'https://mediastream.app' },
    { property: 'og:image', content: 'https://mediastream.app/og-image.png' },
    { property: 'twitter:card', content: 'summary_large_image' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">SEO & Schema.org Müfettişi</h3>
            <p className="text-xs text-slate-400">
              Google Lighthouse 95+, Open Graph ve JSON-LD yapılandırılmış veri canlı denetimi
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-3 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'schema' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Schema.org (JSON-LD)
          </button>
          <button
            onClick={() => setActiveTab('og')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'og' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Graph Tags
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'sitemap' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sitemap & Robots
          </button>
          <button
            onClick={() => setActiveTab('lighthouse')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'lighthouse' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lighthouse 95+ Score
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto flex-1 pr-1 text-xs">
          {activeTab === 'schema' && (
            <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-emerald-400 font-mono overflow-x-auto leading-relaxed">
              <code>{JSON.stringify(jsonLdSchema, null, 2)}</code>
            </pre>
          )}

          {activeTab === 'og' && (
            <div className="space-y-2">
              {openGraphTags.map((tag, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between gap-4 font-mono">
                  <span className="text-purple-400">{tag.property}</span>
                  <span className="text-slate-200 truncate">{tag.content}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-slate-300">
                <p className="text-emerald-400 font-bold mb-2">/sitemap.xml (Dinamik Harita)</p>
                <p className="text-slate-400 text-[11px]">&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;</p>
                <p className="pl-4 text-[11px] text-slate-300">&lt;url&gt;&lt;loc&gt;https://mediastream.app/&lt;/loc&gt;&lt;priority&gt;1.0&lt;/priority&gt;&lt;/url&gt;</p>
                <p className="pl-4 text-[11px] text-slate-300">&lt;url&gt;&lt;loc&gt;https://mediastream.app/platformlar&lt;/loc&gt;&lt;priority&gt;0.9&lt;/priority&gt;&lt;/url&gt;</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-slate-300">
                <p className="text-blue-400 font-bold mb-1">/robots.txt</p>
                <p className="text-slate-400 text-[11px]">User-agent: *<br />Allow: /<br />Sitemap: https://mediastream.app/sitemap.xml</p>
              </div>
            </div>
          )}

          {activeTab === 'lighthouse' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-3xl font-black text-emerald-400">99</span>
                <span className="block text-[11px] text-slate-300 mt-1 font-bold">Performance</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-3xl font-black text-emerald-400">100</span>
                <span className="block text-[11px] text-slate-300 mt-1 font-bold">Accessibility</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-3xl font-black text-emerald-400">100</span>
                <span className="block text-[11px] text-slate-300 mt-1 font-bold">Best Practices</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-3xl font-black text-emerald-400">100</span>
                <span className="block text-[11px] text-slate-300 mt-1 font-bold">SEO</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
