import { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart2, AlignLeft, Sparkles, ChevronRight } from 'lucide-react';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import GuideCard from './components/GuideCard.jsx';
import GeneratePanel from './components/GeneratePanel.jsx';
import ReaderModal from './components/ReaderModal.jsx';
import { BookmarksDrawer, CreateGuideModal } from './components/Drawers.jsx';
import { useGuideStore, useLocalStorage } from './hooks/useGuideStore.js';
import { CATEGORY_META } from './lib/topics.js';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function estimatedMinutes(text) {
  const match = String(text || '').match(/(\d+(\.\d+)?)/);
  const num = match ? parseFloat(match[1]) : 0;
  return /hour/i.test(text) ? num * 60 : num;
}

function MobileFilters({ category, setCategory, difficulty, setDifficulty, dark }) {
  const categories = ['All', ...Object.keys(CATEGORY_META)];
  const btn = (active) => `px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors border ${
    active ? 'bg-slate-800 text-white border-slate-800' : dark ? 'border-stone-700 text-stone-400 hover:border-stone-500' : 'border-stone-200 text-stone-500 hover:border-stone-400'
  }`;
  return (
    <div className="lg:hidden mb-6 space-y-2.5">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(c => <button key={c} onClick={() => setCategory(c)} className={btn(category === c)}>{c === 'All' ? 'All' : c.split(' & ')[0]}</button>)}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {DIFFICULTIES.map(d => <button key={d} onClick={() => setDifficulty(d)} className={btn(difficulty === d)}>{d === 'All' ? 'All levels' : d}</button>)}
      </div>
    </div>
  );
}

function ViewBar({ view, setView, sort, setSort, count, dark }) {
  return (
    <div className={`flex items-center gap-3 mb-5 pb-4 border-b ${dark ? 'border-stone-800' : 'border-stone-100'}`}>
      <span className={`text-[12px] font-medium ${dark ? 'text-stone-500' : 'text-stone-400'}`}>{count} guide{count !== 1 ? 's' : ''}</span>
      <div className="flex-1" />
      <select value={sort} onChange={e => setSort(e.target.value)}
        className={`text-[12px] rounded-lg border px-2.5 py-1.5 focus:outline-none cursor-pointer ${dark ? 'bg-stone-900 border-stone-700 text-stone-300' : 'bg-white border-stone-200 text-stone-600'}`}>
        <option value="popular">Most popular</option>
        <option value="newest">Newest</option>
        <option value="quickest">Quickest first</option>
        <option value="az">A → Z</option>
      </select>
      <div className={`flex rounded-lg border overflow-hidden ${dark ? 'border-stone-700' : 'border-stone-200'}`}>
        {[['grid', BarChart2], ['list', AlignLeft]].map(([v, Icon]) => (
          <button key={v} onClick={() => setView(v)} aria-label={v === 'grid' ? 'Grid view' : 'List view'} aria-pressed={view === v} className={`p-1.5 transition-colors ${view === v ? dark ? 'bg-stone-700 text-white' : 'bg-slate-800 text-white' : dark ? 'text-stone-500 hover:bg-stone-800' : 'text-stone-400 hover:bg-stone-50'}`}><Icon size={13} /></button>
        ))}
      </div>
    </div>
  );
}

