import React from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, Shield, Layers, HardDriveDownload, Gauge } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface FeaturesGridProps {
  lang: Language;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ lang }) => {
  const t = translations[lang];

  const features = [
    {
      icon: Zap,
      title: t.featFastTitle,
      desc: t.featFastDesc,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Sparkles,
      title: t.featNoWatermarkTitle,
      desc: t.featNoWatermarkDesc,
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      icon: Layers,
      title: t.featMultiFormatTitle,
      desc: t.featMultiFormatDesc,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: t.featPrivacyTitle,
      desc: t.featPrivacyDesc,
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <section className="py-16 relative border-y border-white/10 bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative group p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.gradient} text-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
