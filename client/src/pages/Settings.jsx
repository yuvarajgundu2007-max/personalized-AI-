import { useState, useEffect } from 'react';
import { preferencesAPI } from '../api';
import { usePersonalization } from '../context/PersonalizationContext';
import {
  Settings as SettingsIcon, Sliders, Shield, RotateCcw, Trash2,
  Save, Check, AlertTriangle, Sparkles, Brain, Clock, Target,
  Zap, Compass, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const GOALS = [
  { id: 'learn-ai', label: '🤖 Learn AI & Machine Learning' },
  { id: 'learn-programming', label: '💻 Master Software Engineering' },
  { id: 'build-startup', label: '🚀 Build a Tech Startup' },
  { id: 'improve-career', label: '📈 Accelerate Career & Seniority' },
  { id: 'prepare-interviews', label: '🎯 Prepare for Technical Interviews' },
  { id: 'improve-productivity', label: '⚡ Optimize Personal Productivity' },
  { id: 'improve-communication', label: '💬 Improve Technical Communication' },
  { id: 'general', label: '🌟 General Lifelong Learning' },
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to concepts, fundamentals focus' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Familiar with basics, ready for depth' },
  { id: 'advanced', label: 'Advanced', desc: 'Expert level, complex architecture & scale' },
];

const STYLES = [
  { id: 'short', label: '⚡ Bite-sized / Short', desc: '10-15 min articles & concepts' },
  { id: 'practical', label: '🛠 Hands-on / Practical', desc: 'Real projects & code-along' },
  { id: 'detailed', label: '📚 Deep Dive / Theory', desc: 'Exhaustive end-to-end guides' },
  { id: 'visual', label: '🎨 Visual Learning', desc: 'Diagrams, demos & examples' },
  { id: 'challenge', label: '🏆 Problem Challenges', desc: 'Active quizzes & CTF challenges' },
];

const TIMES = [
  { id: '15min', label: '15 Minutes' },
  { id: '30min', label: '30 Minutes' },
  { id: '1hr', label: '1 Hour' },
  { id: '2hr+', label: '2+ Hours' },
];

const ALL_INTERESTS = [
  { id: 'ai', label: 'AI & Machine Learning' },
  { id: 'webdev', label: 'Web Development' },
  { id: 'business', label: 'Business & Startups' },
  { id: 'career', label: 'Career Growth' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'marketing', label: 'Marketing & Growth' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'finance', label: 'Finance & Investing' },
  { id: 'communication', label: 'Soft Skills & Leadership' },
];

export default function Settings() {
  const { profile, refreshPersonalization } = usePersonalization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [goal, setGoal] = useState('learn-ai');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [preferredStyle, setPreferredStyle] = useState('short');
  const [availableTime, setAvailableTime] = useState('30min');
  const [interests, setInterests] = useState([]);
  const [pausePersonalization, setPausePersonalization] = useState(false);

  // Load preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        setLoading(true);
        const res = await preferencesAPI.get();
        const pref = res.data.preferences;
        if (pref) {
          setGoal(pref.goal || 'learn-ai');
          setSkillLevel(pref.skillLevel || 'beginner');
          setPreferredStyle(pref.preferredStyle || 'short');
          setAvailableTime(pref.availableTime || '30min');
          setInterests(pref.interests || []);
          setPausePersonalization(Boolean(pref.pausePersonalization));
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const toggleInterest = (id) => {
    if (interests.includes(id)) {
      if (interests.length === 1) {
        toast.error('Select at least one interest');
        return;
      }
      setInterests(interests.filter((i) => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await preferencesAPI.update({
        goal,
        skillLevel,
        preferredStyle,
        availableTime,
        interests,
        pausePersonalization,
      });
      await refreshPersonalization();
      toast.success('Learning preferences updated! Personalization adjusted.');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all interaction and feedback history? This resets your behavioral signals while keeping your goal settings.')) {
      try {
        await preferencesAPI.clearHistory();
        await refreshPersonalization();
        toast.success('Activity history cleared.');
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleFullReset = async () => {
    if (window.confirm('Completely reset AI personalization profile and behavioral models?')) {
      try {
        await preferencesAPI.reset();
        await refreshPersonalization();
        toast.success('AI Personalization engine reset.');
      } catch (err) {
        toast.error('Failed to reset personalization');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-2">
          <Sliders size={14} />
          <span>Profile & Intelligence Controls</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Preferences & Adaptive AI Controls
        </h1>
        <p className="text-surface-400 text-xs md:text-sm mt-1">
          Adjust explicit targets and configure transparency, privacy, and model training parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Core Learning Goal */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Target size={18} className="text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Primary Learning Goal</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={`p-3 rounded-xl text-left text-xs font-medium transition-all border flex items-center justify-between ${
                  goal === g.id
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                    : 'bg-surface-950/40 border-white/5 text-surface-300 hover:text-white hover:bg-surface-800'
                }`}
              >
                <span>{g.label}</span>
                {goal === g.id && <Check size={14} className="text-brand-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Skill Level & Format */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Experience Level & Delivery Style</h2>
          </div>

          {/* Skill Level */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-surface-300">Skill Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SKILL_LEVELS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSkillLevel(s.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    skillLevel === s.id
                      ? 'bg-brand-600/20 border-brand-500 text-white'
                      : 'bg-surface-950/40 border-white/5 text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-white">{s.label}</p>
                  <p className="text-[11px] text-surface-400 mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Style */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-surface-300">Learning Format Preference</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setPreferredStyle(style.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    preferredStyle === style.id
                      ? 'bg-brand-600/20 border-brand-500 text-white'
                      : 'bg-surface-950/40 border-white/5 text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-white">{style.label}</p>
                  <p className="text-[11px] text-surface-400 mt-0.5">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Available Time */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-surface-300">Target Time per Session</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAvailableTime(t.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium text-center border transition-all ${
                    availableTime === t.id
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-surface-950/40 border-white/5 text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Topic Affinities / Interests */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Compass size={18} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Topic Affinities</h2>
            </div>
            <span className="text-[11px] text-surface-400">{interests.length} selected</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {ALL_INTERESTS.map((item) => {
              const active = interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${
                    active
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                      : 'bg-surface-950/40 border-white/5 text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Privacy & Personalization Controls */}
        <div className="card p-6 space-y-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Shield size={18} className="text-amber-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Ethical AI & Privacy Controls</h2>
              <p className="text-[11px] text-surface-400">
                You maintain complete agency over how your data trains the recommendation model.
              </p>
            </div>
          </div>

          {/* Pause Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-950/60 border border-white/5">
            <div className="space-y-0.5 max-w-lg">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                Pause Dynamic Personalization
              </span>
              <p className="text-[11px] text-surface-400">
                When paused, new interactions won't update your persona weights, and recommendations will follow baseline curriculum.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPausePersonalization(!pausePersonalization)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pausePersonalization ? 'bg-amber-500' : 'bg-surface-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  pausePersonalization ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex-1 btn-secondary text-xs p-3 flex items-center justify-center gap-2 text-surface-300 hover:text-white"
            >
              <Trash2 size={14} className="text-amber-400" />
              <span>Clear Activity History</span>
            </button>

            <button
              type="button"
              onClick={handleFullReset}
              className="flex-1 btn-secondary text-xs p-3 flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/40"
            >
              <RotateCcw size={14} />
              <span>Reset AI Model to Defaults</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-xl shadow-brand-500/20"
          >
            {saving ? <RotateCcw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Updating Engine...' : 'Save & Update Personalization'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
