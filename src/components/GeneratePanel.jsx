import { useState, useCallback, useMemo } from 'react';
import { Sparkles, Loader2, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { TOPIC_SEEDS, ALL_CATEGORIES, CATEGORY_META } from '../lib/topics.js';
import { generateGuide } from '../lib/generator.js';

export default function GeneratePanel({ onGuideGenerated, existingGuides, dark }) {
  const [status, setStatus] = useState({}); // topicKey -> 'loading' | 'done' | 'error'
  const [expanded, setExpanded] = useState(null);

  const existingTitles = useMemo(
    () => new Set(existingGuides.map(g => g.title.toLowerCase())),
    [existingGuides]
  );

  const topicKey = (cat, topic) => `${cat}::${topic}`;

  const generate = useCallback(async (category, topic) => {
    const key = topicKey(category, topic);
    if (status[key] === 'loading') return;
    setStatus(s => ({ ...s, [key]: 'loading' }));
    try {
      const guide = await generateGuide(topic, category);
      onGuideGenerated(guide);
      setStatus(s => ({ ...s, [key]: 'done' }));
    } catch (err) {
      console.error(err);
      setStatus(s => ({ ...s, [key]: 'error' }));
    }
  }, [status, onGuideGenerated]);

  const doneCount = Object.values(status).filter(v => v === 'done').length;
  const totalTopics = ALL_CATEGORIES.reduce((n, c) => n + TOPIC_SEEDS[c].length, 0);

  return (
    <div className={`rounded-xl border mb-8 overflow-hidden ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b flex items-center gap-3 ${dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
        <div className="p-2 rounded-lg bg-blue-600/10">
          <Sparkles size={16} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-[14px] font-semibold ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            AI Guide Generator
          </h2>
          <p className={`text-[12px] ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {doneCount}/{totalTopics} guides generated across {ALL_CATEGORIES.length} categories
          </p>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:block w-32">
          <div className={`h-1.5 rounded-full ${dark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.round((doneCount / totalTopics) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category rows */}
      {ALL_CATEGORIES.map(cat => {
        const meta = CATEGORY_META[cat];
        const topics = TOPIC_SEEDS[cat];
        const catDone = topics.filter(t => status[topicKey(cat, t)] === 'done').length;
        const isExpanded = expanded === cat;

        return (
          <div key={cat} className={`border-b last:border-0 ${dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
            {/* Category header */}
            <button
              onClick={() => setExpanded(isExpanded ? null : cat)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${dark ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
              <span className={`text-[13px] font-medium flex-1 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{cat}</span>
              <span className={`text-[11px] font-semibold ${catDone === topics.length ? 'text-emerald-500' : dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {catDone}/{topics.length}
              </span>

              {isExpanded ? <ChevronUp size={14} className={dark ? 'text-zinc-500' : 'text-zinc-400'} /> : <ChevronDown size={14} className={dark ? 'text-zinc-500' : 'text-zinc-400'} />}
            </button>

            {/* Topic list */}
            {isExpanded && (
              <div className={`px-5 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 ${dark ? 'bg-zinc-900/50' : 'bg-zinc-50/50'}`}>
                {topics.map(topic => {
                  const key = topicKey(cat, topic);
                  const s = status[key];
                  const isExisting = existingTitles.has(topic.toLowerCase());

                  return (
                    <button
                      key={topic}
                      onClick={() => generate(cat, topic)}
                      disabled={s === 'loading' || s === 'done' || isExisting}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-[12px] ${
                        s === 'done' || isExisting
                          ? dark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                          : s === 'error'
                          ? dark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          : s === 'loading'
                          ? dark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                          : dark ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-white text-zinc-600'
                      }`}
                    >
                      {s === 'loading' && <Loader2 size={12} className="animate-spin shrink-0" />}
                      {(s === 'done' || isExisting) && <CheckCircle2 size={12} className="shrink-0" />}
                      {s === 'error' && <RefreshCw size={12} className="shrink-0" />}
                      {!s && !isExisting && <span className="w-3 h-3 rounded-full border shrink-0" style={{ borderColor: meta.color }} />}
                      <span className="truncate">{topic}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