function FeaturedBanner({ guide, onOpen }) {
  if (!guide) return null;
  const catMeta = CATEGORY_META[guide.category] || {};
  return (
    <div onClick={() => onOpen(guide)} className="relative cursor-pointer overflow-hidden rounded-2xl mb-8 group">
      <img src={guide.heroImage} alt={guide.title} className="w-full h-64 sm:h-80 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Featured</span>
          <span className="text-stone-500">·</span>
          <span className="text-[11px] font-semibold" style={{ color: catMeta.color }}>{guide.category}</span>
        </div>
        <h2 className="text-white text-xl sm:text-2xl font-bold leading-snug max-w-2xl mb-4" style={{ fontFamily: "'Lora', Georgia, serif" }}>{guide.title}</h2>
        <button className="inline-flex items-center gap-2 bg-white text-slate-800 text-[13px] font-bold px-4 py-2 rounded-xl hover:bg-stone-100 transition-colors">
          Start guide <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function GuideListRow({ guide, onOpen, bookmarked, onBookmark, progress, dark }) {
  const catMeta = CATEGORY_META[guide.category] || {};
  const { pct } = progress;
  return (
    <div onClick={() => onOpen(guide)} className={`group flex items-center gap-4 px-4 py-3.5 border-b cursor-pointer transition-colors ${dark ? 'border-stone-800 hover:bg-stone-900' : 'border-stone-100 hover:bg-stone-50'}`}>
      <img src={guide.heroImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 hidden sm:block" />
      <div className="flex-1 min-w-0">
        <h3 className={`text-[14px] font-semibold truncate mb-0.5 group-hover:text-amber-600 transition-colors ${dark ? 'text-stone-100' : 'text-slate-800'}`} style={{ fontFamily: "'Lora', serif" }}>{guide.title}</h3>
        <div className={`flex items-center gap-2 text-[12px] ${dark ? 'text-stone-500' : 'text-stone-400'}`}>
          <span style={{ color: catMeta.color }} className="font-semibold">{guide.category.split(' & ')[0]}</span>
          <span>·</span><span>{guide.difficulty}</span><span>·</span><span>{guide.estimatedTime}</span>
          {pct > 0 && <><span>·</span><span className="text-amber-600 font-semibold">{pct}%</span></>}
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onBookmark(guide.id); }} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${bookmarked ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : dark ? 'text-stone-600 hover:text-stone-300' : 'text-stone-300 hover:text-stone-600'}`}>
        {bookmarked ? 'Saved' : 'Save'}
      </button>
      <ChevronRight size={14} className={`shrink-0 ${dark ? 'text-stone-700 group-hover:text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`} />
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState('grid');
  const [dark, setDark] = useLocalStorage('howto_dark_mode', false);
  const [showGenerator, setShowGenerator] = useState(true);
  const [activeGuide, setActiveGuide] = useState(null);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { guides, addGuide, bookmarks, toggleBookmark, completedMap, toggleStep, guideProgress } = useGuideStore();

  const guideCounts = useMemo(() => {
    const counts = { All: guides.length };
    Object.keys(CATEGORY_META).forEach(c => { counts[c] = guides.filter(g => g.category === c).length; });
    return counts;
  }, [guides]);

  const filtered = useMemo(() => {
    let list = [...guides];
    if (category !== 'All') list = list.filter(g => g.category === category);
    if (difficulty !== 'All') list = list.filter(g => g.difficulty === difficulty);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(g => [g.title, g.summary, g.category, g.difficulty, ...(g.tags || [])].join(' ').toLowerCase().includes(q));
    if (sort === 'popular') list.sort((a, b) => b.popularity - a.popularity);
    if (sort === 'newest') list.sort((a, b) => new Date(b.published) - new Date(a.published));
    if (sort === 'quickest') list.sort((a, b) => estimatedMinutes(a.estimatedTime) - estimatedMinutes(b.estimatedTime));
    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [guides, category, difficulty, query, sort]);

  const featured = useMemo(() => guides.find(g => g.isFeatured) || guides[0], [guides]);

  const initialHashHandled = useRef(false);
  useEffect(() => {
    if (initialHashHandled.current) return;
    initialHashHandled.current = true;
    const match = window.location.hash.match(/^#guide\/(.+)$/);
    if (match) {
      const found = guides.find(g => g.slug === match[1]);
      if (found) setActiveGuide(found);
    }
  }, [guides]);

  useEffect(() => {
    const onHashChange = () => {
      const match = window.location.hash.match(/^#guide\/(.+)$/);
      const found = match ? guides.find(g => g.slug === match[1]) : null;
      setActiveGuide(found || null);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [guides]);

  useEffect(() => {
    if (activeGuide) {
      if (window.location.hash !== `#guide/${activeGuide.slug}`) {
        window.location.hash = `guide/${activeGuide.slug}`;
      }
    } else if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [activeGuide]);

  return (
    <div className={dark ? 'dark' : ''} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className={`min-h-screen transition-colors ${dark ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <TopBar query={query} setQuery={setQuery} bookmarkCount={bookmarks.length}
          onBookmarks={() => setBookmarksOpen(true)} onCreate={() => setCreateOpen(true)}
          dark={dark} setDark={setDark} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-0">
          <Sidebar category={category} setCategory={setCategory} difficulty={difficulty} setDifficulty={setDifficulty} dark={dark} guideCounts={guideCounts} />

          <main className="flex-1 min-w-0 lg:pl-8 py-7">
            <MobileFilters category={category} setCategory={setCategory} difficulty={difficulty} setDifficulty={setDifficulty} dark={dark} />

            <button onClick={() => setShowGenerator(v => !v)}
              className={`flex items-center gap-2 text-[13px] font-semibold mb-4 ${dark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-slate-800'}`}>
              <Sparkles size={15} className="text-amber-600" /> AI Guide Generator
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${dark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-400'}`}>{showGenerator ? 'hide' : 'show'}</span>
            </button>

            {showGenerator && <GeneratePanel onGuideGenerated={addGuide} existingGuides={guides} dark={dark} />}

            {!query && category === 'All' && guides.length > 0 && <FeaturedBanner guide={featured} onOpen={setActiveGuide} dark={dark} />}

            {guides.length > 0 && (
              <>
                <ViewBar view={view} setView={setView} sort={sort} setSort={setSort} count={filtered.length} dark={dark} />
                {filtered.length === 0
                  ? <div className={`py-20 text-center rounded-2xl border border-dashed ${dark ? 'border-stone-800 text-stone-600' : 'border-stone-200 text-stone-400'}`}><p>No guides match those filters.</p></div>
                  : view === 'grid'
                    ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(g => <GuideCard key={g.id} guide={g} onOpen={setActiveGuide} bookmarked={bookmarks.includes(g.id)} onBookmark={toggleBookmark} progress={guideProgress(g)} dark={dark} />)}
                      </div>
                    : <div className={`rounded-xl border overflow-hidden ${dark ? 'border-stone-800' : 'border-stone-200'}`}>
                        {filtered.map(g => <GuideListRow key={g.id} guide={g} onOpen={setActiveGuide} bookmarked={bookmarks.includes(g.id)} onBookmark={toggleBookmark} progress={guideProgress(g)} dark={dark} />)}
                      </div>
                }
              </>
            )}

            {guides.length === 0 && (
              <div className={`py-24 text-center rounded-2xl border border-dashed ${dark ? 'border-stone-800 text-stone-600' : 'border-stone-200 text-stone-400'}`}>
                <Sparkles size={28} className="mx-auto mb-3 text-amber-500" />
                <p className="text-[15px] font-medium mb-1">No guides yet</p>
                <p className="text-[13px]">Use the AI Generator above to create your first guides</p>
              </div>
            )}

            <footer className={`mt-16 pt-8 border-t text-center text-[12px] ${dark ? 'border-stone-800 text-stone-700' : 'border-stone-100 text-stone-400'}`}>How To by WTS</footer>
          </main>
        </div>

        <ReaderModal guide={activeGuide} guides={guides} onOpen={setActiveGuide} onClose={() => setActiveGuide(null)} completedMap={completedMap} toggleStep={toggleStep} bookmarked={activeGuide ? bookmarks.includes(activeGuide.id) : false} onBookmark={toggleBookmark} dark={dark} />
        <BookmarksDrawer open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} guides={guides} bookmarks={bookmarks} onOpen={setActiveGuide} onBookmark={toggleBookmark} dark={dark} />
        <CreateGuideModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addGuide} dark={dark} />
      </div>
    </div>
  );
}
