import { ALL_CATEGORIES, CATEGORY_META } from '../lib/topics.js';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Sidebar({ category, setCategory, difficulty, setDifficulty, dark, guideCounts }) {
  const base = `w-full text-left px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center justify-between`;
  const active = dark ? 'bg-stone-800 text-white' : 'bg-stone-900 text-white';
  const inactive = dark ? 'text-stone-400 hover:bg-stone-800/60 hover:text-stone-200' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900';

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 pt-8 pr-6 gap-7">
      {/* Categories */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 px-2.5 ${dark ? 'text-stone-600' : 'text-stone-400'}`}>
          Category
        </p>
        <div className="space-y-0.5">
          <button onClick={() => setCategory('All')} className={`${base} ${category === 'All' ? active : inactive}`}>
            <span>All guides</span>
            {guideCounts?.All > 0 && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${dark ? 'bg-stone-700 text-stone-400' : 'bg-stone-100 text-stone-400'}`}>
                {guideCounts.All}
              </span>
            )}
          </button>
          {ALL_CATEGORIES.map(c => {
            const meta = CATEGORY_META[c];
            const isActive = category === c;
            return (
              <button key={c} onClick={() => setCategory(c)} className={`${base} ${isActive ? active : inactive}`}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                  <span className="truncate">{c.split(' & ')[0]}</span>
                </span>
                {guideCounts?.[c] > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${dark ? 'bg-stone-700 text-stone-400' : 'bg-stone-100 text-stone-400'}`}>
                    {guideCounts[c]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 px-2.5 ${dark ? 'text-stone-600' : 'text-stone-400'}`}>
          Difficulty
        </p>
        <div className="space-y-0.5">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)} className={`${base} ${difficulty === d ? active : inactive}`}>
              {d === 'All' ? 'All levels' : d}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
