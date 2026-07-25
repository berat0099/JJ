import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Pin,
  MessageSquare,
  AtSign,
  Film,
  PlaySquare,
  Music,
  Radio,
  Video,
  CheckCircle2,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import { supportedPlatforms } from '../data/platforms';
import { Language, PlatformItem } from '../types';
import { translations } from '../data/translations';

interface SupportedPlatformsProps {
  lang: Language;
  onSelectPlatform?: (platformName: string) => void;
}

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = ({ lang, onSelectPlatform }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'video' | 'social' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang];

  const getPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'Youtube':
        return <Youtube className="w-6 h-6" />;
      case 'Instagram':
        return <Instagram className="w-6 h-6" />;
      case 'Facebook':
        return <Facebook className="w-6 h-6" />;
      case 'Twitter':
        return <Twitter className="w-6 h-6" />;
      case 'Pin':
        return <Pin className="w-6 h-6" />;
      case 'MessageSquare':
        return <MessageSquare className="w-6 h-6" />;
      case 'AtSign':
        return <AtSign className="w-6 h-6" />;
      case 'Film':
        return <Film className="w-6 h-6" />;
      case 'PlaySquare':
        return <PlaySquare className="w-6 h-6" />;
      case 'Music':
        return <Music className="w-6 h-6" />;
      case 'Radio':
        return <Radio className="w-6 h-6" />;
      default:
        return <Video className="w-6 h-6" />;
    }
  };

  const filteredPlatforms = supportedPlatforms.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="platforms" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-4"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.platformsTitle}</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tüm Sosyal Medya & Video Ağları Tek Bir Yerde
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.platformsSubtitle}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setActiveCategory('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'video'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {t.filterVideo}
            </button>
            <button
              onClick={() => setActiveCategory('social')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'social'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {t.filterSocial}
            </button>
            <button
              onClick={() => setActiveCategory('audio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'audio'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {t.filterAudio}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Platform ara..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlatforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => onSelectPlatform && onSelectPlatform(platform.name)}
              className={`relative group rounded-3xl bg-slate-900/80 border ${platform.borderColor} p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-purple-950/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between`}
            >
              {/* Subtle Gradient Glow in Card Corner */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${platform.bgColor} blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none`}
              />

              <div>
                {/* Platform Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl border border-white/15 flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                    >
                      {getPlatformIcon(platform.iconName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                        {platform.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {platform.maxQuality}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t.statusActive}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {platform.description[lang]}
                </p>
              </div>

              {/* Supported Formats & Speed Rating */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {platform.supportedFormats.map((fmt, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{t.speedLabel}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, starIdx) => (
                      <span
                        key={starIdx}
                        className={`w-2 h-2 rounded-full ${
                          starIdx < platform.speedRating
                            ? 'bg-amber-400 shadow-sm shadow-amber-400'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
