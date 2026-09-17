import { useState, useEffect, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, Circle,
  Bookmark, BookmarkCheck, Share2, FileDown, Play, ZoomIn,
  Clock, AlignLeft, Hash, AlertCircle, ExternalLink, PartyPopper,
  Wrench, ShieldCheck, Newspaper, FlaskConical, FileText, Link2
} from 'lucide-react';
import { CATEGORY_META } from '../lib/topics.js';
import { CURATED_VIDEOS } from '../lib/generator.js';

const SOURCE_ICON = {
  Documentation: FileText,
  Article: Newspaper,
  Research: FlaskConical,
  Official: ShieldCheck,
};

function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-6" onClick={onClose}>
      <button onClick={onClose} aria-label="Close image" className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
        <X size={20} />
      </button>
      <img src={src} alt="" className="max-h-[90vh] max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
    </div>
  );
}

function VideoModal({ video, onClose }) {
  if (!video) return null;
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
  return (
    <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4 sm:p-10" onClick={onClose}>
      <div className="w-full max-w-3xl bg-zinc-950 rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <p className="text-white text-[13px] font-medium">{video.title}</p>
            <p className="text-zinc-500 text-[11px]">{video.channel}</p>
          </div>
          <button onClick={onClose} aria-label="Close video" className="p-1.5 rounded-md hover:bg-white/10 text-white/70"><X size={16} /></button>
        </div>
        <div className="aspect-video">
          <iframe src={embedUrl} title={video.title} className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>
      </div>
    </div>
  );
}

