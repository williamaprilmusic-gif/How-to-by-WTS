import { Bookmark, BookmarkCheck, Clock, CheckCircle2 } from 'lucide-react';
import { CATEGORY_META, DIFFICULTY_META } from '../lib/topics.js';

export default function GuideCard({ guide, onOpen, bookmarked, onBookmark, progress, dark }) {
  const catMeta = CATEGORY_META[guide.category] || {};
  const diffMeta = DIFFICULTY_META[guide.difficulty] || {};
  const { pct } = progress;

  return (
    <div
      onClick={() => onOpen(guide)}
      className={`group cursor-pointer rounded-xl overflow-hidden border flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${
        dark
          ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/30'
          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/70'
      }`}
    >
      {/* Hero image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <img
          src={guide.heroImage}
          alt={guide.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
          loading="lazy"
        />

        {/* Category badge */}
        <span
          className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: catMeta.color }}
        >
          {guide.category.split(' & ')[0]}
        </span>

        {/* Bookmark */}
        <button
          onClick={e => { e.stopPropagation(); onBookmark(guide.id); }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          {bookmarked
            ? <BookmarkCheck size={14} className="text-blue-400" />
            : <Bookmark size={14} className="text-white" />
          }
        </button>

        {/* Progress overlay */}
        {pct > 0 && (
          <>
            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/30">
              <div
                className={`h-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-400' : 'bg-blue-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct === 100 && (
              <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} /> Done
              </div>
            )}
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${diffMeta.bg} ${diffMeta.text}`}>
            {guide.difficulty}
          </span>
          <span className={`text-[11px] flex items-center gap-1 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <Clock size={11} /> {guide.estimatedTime}
          </span>
          {pct > 0 && pct < 100 && (
            <span className="ml-auto text-[11px] font-semibold text-blue-500">{pct}%</span>
          )}
        </div>

        <h3
          className={`text-[14px] font-semibold leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}
          style={{ fontFamily: "'Lora', Georgia, serif" }}
        >
          {guide.title}
        </h3>

        <p className={`text-[12px] leading-relaxed line-clamp-2 flex-1 ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          {guide.summary}
        </p>

        <div className={`flex items-center justify-between mt-3 pt-3 border-t ${dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <div className="flex items-center gap-2">
            <img src={guide.author.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            <span className={`text-[11px] font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {guide.author.name}
            </span>
          </div>
          <span className={`text-[11px] ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {guide.steps?.length || 0} steps
          </span>
        </div>
      </div>
    </div>
  );
}
