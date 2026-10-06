import { useState, useEffect } from 'react';
import { personalizationAPI } from '../api';
import { usePersonalization } from '../context/PersonalizationContext';
import {
  TrendingUp, Flame, CheckCircle, Bookmark, Zap, Activity,
  ThumbsUp, ThumbsDown, Award, RefreshCw, BarChart3, PieChart as PieIcon,
  Calendar, Layers, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  ai: '#6366f1',
  webdev: '#06b6d4',
  business: '#f59e0b',
  career: '#10b981',
  'data-science': '#8b5cf6',
  design: '#ec4899',
  marketing: '#f97316',
  cybersecurity: '#ef4444',
  finance: '#14b8a6',
  communication: '#a855f7',
};

export default function Progress() {
  const { profile } = usePersonalization();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await personalizationAPI.analytics();
      setAnalytics(res.data.analytics);
      if (isManual) toast.success('Analytics updated');
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toast.error('Failed to load progress analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format date labels for chart (e.g. "Mon 05")
  const formattedActivity = analytics?.activityData?.map((item) => {
    try {
      const parts = item.date.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return {
        ...item,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      };
    } catch (_) {
      return { ...item, label: item.date };
    }
  }) || [];

  const milestones = [
    {
      title: 'First Step',
      desc: 'Completed onboarding & set learning objectives',
      achieved: true,
      icon: Award,
    },
    {
      title: 'Active Explorer',
      desc: 'Interacted with 5+ learning resources',
      achieved: (analytics?.totalInteractions || 0) >= 5,
      icon: Layers,
    },
    {
      title: 'Habit Builder',
      desc: 'Maintained a 3-day active streak',
      achieved: (analytics?.streak || profile?.streak || 0) >= 3,
      icon: Flame,
    },
    {
      title: 'Feedback Master',
      desc: 'Provided feedback on 3+ recommendations',
      achieved:
        ((analytics?.feedbackStats?.like || 0) +
          (analytics?.feedbackStats?.save || 0) +
          (analytics?.feedbackStats?.complete || 0)) >= 3,
      icon: ThumbsUp,
    },
    {
      title: 'Deep Focus',
      desc: 'Achieved an Engagement Score over 75',
      achieved: (analytics?.engagementScore || profile?.engagementScore || 0) >= 75,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
            <Activity size={14} />
            <span>Behavioral Intelligence & Metrics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Learning Analytics & Growth
          </h1>
          <p className="text-surface-400 text-xs md:text-sm mt-1">
            Real-time visualization of your adaptive engagement, feedback signals, and curriculum mastery.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing || loading}
          className="btn-secondary self-start sm:self-auto text-xs px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400 font-medium">Active Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {analytics?.streak ?? profile?.streak ?? 0}
            </span>
            <span className="text-xs text-amber-400 font-medium">days in a row</span>
          </div>
          <div className="mt-2 text-[11px] text-surface-500">
            Keep interacting to preserve your multiplier
          </div>
        </div>

        <div className="card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400 font-medium">Engagement Score</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {Math.round(analytics?.engagementScore ?? profile?.engagementScore ?? 0)}
            </span>
            <span className="text-xs text-surface-400">/ 100</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-accent-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(analytics?.engagementScore ?? profile?.engagementScore ?? 0))}%`,
              }}
            />
          </div>
        </div>

        <div className="card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400 font-medium">Completed Items</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {analytics?.totalCompletions ?? 0}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              ({analytics?.completionRate ?? 0}% catalog)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-surface-500">
            {analytics?.totalInteractions ?? 0} total actions recorded
          </div>
        </div>

        <div className="card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400 font-medium">Saved Resources</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bookmark size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {analytics?.totalSaved ?? 0}
            </span>
            <span className="text-xs text-purple-400 font-medium">bookmarked</span>
          </div>
          <div className="mt-2 text-[11px] text-surface-500">
            Stored in your personal learning queue
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Activity Velocity Chart */}
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-400" />
                7-Day Activity & Completion Velocity
              </h3>
              <p className="text-xs text-surface-400 mt-0.5">
                Daily volume of interactions driving the recommendation model
              </p>
            </div>
            <span className="text-[11px] text-brand-400 font-medium bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {loading ? (
              <div className="h-full skeleton rounded-xl" />
            ) : formattedActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="interactionsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="completionsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="interactions"
                    name="Interactions"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#interactionsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completions"
                    name="Completions"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completionsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-surface-500">
                No activity data available yet
              </div>
            )}
          </div>
        </div>

        {/* Category Focus Distribution */}
        <div className="card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieIcon size={16} className="text-accent-400" />
              Topic Affinity Distribution
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">
              Top subject matters you engage with most
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            {loading ? (
              <div className="h-full skeleton rounded-xl" />
            ) : analytics?.categoryData && analytics.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.categoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.4} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="value" name="Interactions" radius={[0, 4, 4, 0]}>
                    {analytics.categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-surface-500 text-xs">
                <p>Interact with items in Discover or Dashboard to build your topic distribution graph.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Feedback Breakdown + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explicit Feedback Signals */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ThumbsUp size={16} className="text-brand-400" />
              Explicit Feedback Signals
            </h3>
            <span className="text-[11px] text-surface-400">
              Total: {Object.values(analytics?.feedbackStats || {}).reduce((a, b) => a + b, 0)} actions
            </span>
          </div>
          <p className="text-xs text-surface-400">
            These direct signals calibrate the recommendation engine's reward weights.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                label: 'Liked Resources',
                count: analytics?.feedbackStats?.like || 0,
                color: 'bg-emerald-500',
                textColor: 'text-emerald-400',
                desc: 'Strong positive interest signal (+0.25 weight)',
              },
              {
                label: 'Saved for Later',
                count: analytics?.feedbackStats?.save || 0,
                color: 'bg-purple-500',
                textColor: 'text-purple-400',
                desc: 'Intent to consume high-priority topic (+0.20 weight)',
              },
              {
                label: 'Completed Curriculums',
                count: analytics?.feedbackStats?.complete || 0,
                color: 'bg-brand-500',
                textColor: 'text-brand-400',
                desc: 'Mastery confirmation & skill evolution (+0.30 weight)',
              },
              {
                label: 'Skipped Items',
                count: analytics?.feedbackStats?.skip || 0,
                color: 'bg-amber-500',
                textColor: 'text-amber-400',
                desc: 'Too easy / irrelevant preference hint (-0.15 weight)',
              },
              {
                label: 'Disliked Resources',
                count: analytics?.feedbackStats?.dislike || 0,
                color: 'bg-rose-500',
                textColor: 'text-rose-400',
                desc: 'Topic/format suppression signal (-0.35 weight)',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface-950/40 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-white font-medium">{item.label}</span>
                  <p className="text-[10px] text-surface-500">{item.desc}</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-sm ${item.textColor}`}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones & Badges */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              Adaptive Milestones
            </h3>
            <span className="text-[11px] text-amber-400 font-medium">
              {milestones.filter((m) => m.achieved).length} of {milestones.length} Unlocked
            </span>
          </div>
          <p className="text-xs text-surface-400">
            System milestones reached through consistent personalized learning.
          </p>

          <div className="space-y-3 pt-2">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    m.achieved
                      ? 'bg-amber-500/5 border-amber-500/20 text-white'
                      : 'bg-surface-950/30 border-white/5 opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      m.achieved ? 'bg-amber-500/20 text-amber-400' : 'bg-surface-800 text-surface-500'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{m.title}</span>
                      {m.achieved ? (
                        <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Unlocked ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-surface-500">Locked</span>
                      )}
                    </div>
                    <p className="text-[11px] text-surface-400 mt-0.5">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