export default function ReaderModal({ guide, guides, onOpen, onClose, completedMap, toggleStep, bookmarked, onBookmark, dark }) {
  const [activeStep, setActiveStep] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [shareToast, setShareToast] = useState(false);
  const stepRefs = useRef([]);

  useEffect(() => { setActiveStep(0); setTocOpen(false); }, [guide?.id]);
  useEffect(() => {
    document.body.style.overflow = guide ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [guide]);

  useEffect(() => {
    if (!guide) return;
    const onKeyDown = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [guide, onClose]);

  if (!guide) return null;

  const done = completedMap[guide.id] || {};
  const completedCount = guide.steps.filter(s => done[s.id]).length;
  const pct = Math.round((completedCount / guide.steps.length) * 100);
  const allDone = completedCount === guide.steps.length;
  const words = guide.steps.reduce((n, s) => n + (s.content?.split(' ').length || 0), 0);
  const readMins = Math.max(1, Math.ceil(words / 200));
  const catMeta = CATEGORY_META[guide.category] || {};
  const videos = CURATED_VIDEOS[guide.category] || [];
  const featuredVideo = videos[Math.floor(Math.random() * videos.length)];

  const related = (guides || [])
    .filter(g => g.id !== guide.id)
    .map(g => {
      const sameCategory = g.category === guide.category ? 2 : 0;
      const sharedTags = (g.tags || []).filter(t => (guide.tags || []).includes(t)).length;
      return { guide: g, score: sameCategory + sharedTags };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || b.guide.popularity - a.guide.popularity)
    .slice(0, 4)
    .map(r => r.guide);

  const goTo = idx => {
    const c = Math.max(0, Math.min(guide.steps.length - 1, idx));
    setActiveStep(c);
    setTocOpen(false);
    setTimeout(() => stepRefs.current[c]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const markAndNext = () => {
    toggleStep(guide.id, guide.steps[activeStep].id, true);
    if (activeStep < guide.steps.length - 1) goTo(activeStep + 1);
  };

  const share = () => {
    const url = `${window.location.origin}#guide/${guide.slug}`;
    try { navigator.clipboard.writeText(url); } catch (err) { console.error(err); }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const D = dark;
  const bg = D ? 'bg-[#111]' : 'bg-white';
  const border = D ? 'border-zinc-800' : 'border-zinc-200';
  const text = D ? 'text-zinc-100' : 'text-zinc-900';
  const muted = D ? 'text-zinc-500' : 'text-zinc-400';
  const subtle = D ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-6 print:relative print:inset-auto print:bg-white print:p-0 print:block">
        <div className={`w-full sm:max-w-3xl h-full sm:h-[93vh] ${bg} sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl print:h-auto print:max-w-none print:overflow-visible print:shadow-none print:rounded-none print:block`}>

          {/* ── Top chrome ────────────────────────────────────── */}
          <div className={`shrink-0 border-b ${border} px-5 sm:px-8 pt-4 pb-3`}>

            {/* Breadcrumb + actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="font-semibold" style={{ color: catMeta.color }}>{guide.category}</span>
                <ChevronRight size={12} className={muted} />
                <span className={muted}>{guide.difficulty}</span>
              </div>
              <div className="flex items-center gap-0.5 print:hidden">
                <button onClick={share} aria-label="Copy share link" className={`relative p-1.5 rounded-md transition-colors ${D ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                  <Share2 size={15} />
                  {shareToast && <span className="absolute -top-7 -left-6 bg-zinc-900 text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap">Link copied!</span>}
                </button>
                <button onClick={() => onBookmark(guide.id)} aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'} className={`p-1.5 rounded-md transition-colors ${D ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
                  {bookmarked ? <BookmarkCheck size={15} className="text-blue-500" /> : <Bookmark size={15} className={muted} />}
                </button>
                <button onClick={() => window.print()} title="Print guide" aria-label="Print guide" className={`p-1.5 rounded-md transition-colors ${D ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                  <FileDown size={15} />
                </button>
                <button onClick={onClose} aria-label="Close guide" className={`p-1.5 rounded-md transition-colors ml-1 ${D ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h2 className={`text-[22px] sm:text-[25px] font-bold leading-snug mb-3 ${text}`}
              style={{ fontFamily: "'Lora', Georgia, serif" }}>
              {guide.title}
            </h2>

            {/* Meta row */}
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] mb-3 ${muted}`}>
              <span className="flex items-center gap-1"><Clock size={11} /> {guide.estimatedTime}</span>
              <span className="flex items-center gap-1"><AlignLeft size={11} /> {readMins} min read</span>
              <span className="flex items-center gap-1"><Hash size={11} /> {guide.steps.length} steps</span>
              {guide.cost && <span className="flex items-center gap-1">💰 {guide.cost}</span>}
              <span className="flex items-center gap-2 ml-auto">
                <img src={guide.author.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                {guide.author.name}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-2 print:hidden">
              <div className={`flex justify-between text-[11px] font-medium mb-1 ${muted}`}>
                <span>{completedCount} of {guide.steps.length} steps complete</span>
                {allDone
                  ? <span className="text-emerald-500 flex items-center gap-1"><PartyPopper size={11} /> Complete!</span>
                  : <span>{pct}%</span>
                }
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${D ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* TOC toggle */}
            <button
              onClick={() => setTocOpen(v => !v)}
              className={`flex items-center gap-1.5 text-[12px] font-medium mt-2 transition-colors print:hidden ${D ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'}`}
            >
              <AlignLeft size={12} /> Contents
              <ChevronDown size={12} className={`transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
            </button>

            {tocOpen && (
              <div className={`mt-2 rounded-xl border overflow-hidden print:hidden ${D ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
                {guide.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => goTo(idx)}
                    className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[12px] border-b last:border-0 transition-colors ${
                      D ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-white'
                    } ${idx === activeStep
                      ? D ? 'bg-zinc-800 text-blue-400' : 'bg-white text-blue-600'
                      : D ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {done[step.id]
                      ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      : <span className={`w-4 h-4 rounded-full border text-[9px] flex items-center justify-center font-bold shrink-0 ${D ? 'border-zinc-600 text-zinc-600' : 'border-zinc-300 text-zinc-400'}`}>{idx + 1}</span>
                    }
                    <span className="truncate">{step.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Scrollable body ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            <div className="px-5 sm:px-8 py-7 max-w-2xl mx-auto print:max-w-none">

              {/* Summary */}
              <p className={`text-[15px] leading-relaxed mb-6 ${subtle}`}>{guide.summary}</p>

              {/* Tools / Ingredients list */}
              {guide.tools?.length > 0 && (
                <div className={`rounded-xl border p-4 mb-6 ${D ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'}`}>
                  <h3 className={`text-[12px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${D ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <Wrench size={12} /> What you&apos;ll need
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.tools.map((tool, i) => (
                      <span key={i} className={`text-[12px] px-2.5 py-1 rounded-full border ${D ? 'border-zinc-700 text-zinc-300 bg-zinc-800' : 'border-zinc-200 text-zinc-600 bg-white'}`}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {guide.warnings?.length > 0 && (
                <div className={`rounded-xl border p-4 mb-6 ${D ? 'border-amber-800/40 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}>
                  <h3 className={`text-[12px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${D ? 'text-amber-400' : 'text-amber-700'}`}>
                    <AlertCircle size={12} /> Before you start
                  </h3>
                  {guide.warnings.map((w, i) => (
                    <p key={i} className={`text-[13px] ${D ? 'text-amber-300' : 'text-amber-800'}`}>• {w}</p>
                  ))}
                </div>
              )}

              {/* Featured video */}
              {featuredVideo && (
                <div className="mb-7 print:hidden">
                  <h3 className={`text-[12px] font-bold uppercase tracking-widest mb-2.5 ${D ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Watch: Related Tutorial
                  </h3>
                  <button
                    onClick={() => setVideoModal(featuredVideo)}
                    className="relative w-full rounded-xl overflow-hidden group"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${featuredVideo.id}/maxresdefault.jpg`}
                      alt={featuredVideo.title}
                      className="w-full h-48 object-cover group-hover:brightness-90 transition-all"
                      onError={e => { e.target.src = `https://img.youtube.com/vi/${featuredVideo.id}/hqdefault.jpg`; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={22} className="text-zinc-900 ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-[13px] font-semibold drop-shadow">{featuredVideo.title}</p>
                      <p className="text-white/70 text-[11px]">{featuredVideo.channel} · YouTube</p>
                    </div>
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Play size={8} fill="white" /> YouTube
                    </div>
                  </button>
                </div>
              )}

              {/* ── Steps ──────────────────────────────────────── */}
              <div className="space-y-4">
                {guide.steps.map((step, idx) => {
                  const isDone = !!done[step.id];
                  const isActive = idx === activeStep;
                  return (
                    <div
                      key={step.id}
                      ref={el => (stepRefs.current[idx] = el)}
                      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                        isDone
                          ? D ? 'border-emerald-900/50' : 'border-emerald-200'
                          : isActive
                          ? D ? 'border-blue-800/70' : 'border-blue-200'
                          : D ? 'border-zinc-800' : 'border-zinc-200'
                      }`}
                    >
                      {/* Step header — always visible */}
                      <button
                        onClick={() => setActiveStep(isActive ? -1 : idx)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors print:cursor-auto ${
                          isDone
                            ? D ? 'bg-emerald-950/30' : 'bg-emerald-50/60'
                            : isActive
                            ? D ? 'bg-blue-950/30' : 'bg-blue-50/50'
                            : D ? 'bg-zinc-900/40 hover:bg-zinc-800/60' : 'bg-zinc-50/60 hover:bg-zinc-100/60'
                        }`}
                      >
                        <button
                          onClick={e => { e.stopPropagation(); toggleStep(guide.id, step.id); }}
                          aria-label={isDone ? 'Mark step incomplete' : 'Mark step complete'}
                          className="shrink-0 print:hidden"
                        >
                          {isDone
                            ? <CheckCircle2 size={20} className="text-emerald-500" />
                            : <Circle size={20} className={D ? 'text-zinc-700' : 'text-zinc-300'} />
                          }
                        </button>
                        <span className={`text-[11px] font-bold uppercase tracking-widest w-12 shrink-0 ${isActive ? 'text-blue-500' : muted}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h4
                          className={`flex-1 text-[14px] font-semibold ${
                            isDone
                              ? D ? 'line-through text-zinc-600' : 'line-through text-zinc-400'
                              : text
                          }`}
                          style={{ fontFamily: "'Lora', Georgia, serif" }}
                        >
                          {step.title}
                        </h4>
                        <ChevronDown size={14} className={`shrink-0 ${muted} ${isActive ? 'rotate-180' : ''} transition-transform print:hidden`} />
                      </button>

                      {/* Step body — collapsed on screen unless active, always shown when printing */}
                      <div className={`${isActive ? 'block' : 'hidden print:block'} px-5 pb-5 pt-4 ${D ? 'bg-zinc-900/20' : ''}`}>
                          {/* Step image */}
                          {step.image && (
                            <button
                              onClick={() => setLightbox(step.image)}
                              aria-label="View larger image"
                              className="relative group w-full sm:w-1/2 float-right sm:ml-5 mb-4 rounded-lg overflow-hidden"
                            >
                              <img src={step.image} alt="" className="w-full h-40 object-cover group-hover:brightness-90 transition-all" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <ZoomIn size={20} className="text-white" />
                              </div>
                            </button>
                          )}

                          <p className={`text-[14px] leading-[1.75] mb-4 ${subtle}`}>{step.content}</p>

                          {/* Mobile image below text */}
                          {step.image && (
                            <button
                              onClick={() => setLightbox(step.image)}
                              aria-label="View larger image"
                              className="sm:hidden relative group w-full rounded-lg overflow-hidden mb-4"
                            >
                              <img src={step.image} alt="" className="w-full h-44 object-cover group-hover:brightness-90" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                                <ZoomIn size={18} className="text-white" />
                              </div>
                            </button>
                          )}

                          <div className="clear-both" />

                          {/* Code snippet */}
                          {step.codeSnippet && (
                            <pre className={`rounded-xl p-4 text-[12px] overflow-x-auto mb-4 leading-relaxed font-mono ${D ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-900 text-zinc-200'}`}>
                              <code>{step.codeSnippet}</code>
                            </pre>
                          )}

                          {/* Tip */}
                          {step.tip && (
                            <div className={`flex gap-2.5 rounded-xl px-4 py-3 border ${D ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200'}`}>
                              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                              <p className={`text-[13px] leading-relaxed ${D ? 'text-amber-300' : 'text-amber-800'}`}>
                                <span className="font-semibold">Tip — </span>{step.tip}
                              </p>
                            </div>
                          )}
                        </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Sources ──────────────────────────────────────── */}
              {guide.sources?.length > 0 && (
                <div className={`mt-10 pt-8 border-t ${D ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${D ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Sources & References
                  </h3>
                  <div className={`divide-y ${D ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
                    {guide.sources.map((s, i) => {
                      const Icon = SOURCE_ICON[s.type] || Link2;
                      return (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          className={`flex items-center gap-3 py-3 group transition-colors rounded-lg px-2 -mx-2 ${D ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'}`}
                        >
                          <Icon size={14} className={`shrink-0 group-hover:text-blue-500 ${D ? 'text-zinc-600' : 'text-zinc-400'}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-[13px] font-medium truncate ${D ? 'text-zinc-200' : 'text-zinc-800'}`}>{s.title}</div>
                            <div className={`text-[11px] ${D ? 'text-zinc-600' : 'text-zinc-400'}`}>{s.domain}</div>
                          </div>
                          <ExternalLink size={12} className={`shrink-0 group-hover:text-blue-500 ${D ? 'text-zinc-700' : 'text-zinc-300'}`} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Related guides ─────────────────────────────────── */}
              {related.length > 0 && (
                <div className={`mt-10 pt-8 border-t print:hidden ${D ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${D ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Related guides
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {related.map(g => {
                      const meta = CATEGORY_META[g.category] || {};
                      return (
                        <button
                          key={g.id}
                          onClick={() => onOpen?.(g)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${D ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-200 hover:bg-zinc-50'}`}
                        >
                          <img src={g.heroImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className={`text-[13px] font-semibold line-clamp-2 mb-1 ${D ? 'text-zinc-100' : 'text-zinc-900'}`}
                              style={{ fontFamily: "'Lora', serif" }}>{g.title}</p>
                            <span className="text-[11px] font-semibold" style={{ color: meta.color }}>{g.category.split(' & ')[0]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer nav ─────────────────────────────────────── */}
          <div className={`shrink-0 border-t ${border} ${bg} px-5 sm:px-8 py-3 flex items-center justify-between print:hidden`}>
            <button
              onClick={() => goTo(activeStep - 1)}
              disabled={activeStep <= 0}
              className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${D ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <span className={`text-[12px] font-medium ${muted}`}>
              {activeStep + 1} / {guide.steps.length}
            </span>
            <button
              onClick={markAndNext}
              disabled={activeStep >= guide.steps.length - 1}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Mark done & next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      <VideoModal video={videoModal} onClose={() => setVideoModal(null)} />
    </>
  );
}
