import { useState, useEffect, useMemo } from 'react';
import { contentAPI, recommendationsAPI } from '../api';
import { usePersonalization } from '../context/PersonalizationContext';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import {
  Search, Filter, Sparkles, SlidersHorizontal, BookOpen,
  CheckCircle2, XCircle, RotateCcw, Compass, ArrowUpDown
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'ai', label: '🤖 AI & ML' },
  { id: 'webdev', label: '🌐 Web Dev' },
  { id: 'business', label: '💼 Business' },
  { id: 'career', label: '🎯 Career' },
  { id: 'data-science', label: '📊 Data Science' },
  { id: 'design', label: '🎨 Design' },
  { id: 'marketing', label: '📣 Marketing' },
  { id: 'cybersecurity', label: '🔒 Security' },
  { id: 'finance', label: '💰 Finance' },
  { id: 'communication', label: '💬 Soft Skills' },
];

const DIFFICULTIES = [
  { id: 'all', label: 'Any Difficulty' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const CONTENT_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'project', label: 'Project' },
  { id: 'article', label: 'Article' },
  { id: 'challenge', label: 'Challenge' },
];

export default function Discover() {
  const { profile, recommendations: contextRecs } = usePersonalization();
  const [allContent, setAllContent] = useState([]);
  const [scoredRecs, setScoredRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('personalized'); // 'personalized' | 'newest' | 'title'

  // Fetch complete catalog + full personalized ranking (real scores for every item)
  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const [contentRes, recsRes] = await Promise.all([
          contentAPI.getAll({ limit: 50 }),
          recommendationsAPI.get({ limit: 50 }),
        ]);
        setAllContent(contentRes.data.content || []);
        setScoredRecs(recsRes.data.recommendations || []);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  // Map REAL recommendation scores into catalog items
  const recMap = useMemo(() => {
    const source = scoredRecs.length > 0 ? scoredRecs : contextRecs;
    const map = new Map();
    if (source && source.length > 0) {
      source.forEach((r) => {
        map.set(r.id, {
          personalizationScore: r.personalizationScore,
          scoreBreakdown: r.breakdown,
          matchReasons: r.matchReasons,
          feedbackStatus: r.feedbackStatus,
        });
      });
    }
    return map;
  }, [scoredRecs, contextRecs]);

  // Combine catalog with recommendation scoring
  const enrichedContent = useMemo(() => {
    return allContent.map((item) => {
      const recData = recMap.get(item.id);
      return {
        ...item,
        // No fake fallback: items without a real engine score show no score badge
        personalizationScore: recData?.personalizationScore ?? 0,
        scoreBreakdown: recData?.scoreBreakdown,
        matchReasons: recData?.matchReasons || [],
        feedbackStatus: recData?.feedbackStatus || item.feedbackStatus,
      };
    });
  }, [allContent, recMap]);

  // Filter & sort
  const filteredItems = useMemo(() => {
    let result = enrichedContent.filter((item) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        let tagsMatch = false;
        try {
          const tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
          tagsMatch = tags.some((t) => t.toLowerCase().includes(query));
        } catch (_) {}
        if (!titleMatch && !descMatch && !tagsMatch) return false;
      }

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all' && item.difficulty !== selectedDifficulty) {
        return false;
      }

      // Type
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'personalized') {
      result.sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [enrichedContent, search, selectedCategory, selectedDifficulty, selectedType, sortBy]);

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedType !== 'all' ||
    sortBy !== 'personalized';

  // Show the two-tier "Personalized for You" / "Explore Everything" view
  // only in the default unfiltered state
  const showSections = !hasActiveFilters && filteredItems.length > 6;

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
    setSortBy('personalized');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900/40 via-surface-900 to-accent-950/40 border border-white/10 p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-3">
            <Compass size={14} />
            <span>Intelligent Content Discovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
            Explore Learning Resources
          </h1>
          <p className="text-surface-300 text-sm leading-relaxed">
            Browse our full curriculum or filter by your current goals. Resources are scored
            and sorted in real time by your evolving AI personalization model.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search and Filters Bar */}
      <div className="card p-4 space-y-4">
        {/* Search input + Sort row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, or technology (e.g. RAG, React, prompt)..."
              className="w-full bg-surface-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-950/60 border border-white/10 rounded-xl text-xs text-surface-300">
              <ArrowUpDown size={14} className="text-brand-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="personalized" className="bg-surface-900 text-white">✨ AI Match (Highest)</option>
                <option value="newest" className="bg-surface-900 text-white">Newest First</option>
                <option value="title" className="bg-surface-900 text-white">Alphabetical (A-Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-surface-400 hover:text-white bg-surface-800/60 hover:bg-surface-800 rounded-xl transition-colors"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-surface-950/50 hover:bg-surface-800 text-surface-300 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters (Difficulty & Type) */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-surface-400">Difficulty:</span>
            <div className="flex gap-1">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedDifficulty === diff.id
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 font-medium'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-surface-400">Format:</span>
            <div className="flex gap-1">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedType === t.id
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 font-medium'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto text-surface-400 text-xs">
            Showing <span className="text-white font-medium">{filteredItems.length}</span> of {allContent.length} resources
          </div>
        </div>
      </div>

      {/* Grid of Content Items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3 animate-pulse">
              <div className="h-36 skeleton rounded-xl" />
              <div className="h-4 skeleton rounded w-3/4" />
              <div className="h-3 skeleton rounded w-full" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        showSections ? (
          <>
            {/* Personalized for You — top engine matches */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-brand-400" />
                <h2 className="text-base font-semibold text-white">Personalized for You</h2>
              </div>
              <p className="text-surface-400 text-xs mb-4">
                Top matches from your personalization engine — ranked by goal, interests, skill and behavior.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.slice(0, 6).map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    showExplain={true}
                    showFeedback={true}
                  />
                ))}
              </div>
            </div>

            {/* Explore Everything — the full catalog */}
            <div>
              <div className="flex items-center gap-2 mb-1 mt-2">
                <BookOpen size={16} className="text-surface-300" />
                <h2 className="text-base font-semibold text-white">Explore Everything</h2>
              </div>
              <p className="text-surface-400 text-xs mb-4">
                The complete catalog — still scored and sorted by your personal profile.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.slice(6).map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    showExplain={true}
                    showFeedback={true}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                showExplain={true}
                showFeedback={true}
              />
            ))}
          </div>
        )
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto text-surface-400">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-1">No matches found</h3>
            <p className="text-surface-400 text-xs">
              We couldn't find any resources matching your search criteria and filters.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
