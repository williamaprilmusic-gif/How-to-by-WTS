import { Search, Bookmark, Sun, Moon, Plus, X } from 'lucide-react';
import Logo from './Logo.jsx';

export default function TopBar({ query, setQuery, bookmarkCount, onBookmarks, onCreate, dark, setDark }) {
  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${
      dark ? 'bg-zinc-950/95 border-zinc-800' : 'bg-white/95 border-zinc-200'
    } backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Logo dark={dark} />

        {/* Search */}
        <div className="flex-1 max-w-sm ml-4 hidden sm:block relative">
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? 'text-zinc-600' : 'text-zinc-400'}`} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any how-to topic…"
            className={`w-full pl-8 pr-8 py-1.5 rounded-lg text-[13px] border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              dark
                ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400'
            }`}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X size={12} className="text-zinc-400" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Submit */}
        <button
          onClick={onCreate}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={14} /> Submit guide
        </button>

        {/* Bookmarks */}
        <button
          onClick={onBookmarks}
          aria-label="View saved guides"
          className={`relative p-2 rounded-lg transition-colors ${dark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
        >
          <Bookmark size={17} className={dark ? 'text-zinc-300' : 'text-zinc-600'} />
          {bookmarkCount > 0 && (
            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
              {bookmarkCount}
            </span>
          )}
        </button>

        {/* Dark mode */}
        <button
          onClick={() => setDark(d => !d)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
        >
          {dark
            ? <Sun size={17} className="text-zinc-300" />
            : <Moon size={17} className="text-zinc-600" />
          }
        </button>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3 relative">
        <Search size={13} className="absolute left-7 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any how-to…"
          className={`w-full pl-8 pr-3 py-2 rounded-lg text-[13px] border focus:outline-none ${
            dark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
          }`}
        />
      </div>
    </header>
  );
}
