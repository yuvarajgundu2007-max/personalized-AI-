import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePersonalization } from '../context/PersonalizationContext';
import { personalizationAPI, aiAPI } from '../api';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import {
  Sparkles, Brain, RefreshCw, TrendingUp, Flame, BookCheck,
  Bookmark, Target, Loader2, ChevronRight, Zap, BarChart2,
  Clock, ArrowRight, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="h-36 skeleton rounded-xl" />
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-full" />
      <div className="h-3 skeleton rounded w-2/3" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-surface-400 text-xs">{label}</p>
        <p className="text-white font-display font-bold text-lg leading-none mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-surface-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const goalLabels = {
  'learn-ai': '🤖 AI Mastery',
  'learn-programming': '💻 Programming',
  'improve-career': '📈 Career Growth',
  'prepare-interviews': '🎯 Interviews',
  'build-startup': '🚀 Startup',
  'improve-productivity': '⚡ Productivity',
  'improve-communication': '💬 Communication',
  'general': '🌟 Exploration',
};

const categoryEmoji = {
  ai: '🤖', webdev: '🌐', business: '💼', design: '🎨',
  marketing: '📣', finance: '💰', cybersecurity: '🔒',
  'data-science': '📊', career: '🎯', communication: '💬',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, recommendations, recsLoading, fetchRecommendations } = usePersonalization();
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await personalizationAPI.insights();
      setInsights(res.data.insights);
    } catch {
      // silent fail
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRecommendations();
      await personalizationAPI.refresh().then(res => setInsights(res.data.insights));
      toast.success('Recommendations refreshed based on your activity!');
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  // Split recommendations into sections
  const topRecs = recommendations.slice(0, 3);
  const moreRecs = recommendations.slice(3, 9);
  const completedIds = profile?.completedItems || [];
  const savedIds = profile?.savedItems || [];

  // Get completed and saved content from recommendations
  const continueItems = recommendations.filter(r => r.feedbackStatus === 'like' || r.feedbackStatus === 'save').slice(0, 3);

  const interests = profile?.interests || [];
  const topInterest = interests[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          {profile && (
            <p className="text-surface-400 text-sm mt-1">
              Based on your recent activity, we've adapted today's experience for you.
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary text-sm flex-shrink-0"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      {profile && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={BarChart2}
            label="Engagement Score"
            value={Math.round(profile.engagementScore || 0)}
            sub="out of 100"
            color="bg-brand-600"
          />
          <StatCard
            icon={Flame}
            label="Day Streak"
            value={`${profile.streak || 0}🔥`}
            sub="Keep it going!"
            color="bg-orange-600"
          />
          <StatCard
            icon={BookCheck}
            label="Completed"
            value={completedIds.length}
            sub="activities done"
            color="bg-emerald-600"
          />
          <StatCard
            icon={Bookmark}
            label="Saved"
            value={savedIds.length}
            sub="for later"
            color="bg-amber-600"
          />
        </div>
      )}

      {/* AI Insight Panel */}
      <div className="card p-5 border-brand-500/20 bg-gradient-to-br from-brand-600/5 to-violet-600/5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500/15 rounded-lg flex items-center justify-center">
              <Brain size={14} className="text-brand-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">AI Personalization Insight</p>
              <p className="text-[10px] text-surface-400">
                {insights?.aiGenerated ? 'Powered by Gemini AI' : 'Behavioral analysis'}
                {insights?.cached ? ' · Cached' : ''}
              </p>
            </div>
          </div>
          <Link to="/personalization" className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
            Full insights <ChevronRight size={10} />
          </Link>
        </div>

        {insightsLoading ? (
          <div className="space-y-2">
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-3/4" />
          </div>
        ) : insights ? (
          <div className="space-y-2">
            <p className="text-sm text-surface-200 leading-relaxed">{insights.behavioralSummary}</p>
            {insights.aiLearningNote && (
              <p className="text-xs text-brand-300 flex items-start gap-1.5 mt-2">
                <Sparkles size={12} className="mt-0.5 flex-shrink-0" />
                {insights.aiLearningNote}
              </p>
            )}
            {insights.currentFocusSuggestion && (
              <div className="flex items-center gap-2 mt-3 p-2.5 bg-brand-500/10 rounded-xl border border-brand-500/15">
                <Target size={13} className="text-brand-400 flex-shrink-0" />
                <p className="text-xs text-brand-300">{insights.currentFocusSuggestion}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-surface-400">Interact with content to build your behavioral insights.</p>
        )}
      </div>

      {/* Your Focus Today */}
      {profile?.currentFocus && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Zap size={16} className="text-brand-400" />
                Your Focus Today
              </h2>
              <p className="section-subtitle">AI-selected based on your goals and recent behavior</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-600/10 to-violet-600/10 rounded-xl border border-brand-500/15">
            <span className="text-3xl">{categoryEmoji[profile.currentFocus] || '🎯'}</span>
            <div>
              <p className="text-white font-semibold capitalize">{profile.currentFocus?.replace(/-/g, ' ')}</p>
              <p className="text-xs text-surface-400">
                Because you're focused on {goalLabels[profile.goal] || profile.goal}
                {profile.engagementScore > 10 ? ' and your recent activity shows strong interest here' : ''}
              </p>
            </div>
            <Link to="/discover" className="ml-auto btn-secondary text-xs py-1.5 px-3">
              Explore <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Top Personalized Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Recommended For You</h2>
            <p className="section-subtitle">
              Ranked by goal match, interests, skill level, and your behavior
            </p>
          </div>
          <Link to="/discover" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            See all <ChevronRight size={12} />
          </Link>
        </div>

        {recsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : topRecs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRecs.map(item => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Brain size={32} className="text-surface-600 mx-auto mb-2" />
            <p className="text-surface-400 text-sm">Complete your onboarding to see personalized recommendations.</p>
          </div>
        )}
      </div>

      {/* Continue where you left off */}
      {continueItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-400" />
            <h2 className="section-title">Continue Where You Left Off</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueItems.map(item => (
              <RecommendationCard key={item.id} item={item} showScore={false} />
            ))}
          </div>
        </div>
      )}

      {/* More Recommendations */}
      {moreRecs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-400" />
                More Picks For You
              </h2>
              <p className="section-subtitle">Based on your {topInterest} interest and {profile?.goal?.replace(/-/g, ' ')} goal</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moreRecs.map(item => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Profile quick-view */}
      {profile && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Your Personalization Profile</h2>
            <Link to="/personalization" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Full view <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: 'Goal', v: goalLabels[profile.goal] || profile.goal },
              { k: 'Level', v: profile.skillLevel },
              { k: 'Style', v: profile.preferredStyle },
              { k: 'Time', v: profile.availableTime },
            ].map(({ k, v }) => (
              <div key={k} className="bg-surface-800/40 rounded-xl p-3 text-center">
                <p className="text-[10px] text-surface-500 uppercase tracking-wide">{k}</p>
                <p className="text-sm font-medium text-white capitalize mt-1">{v?.replace(/-/g, ' ')}</p>
              </div>
            ))}
          </div>
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {interests.map(i => (
                <span key={i} className="badge-brand text-[10px]">
                  {categoryEmoji[i] || ''} {i.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
