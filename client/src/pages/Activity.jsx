import { useState, useEffect } from 'react';
import { interactionsAPI } from '../api';
import {
  Activity as ActivityIcon, Eye, ThumbsUp, ThumbsDown, Bookmark,
  CheckCircle, FastForward, MessageSquare, Search, Sliders,
  RefreshCw, Clock, ArrowRight, ShieldCheck, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_CONFIG = {
  VIEW: {
    icon: Eye,
    label: 'Viewed Content',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    impact: 'Logged reading interest; slight weight boost to topic',
  },
  CLICK: {
    icon: ActivityIcon,
    label: 'Clicked Resource',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    impact: 'Registered direct navigation signal',
  },
  LIKE: {
    icon: ThumbsUp,
    label: 'Liked Recommendation',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    impact: '+25% affinity bonus to category and creator',
  },
  DISLIKE: {
    icon: ThumbsDown,
    label: 'Disliked Recommendation',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    impact: '-35% affinity penalty to prevent irrelevant surfacing',
  },
  SAVE: {
    icon: Bookmark,
    label: 'Saved to Library',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    impact: '+20% weight; marked for future priority revisit',
  },
  COMPLETE: {
    icon: CheckCircle,
    label: 'Completed Curriculum',
    color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    impact: '+30% mastery signal; adapts skill level recommendations',
  },
  SKIP: {
    icon: FastForward,
    label: 'Skipped Resource',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    impact: '-15% weight; inferred level too easy or off-target',
  },
  CHAT: {
    icon: MessageSquare,
    label: 'AI Copilot Conversation',
    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    impact: 'Extracted semantic query tokens for personalization profile',
  },
  SEARCH: {
    icon: Search,
    label: 'Catalog Search',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    impact: 'Added high-intent keyword intent vectors',
  },
  PREFERENCE_CHANGE: {
    icon: Sliders,
    label: 'Updated Preferences',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    impact: 'Re-anchored baseline reward weights across all categories',
  },
};

export default function Activity() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const fetchInteractions = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = selectedFilter !== 'ALL' ? { eventType: selectedFilter } : {};
      const res = await interactionsAPI.get(params);
      setInteractions(res.data.interactions || []);
      if (isManual) toast.success('Activity stream refreshed');
    } catch (err) {
      console.error('Failed to load interactions:', err);
      toast.error('Could not fetch activity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, [selectedFilter]);

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-2">
            <ActivityIcon size={14} />
            <span>Behavioral Event Stream</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Live Activity Audit Log
          </h1>
          <p className="text-surface-400 text-xs md:text-sm mt-1">
            Complete transparency: inspect every action and the exact mathematical influence it has on your AI model.
          </p>
        </div>

        <button
          onClick={() => fetchInteractions(true)}
          disabled={refreshing || loading}
          className="btn-secondary self-start sm:self-auto text-xs px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Activity'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Events' },
          { id: 'VIEW', label: 'Views' },
          { id: 'LIKE', label: 'Likes' },
          { id: 'SAVE', label: 'Saves' },
          { id: 'COMPLETE', label: 'Completions' },
          { id: 'CHAT', label: 'AI Chats' },
          { id: 'SKIP', label: 'Skips' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'bg-surface-950/50 hover:bg-surface-800 text-surface-300 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event Timeline */}
      <div className="card p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl skeleton h-20" />
            ))}
          </div>
        ) : interactions.length > 0 ? (
          <div className="space-y-3">
            {interactions.map((interaction) => {
              const config = EVENT_CONFIG[interaction.eventType] || {
                icon: ActivityIcon,
                label: interaction.eventType,
                color: 'text-surface-300 bg-surface-800 border-surface-700',
                impact: 'Recorded into behavioral profile',
              };
              const Icon = config.icon;

              let parsedMeta = {};
              try {
                parsedMeta = typeof interaction.metadata === 'string'
                  ? JSON.parse(interaction.metadata)
                  : (interaction.metadata || {});
              } catch (_) {}

              return (
                <div
                  key={interaction.id}
                  className="p-4 rounded-xl bg-surface-950/60 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${config.color}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {config.label}
                        </span>
                        {interaction.content && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-surface-800 text-surface-300 border border-white/5 capitalize font-medium">
                            {interaction.content.category}
                          </span>
                        )}
                      </div>

                      {interaction.content ? (
                        <p className="text-xs text-brand-300 font-medium truncate max-w-lg">
                          {interaction.content.title}
                        </p>
                      ) : interaction.eventType === 'CHAT' ? (
                        <p className="text-xs text-surface-300 italic">
                          "Prompt keywords: {parsedMeta.topicKeywords || 'Adaptive chat inquiry'}"
                        </p>
                      ) : (
                        <p className="text-xs text-surface-400">System event</p>
                      )}

                      <p className="text-[11px] text-surface-500 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-brand-400" />
                        <span>Impact: {config.impact}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-[11px] text-surface-500 font-mono flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimestamp(interaction.timestamp)}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-surface-600">
                      ID: {interaction.id.slice(-6)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mx-auto text-surface-500">
              <ActivityIcon size={24} />
            </div>
            <p className="text-surface-300 text-sm font-medium">No activity recorded for this filter</p>
            <p className="text-surface-500 text-xs max-w-sm mx-auto">
              Browse recommendations in Discover or Dashboard and interact to generate event signals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
