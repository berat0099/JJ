import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  X,
  Wifi,
  Globe,
  ShieldCheck,
  Cpu,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DiagnosticTestItem {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  details?: string;
  badge?: string;
}

interface DiagnosticConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryAnalysis?: () => void;
}

export const DiagnosticConsole: React.FC<DiagnosticConsoleProps> = ({
  isOpen,
  onClose,
  onRetryAnalysis,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [tests, setTests] = useState<DiagnosticTestItem[]>([
    { id: 'ytdlp_engine', title: 'İndirme Motoru (yt-dlp)', status: 'pending' },
    { id: 'youtube_oembed', title: 'YouTube Platform Erişilebilirliği', status: 'pending' },
    { id: 'dns_ip_protocol', title: 'DNS & IP Protokol Analizi (IPv4 / IPv6)', status: 'pending' },
    { id: 'stream_extractor', title: 'Medya Akış Çözümleyici (IPv4 Mode)', status: 'pending' },
  ]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('Ağ ve bağlantı teşhis testi başlatılıyor...');
    addLog('Cihaz IP, DNS çözümleme ve YouTube sunucu doğrulaması taranıyor...');

    setTests([
      { id: 'ytdlp_engine', title: 'İndirme Motoru (yt-dlp)', status: 'running', details: 'Sistem ikili dosyası taranıyor...' },
      { id: 'youtube_oembed', title: 'YouTube Platform Erişilebilirliği', status: 'pending' },
      { id: 'dns_ip_protocol', title: 'DNS & IP Protokol Analizi (IPv4 / IPv6)', status: 'pending' },
      { id: 'stream_extractor', title: 'Medya Akış Çözümleyici (IPv4 Mode)', status: 'pending' },
    ]);

    try {
      addLog('GET /api/diagnose isteği gönderiliyor...');
      const res = await fetch('/api/diagnose');
      if (!res.ok) {
        throw new Error(`Sunucu HTTP ${res.status} yanıtı döndü`);
      }

      const data = await res.json();
      addLog('Sunucudan teşhis raporu başarıyla alındı.');

      if (data.tests && Array.isArray(data.tests)) {
        setTests(data.tests);
        data.tests.forEach((t: any) => {
          addLog(`[${t.title}] -> Durum: ${t.status.toUpperCase()} (${t.details || ''})`);
        });
      }

      if (data.summary) setSummary(data.summary);
      if (data.recommendation) setRecommendation(data.recommendation);

      addLog('Teşhis testi tamamlandı.');
    } catch (err: any) {
      addLog(`[HATA] Teşhis testi sırasında sorun oluştu: ${err.message}`);
      setTests((prev) =>
        prev.map((t) => ({ ...t, status: 'error', details: 'Sunucuya ulaşılamadı' }))
      );
      setRecommendation(
        'Sunucu API yanıt vermiyor. Lütfen internet bağlantınızı kontrol edin veya birkaç saniye sonra tekrar deneyin.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && logs.length === 0) {
      runDiagnostics();
    }
  }, [isOpen]);

  const handleCopyLogs = () => {
    const text = logs.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 text-slate-100"
        >
          {/* Header Bar */}
          <div className="px-6 py-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Ağ & Bağlantı Teşhis Konsolu</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                    v2.4 Diagnostic
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  İSS, IPv6 & YouTube Sunucu Doğrulaması Kontrol Paneli
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Run Button Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-300">
                  {isRunning ? 'Bağlantı ve protokoller test ediliyor...' : 'Sistem hazır. Canlı test çalıştırabilirsiniz.'}
                </span>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Test Ediliyor...' : 'Teşhis Testini Yeniden Başlat'}</span>
              </button>
            </div>

            {/* Test Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {test.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {test.status === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      {test.status === 'error' && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      {(test.status === 'pending' || test.status === 'running') && (
                        <Activity className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-200">{test.title}</span>
                    </div>

                    {test.badge && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        test.status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                        test.status === 'warning' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}>
                        {test.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {test.details || 'Test bekleniyor...'}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary & Recommendation Card */}
            {recommendation && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 text-left space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Teşhis Sonucu ve Çözüm Önerisi</span>
                </div>
                {summary && (
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {summary}
                  </p>
                )}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                  💡 <strong>Öneri:</strong> {recommendation}
                </div>
              </div>
            )}

            {/* Terminal Logs Viewer */}
            <div className="rounded-2xl bg-black/80 border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>CANLI CANLI CANLI TERMINAL LOGLARI</span>
                </span>
                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLogs ? 'Kopyalandı' : 'Raporu Kopyala'}</span>
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {logs.length === 0 ? (
                  <span className="text-slate-600 italic">Henüz log kaydedilmedi...</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="leading-snug break-all text-slate-300">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Otomatik Zorunlu IPv4 Tünelleme Aktif</span>
            </div>

            <div className="flex items-center gap-2">
              {onRetryAnalysis && (
                <button
                  onClick={() => {
                    onClose();
                    onRetryAnalysis();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Tekrar Analiz Et</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
