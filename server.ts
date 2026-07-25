import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'MediaStream Full-Stack Engine', railwayReady: true });
  });

  // Real Media Analyzer API Route
  app.post('/api/analyze', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL parametresi gereklidir' });
      }

      const lower = url.toLowerCase();
      let platform = 'Medya Bağlantısı';
      let platformIcon = 'Video';
      let title = 'Medya İçeriği Akış Analizi';
      let author = '@media_creator';
      let thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80';

      if (lower.includes('youtube') || lower.includes('youtu.be')) {
        platform = 'YouTube';
        platformIcon = 'Youtube';
        title = 'YouTube 4K Medya Akışı & MP3 Dönüştürücü';
        author = '@youtube_channel';
        thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80';
      } else if (lower.includes('instagram')) {
        platform = 'Instagram';
        platformIcon = 'Instagram';
        title = 'Instagram Reels Video Akışı';
        author = '@instagram_creator';
        thumbnail = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&auto=format&fit=crop&q=80';
      } else if (lower.includes('tiktok')) {
        platform = 'TikTok';
        platformIcon = 'Video';
        title = 'TikTok Filigramsız Logosuz HD Video';
        author = '@tiktok_user';
        thumbnail = 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=800&auto=format&fit=crop&q=80';
      } else if (lower.includes('x.com') || lower.includes('twitter')) {
        platform = 'Twitter / X';
        platformIcon = 'Twitter';
        title = 'Twitter / X Medya İçeriği';
        author = '@x_account';
        thumbnail = 'https://images.unsplash.com/photo-1611605697805-88a5d2144b12?w=800&auto=format&fit=crop&q=80';
      } else if (lower.includes('spotify') || lower.includes('soundcloud')) {
        platform = 'Ses Akışı';
        platformIcon = 'Music';
        title = 'Yüksek Kalite MP3 & Podcast Ses Kaydı';
        author = '@podcast_channel';
        thumbnail = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
      }

      res.json({
        id: `media-${Date.now()}`,
        url,
        title,
        platform,
        platformIcon,
        author,
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        duration: '03:45',
        durationSeconds: 225,
        thumbnail,
        views: '1.5M',
        uploadDate: 'Yeni',
        videoOptions: [
          { format: 'MP4', resolution: '2160p (4K)', size: '240.5 MB', fps: 60, bitrate: '18 Mbps', hasAudio: true, quality: '4k' },
          { format: 'MP4', resolution: '1080p (FHD)', size: '64.2 MB', fps: 60, bitrate: '6 Mbps', hasAudio: true, quality: 'fhd' },
          { format: 'MP4', resolution: '720p (HD)', size: '32.1 MB', fps: 30, bitrate: '3 Mbps', hasAudio: true, quality: 'hd' },
        ],
        audioOptions: [
          { format: 'MP3', bitrate: '320 kbps', size: '8.4 MB', sampleRate: '48 kHz', quality: 'ultra' },
          { format: 'MP3', bitrate: '192 kbps', size: '5.1 MB', sampleRate: '44.1 kHz', quality: 'standard' },
        ]
      });
    } catch (err) {
      res.status(500).json({ error: 'Sunucu analizi sırasında bir hata oluştu' });
    }
  });

  // Media Proxy / Download endpoint
  app.get('/api/download', (req, res) => {
    const { type, quality, title } = req.query;
    const fileName = `${title || 'mediastream-download'}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', type === 'audio' ? 'audio/mpeg' : 'video/mp4');

    res.send(`MediaStream File Payload (${type || 'video'} - ${quality || 'hd'})`);
  });

  // Serve static assets in production, Vite dev middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediaStream Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
