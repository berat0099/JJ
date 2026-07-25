import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Copy, Check, Terminal, Play, Key, Zap } from 'lucide-react';
import { Language } from '../types';

interface ApiDocsSectionProps {
  lang: Language;
}

export const ApiDocsSection: React.FC<ApiDocsSectionProps> = ({ lang }) => {
  const [activeLang, setActiveLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST "https://mediastream-cdn.download/api/v1/analyze" \\
  -H "Authorization: Bearer ms_live_sk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'`,
    javascript: `const response = await fetch("https://mediastream-cdn.download/api/v1/analyze", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ms_live_sk_YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  })
});
const data = await response.json();
console.log(data.videoOptions);`,
    python: `import requests

url = "https://mediastream-cdn.download/api/v1/analyze"
headers = {
    "Authorization": "Bearer ms_live_sk_YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}

res = requests.post(url, json=payload, headers=headers)
print(res.json())`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="api" className="py-20 relative bg-slate-950/60 border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>Geliştirici REST API v1</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Kendi Uygulamanıza Dönüştürücü Gücünü Katın
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm">
            Yüksek performanslı JSON REST API endpointimiz ile saniyede 100+ medya analiz isteğini programatik olarak işleyin.
          </p>
        </div>

        {/* Code Box Container */}
        <div className="rounded-3xl bg-slate-900 border border-white/15 overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveLang('curl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeLang === 'curl'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveLang('javascript')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeLang === 'javascript'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                JavaScript (Node)
              </button>
              <button
                onClick={() => setActiveLang('python')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeLang === 'python'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python 3
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>
          </div>

          {/* Code Body */}
          <pre className="p-6 text-xs font-mono text-cyan-300 bg-slate-950 overflow-x-auto leading-relaxed">
            <code>{codeSnippets[activeLang]}</code>
          </pre>

          {/* Response Payload Example */}
          <div className="p-4 bg-white/5 border-t border-white/10 text-xs text-slate-300 flex justify-between items-center">
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> 200 OK — Response time: 42ms
            </span>
            <span className="text-[11px] text-slate-400">Rate limit: 1000 req/min</span>
          </div>
        </div>
      </div>
    </section>
  );
};
