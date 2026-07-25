import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Language } from '../types';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Dynamic Contact Data state
  const [contactInfo, setContactInfo] = useState({
    title: 'Bir Sorunuz mu Var? Bizimle İletişime Geçin',
    desc: 'API entegrasyonu, kurumsal üyelik veya genel teknik sorularınız için 7/24 destek ekibimize ulaşabilirsiniz.',
    supportEmail: 'support@mediastream.app',
    phone: '+90 (850) 885 99 00',
    address: 'Levent Plaza No:142, İstanbul',
  });

  useEffect(() => {
    try {
      const contactRef = doc(db, 'settings', 'contact');
      const unsubscribe = onSnapshot(contactRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContactInfo({
            title: data.title || 'Bir Sorunuz mu Var? Bizimle İletişime Geçin',
            desc: data.desc || 'API entegrasyonu, kurumsal üyelik veya genel teknik sorularınız için 7/24 destek ekibimize ulaşabilirsiniz.',
            supportEmail: data.supportEmail || 'support@mediastream.app',
            phone: data.phone || '+90 (850) 885 99 00',
            address: data.address || 'Levent Plaza No:142, İstanbul',
          });
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error('Contact firestore error:', err);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Info Side */}
          <div className="md:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
              <Mail className="w-3.5 h-3.5" />
              <span>İletişim & Destek</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {contactInfo.title}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {contactInfo.desc}
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">E-posta</span>
                  <a href={`mailto:${contactInfo.supportEmail}`} className="font-semibold text-white hover:underline">
                    {contactInfo.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Telefon / WhatsApp</span>
                  <a href={`tel:${contactInfo.phone}`} className="font-semibold text-white hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Ofis</span>
                  <span className="font-semibold text-white">{contactInfo.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
              {submitted ? (
                <div className="text-center py-10 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h3 className="text-xl font-bold text-white">Mesajınız Alındı!</h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Destek ekibimiz en geç 1 saat içerisinde belirttiğiniz e-posta adresine yanıt verecektir.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eposta@domain.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mesajınız
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nasıl yardımcı olabiliriz?..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gönder</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
