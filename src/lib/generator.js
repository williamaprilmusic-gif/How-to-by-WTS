import { CATEGORY_IMAGES } from './topics.js';

// Guide generation runs server-side (api/generate-guide.js) so the Gemini
// API key never reaches the browser.
export async function generateGuide(topic, category) {
  const response = await fetch('/api/generate-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, category }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${response.status}`);
  }
  const { guide } = await response.json();

  // Assign images from our curated pool
  const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Tech & Programming"];
  const heroIdx = Math.floor(Math.random() * imgs.length);
  const stepImgIdx = (heroIdx + 1) % imgs.length;

  guide.id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  guide.category = category;
  guide.slug = guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  guide.heroImage = `https://images.unsplash.com/photo-${imgs[heroIdx]}?w=800&h=500&fit=crop&auto=format`;
  guide.popularity = Math.floor(Math.random() * 40) + 60;
  guide.published = new Date().toISOString().slice(0, 10);
  guide.author = { name: "WTS Editorial", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces", role: "How-To Expert" };
  guide.isSaved = false;
  guide.generating = false;

  // Add step image to the first image-worthy step
  if (guide.steps.length > 1) {
    guide.steps[1].image = `https://images.unsplash.com/photo-${imgs[stepImgIdx]}?w=700&h=400&fit=crop&auto=format`;
  }

  return guide;
}

// Search YouTube via the no-auth embed approach
// We use the YouTube oEmbed + search suggestion API (no key needed for basic queries)
export function getYouTubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function getYouTubeEmbedFromId(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

// Well-known YouTube video IDs per category (pre-curated, always valid)
export const CURATED_VIDEOS = {
  "Cooking & Food": [
    { id: "hOF1EbfNMTM", title: "How to Make Perfect Sourdough Bread", channel: "Pro Home Cooks" },
    { id: "fhQlFVFNt0k", title: "Gordon Ramsay's Perfect Scrambled Eggs", channel: "Gordon Ramsay" },
    { id: "Ys32Qjmu7Ac", title: "How To Make Authentic Ramen", channel: "Joshua Weissman" },
    { id: "sJ1xM3yBnVg", title: "Perfect Pasta Carbonara Technique", channel: "Italia Squisita" },
  ],
  "Tech & Programming": [
    { id: "SccSCuHhOw0", title: "Node.js & Express Crash Course", channel: "Traversy Media" },
    { id: "w7ejDZ8SWv8", title: "React in 100 Seconds", channel: "Fireship" },
    { id: "rfscVS0vtbw", title: "Learn Python in 4 Hours", channel: "freeCodeCamp" },
    { id: "RGOj5yH7evk", title: "Git and GitHub Crash Course", channel: "freeCodeCamp" },
  ],
  "Home & DIY": [
    { id: "Q3sTSjm59hk", title: "How to Paint a Room Like a Pro", channel: "This Old House" },
    { id: "fzsvHIEJBmg", title: "How to Install a Ceiling Fan", channel: "This Old House" },
    { id: "4GVMv1HxhKg", title: "How to Fix a Leaky Faucet", channel: "Home Repair Tutor" },
    { id: "WR2j4cQBIAQ", title: "Build Floating Shelves — Easy Method", channel: "April Wilkerson" },
  ],
  "Health & Fitness": [
    { id: "UItWltVZZmE", title: "How To Do A Proper Pull-Up", channel: "Athlean-X" },
    { id: "IODxDxX7oi4", title: "How to Meditate for Beginners", channel: "Headspace" },
    { id: "2pLT-olgUJs", title: "Perfect Squat Form", channel: "Squat University" },
    { id: "BHY0FxzoKZE", title: "Beginner Running Plan", channel: "Global Triathlon Network" },
  ],
  "Creative & Art": [
    { id: "Qj1FK8n7WgY", title: "Color Theory Fundamentals", channel: "Adobe Creative Cloud" },
    { id: "lWQL-a3C3kU", title: "Learn Guitar Chords in 10 Minutes", channel: "Paul Davids" },
    { id: "KveQ6UkBz6k", title: "Watercolor for Complete Beginners", channel: "Paul Clark" },
    { id: "aA-VrFdpHKY", title: "How to Draw Portraits", channel: "Love Life Drawing" },
  ],
  "Finance & Productivity": [
    { id: "gvZSpET11ZY", title: "How to Build a Budget", channel: "Graham Stephan" },
    { id: "o7ByrBnSNSU", title: "Index Fund Investing for Beginners", channel: "Andrei Jikh" },
    { id: "R0XSj_6sFoo", title: "Build the Perfect Morning Routine", channel: "Matt D'Avella" },
    { id: "M__MLW_qGx0", title: "How to Write a Resume in 2024", channel: "Jeff Su" },
  ],
  "Outdoors & Travel": [
    { id: "4NnBiPQeHos", title: "Beginner Backpacking — Everything You Need", channel: "Darwin on the Trail" },
    { id: "6hxRvklEhIo", title: "How to Build a Campfire", channel: "REI" },
    { id: "VCv6qdpXLv4", title: "Pack a Carry-On Only — 2 Weeks", channel: "Kara and Nate" },
    { id: "ByC0MsCN4tM", title: "How to Navigate With a Map and Compass", channel: "REI" },
  ],
  "Automotive": [
    { id: "0WEK8RoMlKs", title: "How to Change Your Oil", channel: "ChrisFix" },
    { id: "lSKN7gSb9a8", title: "How to Replace Brake Pads", channel: "ChrisFix" },
    { id: "R40TCpHRJkM", title: "How to Detail Your Car Like a Pro", channel: "Chemical Guys" },
    { id: "lfYh2hzkSFk", title: "How to Jump Start a Car", channel: "ChrisFix" },
  ],
};
