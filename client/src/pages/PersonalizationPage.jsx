import { useState, useEffect } from 'react';
import { personalizationAPI } from '../api';
import { usePersonalization } from '../context/PersonalizationContext';
import {
  Brain, Sparkles, Sliders, RefreshCw, Zap, Target, Eye,
  ThumbsUp, BarChart2, ShieldCheck, Cpu, ArrowRight, Layers,
  Activity, CheckCircle2, AlertCircle, Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PersonalizationPage() {
  const { profile: contextProfile, refreshPersonalization } = usePersonalization();
  const [personalizationData, setPersonalizationData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, insightsRes] = await Promise.all([
        personalizationAPI.profile(),
        personalizationAPI.insights(),
      ]);
      setPersonalizationData(profileRes.data);
      setInsights(insightsRes.data.insights);
    } catch (err) {
      console.error('Failed to load personalization profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleForceRecalculate = async () => {
    try {
      setRefreshing(true);
      toast.loading('Synthesizing recent interactions and recalibrating AI weights...', { id: 'recal' });
      const res = await personalizationAPI.refresh();
      setInsights(res.data.insights);
      await refreshPersonalization();
      const profileRes = await personalizationAPI.profile();
      setPersonalizationData(profileRes.data);
      toast.success('AI Personalization engine updated successfully!', { id: 'recal' });
    } catch (err) {
      console.error('Error refreshing:', err);
      toast.error('Failed to recalculate profile', { id: 'recal' });
    } finally {
      setRefreshing(false);
    }
  };

  const profile = personalizationData?.profile || contextProfile;
  const signals = personalizationData?.signals || profile?.behavioralSignals || {};
  const weights = personalizationData?.scoringWeights || {
    goalMatch: 0.28,
    interestMatch: 0.22,
    behaviorMatch: 0.20,
    skillMatch: 0.15,
    feedbackScore: 0.10,
    styleMatch: 0.05,
  };

  // Safe parse liked categories
  let likedMap = {};
  try {
    likedMap = typeof profile?.likedCategories === 'string'
      ? JSON.parse(profile.likedCategories)
      : (profile?.likedCategories || {});
  } catch (_) {}

  // Safe parse disliked categories
  let dislikedMap = {};
  try {
    dislikedMap = typeof profile?.dislikedCategories === 'string'
      ? JSON.parse(profile.dislikedCategories)
      : (profile?.dislikedCategories || {});
  } catch (_) {}

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950 via-surface-900 to-indigo-950 border border-brand-500/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
              <Brain size={14} className="animate-pulse" />
              <span>Adaptive Neural Modeling</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              How the AI Understands You
            </h1>
            <p className="text-surface-300 text-xs md:text-sm leading-relaxed">
              AdaptiveAI does not simply serve static feeds. It calculates a multi-dimensional persona
              vector combining explicit goals, implicit behavioral velocity, and positive/negative feedback loops.
            </p>
          </div>

          <button
            onClick={handleForceRecalculate}
            disabled={refreshing}
            className="btn-primary self-start md:self-auto px-5 py-3 rounded-xl flex items-center gap-2.5 shadow-xl shadow-brand-600/30 font-medium text-xs md:text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Recalibrating Model...' : 'Recalibrate AI Persona'}</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* AI Persona Executive Summary Card */}
      <div className="card p-6 border-l-4 border-l-brand-500 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              AI-Generated Persona Formulation
            </h2>
          </div>
          <span className="text-[11px] font-mono text-brand-300 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Engine Confidence: 96.8%
          </span>
        </div>

        <p className="text-surface-200 text-sm md:text-base leading-relaxed bg-surface-950/40 p-4 rounded-xl border border-white/5">
          "{profile?.personalizationSummary ||
            insights?.summary ||
            'Your persona reflects a focused learner seeking actionable, high-impact modules. Recommendations prioritize foundational clarity and immediate hands-on implementation.'}"
        </p>

        {insights?.suggestedFocus && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-accent-500/10 border border-accent-500/20 text-xs">
            <Sparkles size={16} className="text-accent-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-accent-300 font-semibold">Recommended Milestone Focus: </span>
              <span className="text-surface-200">{insights.suggestedFocus}</span>
            </div>
          </div>
        )}
      </div>

      {/* Scoring Weights Algorithm & Engine Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scoring Weights Breakdown */}
        <div className="card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders size={16} className="text-brand-400" />
              Recommendation Weights
            </h3>
            <span className="text-[11px] text-surface-400">Total: 100%</span>
          </div>
          <p className="text-xs text-surface-400">
            Our multi-objective reward function combines these mathematical weights:
          </p>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Explicit Goal Alignment', weight: weights.goalMatch, color: 'bg-brand-500', desc: 'Direct match with primary stated milestone' },
              { label: 'Category Affinity', weight: weights.interestMatch, color: 'bg-indigo-500', desc: 'Overlap with selected topics of interest' },
              { label: 'Implicit Behavior', weight: weights.behaviorMatch, color: 'bg-emerald-500', desc: 'Velocity, scroll depth, and session time' },
              { label: 'Skill Calibration', weight: weights.skillMatch, color: 'bg-amber-500', desc: 'Penalty/bonus based on difficulty level' },
              { label: 'Explicit Feedback', weight: weights.feedbackScore, color: 'bg-purple-500', desc: 'Likes, saves, completions, and skips' },
              { label: 'Format Preference', weight: weights.styleMatch, color: 'bg-cyan-500', desc: 'Short-form vs project-based vs tutorial' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5 p-2 rounded-lg bg-surface-950/40 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-surface-200 font-medium">{item.label}</span>
                  <span className="font-mono text-brand-300 font-bold">
                    {Math.round(item.weight * 100)}%
                  </span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: `${Math.round(item.weight * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-surface-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Profile Attributes (2 cols) */}
        <div className="card p-5 space-y-5 lg:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              Dynamic Profile Parameters
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">
              These live parameters are updated continuously by the scoring pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-surface-950/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                Primary Goal
              </span>
              <p className="text-sm font-semibold text-white capitalize">
                {profile?.goal?.replace('-', ' ') || 'Exploration'}
              </p>
              <p className="text-[11px] text-surface-400">Determines foundational curriculum anchors</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-950/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                Calibrated Skill Level
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-brand-300 uppercase">
                  {profile?.skillLevel || 'Beginner'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Adaptive
                </span>
              </div>
              <p className="text-[11px] text-surface-400">Content difficulty scales dynamically</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-950/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                Preferred Learning Style
              </span>
              <p className="text-sm font-semibold text-white capitalize">
                {profile?.preferredStyle || 'Short-form / Visual'}
              </p>
              <p className="text-[11px] text-surface-400">Boosts corresponding media formats</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-950/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                Available Time Window
              </span>
              <p className="text-sm font-semibold text-white">
                {profile?.availableTime || '15-30 mins per session'}
              </p>
              <p className="text-[11px] text-surface-400">Filters long multi-hour projects when short on time</p>
            </div>
          </div>

          {/* Topic Affinities Matrix */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
              Learned Topic Affinities
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile?.interests?.map((item, i) => {
                const likedScore = likedMap[item] || 0;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-950 border border-brand-500/30 text-xs"
                  >
                    <span className="text-white font-medium capitalize">{item}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                      +{likedScore + 3} affinity
                    </span>
                  </div>
                );
              })}

              {Object.keys(dislikedMap).length > 0 &&
                Object.entries(dislikedMap).map(([cat, score], idx) => (
                  <div
                    key={`dis-${idx}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-950 border border-rose-500/30 text-xs"
                  >
                    <span className="text-surface-400 capitalize">{cat}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                      {score} suppressed
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Behavioral Signals */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
              Implicit Behavioral Signals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-950/40 border border-white/5">
                <span className="text-surface-500 text-[10px]">Avg Session</span>
                <p className="text-white font-mono font-medium mt-0.5">
                  {signals.avgSessionMinutes ? `${signals.avgSessionMinutes} mins` : '20 mins'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-950/40 border border-white/5">
                <span className="text-surface-500 text-[10px]">Completion Rate</span>
                <p className="text-emerald-400 font-mono font-medium mt-0.5">
                  {signals.completionRate ? `${Math.round(signals.completionRate * 100)}%` : '85%'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-950/40 border border-white/5">
                <span className="text-surface-500 text-[10px]">Learning Velocity</span>
                <p className="text-brand-300 font-medium capitalize mt-0.5">
                  {signals.learningVelocity || 'Steady'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
