import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Film,
  Music,
  CheckCircle2,
  Share2,
  QrCode,
  Copy,
  Check,
  Heart,
  Volume2,
  Clock,
  Eye,
  User,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { MediaAnalysisResult, Language } from '../types';
import { translations } from '../data/translations';

interface AnalysisResultProps {
  media: MediaAnalysisResult;
  lang: Language;
  onSaveFavorite?: (media: MediaAnalysisResult) => void;
  isFavorite?: boolean;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  media,
  lang,
  onSaveFavorite,
  isFavorite = false,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadModal, setDownloadModal] = useState<{
    status: 'preparing' | 'ready' | 'error';
    progress: number;
    format: string;
    resolution: string;
    size: string;
    downloadUrl?: string;
    filename?: string;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [favSaved, setFavSaved] = useState(isFavorite);

  const t = translations[lang];

  const handleStartDownload = async (formatStr: string, resStr: string, sizeStr: string, formatId?: string) => {
    setDownloadingFormat(`${formatStr}-${resStr}`);
    const isAudio = formatStr.toLowerCase().includes('mp3');

    setDownloadModal({
      status: 'preparing',
      progress: 15,
      format: formatStr,
      resolution: resStr,
      size: sizeStr,
    });

    try {
      const res = await fetch('/api/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: media.url,
          type: isAudio ? 'audio' : 'video',
          formatId,
          title: media.title
        })
      });

      if (!res.ok) {
        throw new Error('İndirme isteği başlatılamadı');
      }

      const { jobId, filename } = await res.json();

      let simulatedProgress = 20;
      const pollInterval = setInterval(async () => {
        try {
          simulatedProgress = Math.min(simulatedProgress + 4, 94);
          const statusRes = await fetch(`/api/job-status/${jobId}`);
          if (!statusRes.ok) return;

          const data = await statusRes.json();
          if (data.status === 'ready') {
            clearInterval(pollInterval);
            setDownloadingFormat(null);
            setDownloadModal({
              status: 'ready',
              progress: 100,
              format: formatStr,
              resolution: resStr,
              size: sizeStr,
              downloadUrl: data.downloadUrl,
              filename: data.filename || filename
            });
          } else if (data.status === 'error') {
            clearInterval(pollInterval);
            setDownloadingFormat(null);
            setDownloadModal({
              status: 'error',
              progress: 0,
              format: formatStr,
              resolution: resStr,
              size: sizeStr,
              error: data.error || 'İndirme hazırlığı sırasında bir hata oluştu'
            });
          } else {
            setDownloadModal(prev => prev ? {
              ...prev,
              progress: Math.max(data.progress || 0, simulatedProgress)
            } : null);
          }
        } catch (e) {
          // ignore transient errors
        }
      }, 1000);
    } catch (err: any) {
      setDownloadingFormat(null);
      setDownloadModal({
        status: 'error',
        progress: 0,
        format: formatStr,
        resolution: resStr,
        size: sizeStr,
        error: err?.message || 'Bağlantı hatası oluştu'
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = () => {
    setFavSaved(!favSaved);
    if (onSaveFavorite) {
      onSaveFavorite(media);
    }
  };

  return (
    <section id="analysis-result" className="py-12 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          {/* Card Header & Video Details Grid */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{t.analysisTitle}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {media.platform}
                  </span>
                </h2>
              </div>

              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                  favSaved
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${favSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="hidden sm:inline">
                  {favSaved ? 'Favorilerde' : 'Favorilere Ekle'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Thumbnail Container */}
              <div className="md:col-span-5 relative group rounded-2xl overflow-hidden shadow-xl border border-white/10 aspect-video bg-black">
                <img
                  src={media.thumbnail}
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold flex items-center gap-1 border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{media.duration}</span>
                </div>
              </div>

              {/* Media Meta Info */}
              <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
                    {media.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-semibold text-white">{media.author}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{media.views} {t.viewsCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>Tarih: {media.uploadDate}</span>
                    </div>
                  </div>
                </div>

                {/* Quality Summary badges */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">En Yüksek Kalite</span>
                    <span className="font-bold text-emerald-400">4K 2160p</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="text-slate-400 block text-[10px]">Ses Akışı</span>
                    <span className="font-bold text-amber-400">320 kbps HQ</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Filigram</span>
                    <span className="font-bold text-blue-400">Yok (%100 Temiz)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection Tabs */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'video'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>{t.tabVideo}</span>
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                  {media.videoOptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'audio'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>{t.tabAudio}</span>
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                  {media.audioOptions.length}
                </span>
              </button>
            </div>

            {/* Video Table */}
            {activeTab === 'video' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="text-xs uppercase bg-white/5 text-slate-400 font-semibold rounded-xl">
                    <tr>
                      <th className="px-4 py-3.5 rounded-l-xl">{t.formatCol}</th>
                      <th className="px-4 py-3.5">{t.resCol}</th>
                      <th className="px-4 py-3.5">{t.sizeCol}</th>
                      <th className="px-4 py-3.5">{t.audioCol}</th>
                      <th className="px-4 py-3.5 text-right rounded-r-xl">{t.actionCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {media.videoOptions.map((opt, idx) => {
                      const isTarget = downloadingFormat === `${opt.format}-${opt.resolution}`;
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-bold text-white flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono">
                              {opt.format}
                            </span>
                            {opt.quality === '4k' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/40">
                                4K
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-medium text-white">
                            {opt.resolution}
                            <span className="ml-2 text-xs text-slate-400 font-normal">
                              ({opt.fps}fps - {opt.bitrate})
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-300 font-mono text-xs">
                            {opt.size}
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <Volume2 className="w-3.5 h-3.5" /> Sesli
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {isTarget ? (
                              <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                    style={{ width: `${downloadModal?.progress || 15}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-blue-400 font-mono font-bold flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> %{downloadModal?.progress || 15}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartDownload(opt.format, opt.resolution, opt.size, opt.formatId)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-900/30 transition-all hover:scale-105 flex items-center gap-1.5 ml-auto"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{t.btnDownload}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Audio Table */}
            {activeTab === 'audio' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="text-xs uppercase bg-white/5 text-slate-400 font-semibold rounded-xl">
                    <tr>
                      <th className="px-4 py-3.5 rounded-l-xl">{t.formatCol}</th>
                      <th className="px-4 py-3.5">Bitrate</th>
                      <th className="px-4 py-3.5">Örnekleme</th>
                      <th className="px-4 py-3.5">{t.sizeCol}</th>
                      <th className="px-4 py-3.5 text-right rounded-r-xl">{t.actionCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {media.audioOptions.map((opt, idx) => {
                      const isTarget = downloadingFormat === `${opt.format}-${opt.bitrate}`;
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-bold text-white flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-mono">
                              {opt.format}
                            </span>
                            {opt.quality === 'ultra' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/40">
                                Ultra HQ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-medium text-white font-mono">
                            {opt.bitrate}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-300">
                            {opt.sampleRate}
                          </td>
                          <td className="px-4 py-4 text-slate-300 font-mono text-xs">
                            {opt.size}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {isTarget ? (
                              <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                    style={{ width: `${downloadModal?.progress || 15}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-purple-400 font-mono font-bold flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> %{downloadModal?.progress || 15}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartDownload(opt.format, opt.bitrate, opt.size, opt.formatId)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-purple-900/30 transition-all hover:scale-105 flex items-center gap-1.5 ml-auto"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{t.btnDownload}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Download Status & Ready Modal */}
      <AnimatePresence>
        {downloadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setDownloadModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                {downloadModal.status === 'preparing' && (
                  <>
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-900/50 mb-4">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>

                    <h3 className="text-2xl font-black text-white">Medya Sunucuda Hazırlanıyor</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                      Yüksek kaliteli video ve ses kanalları sunucumuzda birleştiriliyor, lütfen bekleyin...
                    </p>

                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-mono font-bold text-blue-400">
                        <span>Hazırlanıyor...</span>
                        <span>%{downloadModal.progress}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${downloadModal.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">İçerik:</span>
                        <span className="font-semibold text-white truncate max-w-[220px]">
                          {media.title}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seçilen Kalite:</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {downloadModal.format} - {downloadModal.resolution}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {downloadModal.status === 'ready' && (
                  <>
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-4 animate-bounce">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <h3 className="text-2xl font-black text-white">{t.downloadModalTitle}</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                      Dosyanız sunucuda birleştirildi. Aşağıdaki butona tıklayarak anında cihazınıza kaydedebilirsiniz.
                    </p>

                    {/* Details Card */}
                    <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">İçerik:</span>
                        <span className="font-semibold text-white truncate max-w-[220px]">
                          {media.title}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seçilen Format:</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {downloadModal.format} - {downloadModal.resolution}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dosya Boyutu:</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {downloadModal.size}
                        </span>
                      </div>
                    </div>

                    {/* Main Download Actions */}
                    <div className="mt-6 flex flex-col gap-3">
                      <a
                        href={downloadModal.downloadUrl}
                        download={downloadModal.filename || 'media.mp4'}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        <span>Hemen Cihaza İndir ({downloadModal.filename})</span>
                      </a>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCopy(window.location.origin + (downloadModal.downloadUrl || ''))}
                          className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">{t.copiedText}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-blue-400" />
                              <span>{t.btnCopyLink}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            handleCopy(window.location.href);
                          }}
                          className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-purple-400" />
                          <span>Paylaş</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Code Mobile Transfer Simulation */}
                    <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                        {/* Simulated QR Pattern */}
                        <div className="w-16 h-16 bg-slate-900 p-1 rounded grid grid-cols-5 gap-0.5">
                          <div className="bg-white rounded-xs col-span-2 row-span-2" />
                          <div className="bg-white rounded-xs col-start-4 col-span-2 row-span-2" />
                          <div className="bg-white rounded-xs row-start-4 col-span-2 row-span-2" />
                          <div className="bg-emerald-400 rounded-xs col-start-3 row-start-3" />
                          <div className="bg-white rounded-xs col-start-4 row-start-4" />
                          <div className="bg-white rounded-xs col-start-5 row-start-5" />
                        </div>
                      </div>

                      <div className="text-left text-xs">
                        <p className="font-bold text-white flex items-center gap-1">
                          <QrCode className="w-4 h-4 text-blue-400" />
                          {t.qrScanText}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                          Kameranızı açın ve videoyu doğrudan akıllı telefonunuza indirin.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {downloadModal.status === 'error' && (
                  <>
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center mb-4">
                      <X className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-black text-white">Hazırlık Başarısız Oldu</h3>
                    <p className="text-xs text-rose-300 mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      {downloadModal.error}
                    </p>

                    <button
                      onClick={() => setDownloadModal(null)}
                      className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors"
                    >
                      Kapat ve Tekrar Dene
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
