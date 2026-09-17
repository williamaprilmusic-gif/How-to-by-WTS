import { Search, Bookmark, Sun, Moon, Plus, X } from 'lucide-react';
import Logo from './Logo.jsx';

export default function TopBar({ query, setQuery, bookmarkCount, onBookmarks, onCreate, dark, setDark }) {
  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${
      dark ? 'bg-stone-950/95 border-stone-800' : 'bg-white/95 border-stone-200'
    } backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Logo dark={dark} />

        {/* Search */}
        <div className="flex-1 max-w-sm ml-4 hidden sm:block relative">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? 'text-stone-600' : 'text-stone-400'}`} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any how-to topic…"
            className={`w-full pl-8 pr-8 py-1.5 rounded-lg text-[13px] border transition-all focus:outline-none focus:ring-2 focus:ring-amber-600/20 ${
              dark
                ? 'bg-stone-900 border-stone-700 text-stone-100 placeholder:text-stone-600 focus:border-stone-500'
                : 'bg-stone-50 border-stone-200 text-slate-800 placeholder:text-stone-400 focus:border-stone-400'
            }`}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X size={12} className="text-stone-400" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Submit */}
        <button
          onClick={onCreate}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-amber-700 text-white hover:bg-amber-800 active:bg-amber-900 transition-colors"
        >
          <Plus size={14} /> Submit guide
        </button>

        {/* Bookmarks */}
        <button
          onClick={onBookmarks}
          aria-label="View saved guides"
          className={`relative p-2 rounded-lg transition-colors ${dark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'}`}
        >
          <Bookmark size={17} className={dark ? 'text-stone-300' : 'text-stone-600'} />
          {bookmarkCount > 0 && (
            <span className="absolute top-0 right-0 bg-amber-700 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
              {bookmarkCount}
            </span>
          )}
        </button>

        {/* Dark mode */}
        <button
          onClick={() => setDark(d => !d)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'}`}
        >
          {dark
            ? <Sun size={17} className="text-stone-300" />
            : <Moon size={17} className="text-stone-600" />
          }
        </button>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3 relative">
        <Search size={13} className="absolute left-7 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any how-to…"
          className={`w-full pl-8 pr-3 py-2 rounded-lg text-[13px] border focus:outline-none ${
            dark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-200 text-slate-800'
          }`}
        />
      </div>
    </header>
  );
}
