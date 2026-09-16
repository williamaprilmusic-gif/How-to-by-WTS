import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { console.error(err); }
  }, [key, value]);

  return [value, setValue];
}

export function useGuideStore() {
  const [guides, setGuides] = useLocalStorage('howto_guides', []);
  const [bookmarks, setBookmarks] = useLocalStorage('howto_bookmarks', []);
  const [completedMap, setCompletedMap] = useLocalStorage('howto_completed', {});
  const [generating, setGenerating] = useState({});

  const addGuide = useCallback((guide) => {
    setGuides(prev => {
      const exists = prev.find(g => g.id === guide.id);
      return exists ? prev : [guide, ...prev];
    });
  }, [setGuides]);

  const addGuides = useCallback((newGuides) => {
    setGuides(prev => {
      const ids = new Set(prev.map(g => g.id));
      const fresh = newGuides.filter(g => !ids.has(g.id));
      return [...fresh, ...prev];
    });
  }, [setGuides]);

  const toggleBookmark = useCallback((id) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }, [setBookmarks]);

  const toggleStep = useCallback((guideId, stepId, forceTrue = false) => {
    setCompletedMap(prev => {
      const m = { ...(prev[guideId] || {}) };
      m[stepId] = forceTrue ? true : !m[stepId];
      return { ...prev, [guideId]: m };
    });
  }, [setCompletedMap]);

  const setGuideGenerating = useCallback((topicKey, val) => {
    setGenerating(prev => ({ ...prev, [topicKey]: val }));
  }, []);

  const guideProgress = useCallback((guide) => {
    const done = completedMap[guide.id] || {};
    const count = guide.steps.filter(s => done[s.id]).length;
    return { count, total: guide.steps.length, pct: Math.round((count / guide.steps.length) * 100) };
  }, [completedMap]);

  return {
    guides, addGuide, addGuides,
    bookmarks, toggleBookmark,
    completedMap, toggleStep,
    generating, setGuideGenerating,
    guideProgress,
  };
}
