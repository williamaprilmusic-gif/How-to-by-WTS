import { useState, useEffect } from 'react';
import { X, ArrowRight, Clock } from 'lucide-react';
import { ALL_CATEGORIES, DIFFICULTY_META } from '../lib/topics.js';

function useEscapeToClose(active, onClose) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, onClose]);
}

export function BookmarksDrawer({ open, onClose, guides, bookmarks, onOpen, onBookmark, dark }) {
  useEscapeToClose(open, onClose);
  if (!open) return null;
  const saved = guides.filter(g => bookmarks.includes(g.id));
  const D = dark;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full max-w-sm h-full flex flex-col border-l shadow-2xl ${D ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${D ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <h3 className={`text-[15px] font-semibold ${D ? 'text-white' : 'text-zinc-900'}`}>Saved guides</h3>
          <button onClick={onClose} aria-label="Close" className={`p-1.5 rounded-lg ${D ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
            <X size={17} className={D ? 'text-zinc-400' : 'text-zinc-500'} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {saved.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <p className={`text-[13px] ${D ? 'text-zinc-600' : 'text-zinc-400'}`}>No saved guides yet</p>
              <p className={`text-[12px] ${D ? 'text-zinc-700' : 'text-zinc-300'}`}>Click the bookmark icon on any guide</p>
            </div>
          )}
          {saved.map(g => {
            const diffMeta = DIFFICULTY_META[g.difficulty] || {};
            return (
              <div
                key={g.id}
                className={`flex gap-3 p-4 border-b cursor-pointer transition-colors ${D ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-100 hover:bg-zinc-50'}`}
                onClick={() => { onOpen(g); onClose(); }}
              >
                <img src={g.heroImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold line-clamp-2 mb-1 ${D ? 'text-zinc-100' : 'text-zinc-900'}`}
                    style={{ fontFamily: "'Lora', serif" }}>{g.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${diffMeta.bg} ${diffMeta.text}`}>{g.difficulty}</span>
                    <span className={`text-[11px] flex items-center gap-1 ${D ? 'text-zinc-600' : 'text-zinc-400'}`}><Clock size={10} /> {g.estimatedTime}</span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onBookmark(g.id); }}
                  aria-label={`Remove "${g.title}" from bookmarks`}
                  className={`p-1 self-start ${D ? 'text-zinc-600 hover:text-red-400' : 'text-zinc-300 hover:text-red-400'} transition-colors`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CreateGuideModal({ open, onClose, onCreate, dark }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('Tech & Programming');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [time, setTime] = useState('');
  const [step1, setStep1] = useState('');
  useEscapeToClose(open, onClose);
  if (!open) return null;

  const ok = title.trim() && summary.trim() && time.trim() && step1.trim();
  const D = dark;

  const submit = () => {
    if (!ok) return;
    onCreate({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: summary.trim(),
      category,
      difficulty,
      estimatedTime: time.trim(),
      popularity: 50,
      published: new Date().toISOString().slice(0, 10),
      author: { name: 'You', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&crop=faces', role: 'Community Contributor' },
      heroImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop',
      tools: [], warnings: [], cost: null,
      steps: [{ id: 1, title: 'Step 1', content: step1.trim() }],
      sources: [], tags: [],
    });
    setTitle(''); setSummary(''); setTime(''); setStep1('');
    onClose();
  };

  const inp = `w-full px-3 py-2.5 rounded-xl text-[13px] border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
    D ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400'
  }`;
  const lbl = `text-[11px] font-bold uppercase tracking-wide mb-1.5 block ${D ? 'text-zinc-500' : 'text-zinc-400'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 max-h-[90vh] overflow-y-auto shadow-2xl ${D ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-[16px] font-bold ${D ? 'text-white' : 'text-zinc-900'}`}>Submit a how-to guide</h3>
          <button onClick={onClose} aria-label="Close" className={`p-1.5 rounded-lg ${D ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
            <X size={17} className={D ? 'text-zinc-400' : 'text-zinc-500'} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={lbl}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. How to make perfect cold brew coffee" className={inp} />
          </div>
          <div>
            <label className={lbl}>Summary</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2} placeholder="What will readers achieve?" className={`${inp} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inp}>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inp}>
                {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Time estimate</label>
            <input value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 30 mins or 2 hours" className={inp} />
          </div>
          <div>
            <label className={lbl}>First step (you can add more later)</label>
            <textarea value={step1} onChange={e => setStep1(e.target.value)} rows={3} placeholder="Describe the first action the reader should take…" className={`${inp} resize-none`} />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!ok}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white text-[13px] font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Publish guide <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
