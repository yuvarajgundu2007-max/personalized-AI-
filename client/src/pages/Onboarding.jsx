import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { usePersonalization } from '../context/PersonalizationContext';
import { Zap, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Goal', 'Interests', 'Style', 'Personal'];

const goals = [
  { id: 'learn-ai', label: '🤖 Learn AI', desc: 'Master artificial intelligence' },
  { id: 'learn-programming', label: '💻 Learn Programming', desc: 'Build coding skills' },
  { id: 'improve-career', label: '📈 Improve Career', desc: 'Advance professionally' },
  { id: 'prepare-interviews', label: '🎯 Ace Interviews', desc: 'Land your dream job' },
  { id: 'build-startup', label: '🚀 Build a Startup', desc: 'Launch your idea' },
  { id: 'improve-productivity', label: '⚡ Boost Productivity', desc: 'Get more done' },
  { id: 'improve-communication', label: '💬 Communication', desc: 'Express ideas better' },
  { id: 'general', label: '🌟 Explore Everything', desc: 'No specific goal yet' },
];

const interestOptions = [
  { id: 'ai', label: '🤖 AI & ML', color: 'violet' },
  { id: 'webdev', label: '🌐 Web Dev', color: 'blue' },
  { id: 'business', label: '💼 Business', color: 'orange' },
  { id: 'design', label: '🎨 Design', color: 'pink' },
  { id: 'marketing', label: '📣 Marketing', color: 'green' },
  { id: 'finance', label: '💰 Finance', color: 'yellow' },
  { id: 'cybersecurity', label: '🔒 Security', color: 'red' },
  { id: 'data-science', label: '📊 Data Science', color: 'cyan' },
  { id: 'career', label: '🎯 Career', color: 'emerald' },
  { id: 'communication', label: '💬 Communication', color: 'indigo' },
];

const skillLevels = [
  { id: 'beginner', label: 'Beginner', desc: 'Just getting started', emoji: '🌱' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Comfortable with basics', emoji: '⚡' },
  { id: 'advanced', label: 'Advanced', desc: 'Deep expertise', emoji: '🔥' },
];

const styles = [
  { id: 'short', label: 'Short & Simple', desc: 'Quick, digestible content', emoji: '⚡' },
  { id: 'detailed', label: 'Detailed', desc: 'In-depth explanations', emoji: '📚' },
  { id: 'visual', label: 'Visual', desc: 'Diagrams and examples', emoji: '🎨' },
  { id: 'practical', label: 'Practical', desc: 'Hands-on projects', emoji: '🛠️' },
  { id: 'challenge', label: 'Challenge Based', desc: 'Gamified and competitive', emoji: '🏆' },
];

const timeOptions = [
  { id: '15min', label: '15 min/day', desc: 'Quick daily dose' },
  { id: '30min', label: '30 min/day', desc: 'Solid learning session' },
  { id: '1hr', label: '1 hour/day', desc: 'Deep focus time' },
  { id: '2hr+', label: '2+ hours/day', desc: 'Maximum acceleration' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const { fetchProfile, fetchRecommendations } = usePersonalization();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    goal: '',
    interests: [],
    skillLevel: '',
    preferredStyle: '',
    availableTime: '30min',
    personalNote: '',
  });

  const canNext = () => {
    if (step === 0) return !!form.goal;
    if (step === 1) return form.interests.length > 0;
    if (step === 2) return !!form.skillLevel && !!form.preferredStyle;
    return true;
  };

  const toggleInterest = (id) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(id)
        ? f.interests.filter(i => i !== id)
        : [...f.interests, id],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileAPI.update(form);
      await fetchProfile();
      await fetchRecommendations();
      completeOnboarding();
      toast.success('🎉 Your personalized experience is ready!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Personalize your experience</h1>
          <p className="text-surface-400 text-sm mt-1">Takes about 2 minutes · AI will do the rest</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                i < step ? 'bg-brand-500' :
                i === step ? 'bg-brand-500/50' : 'bg-surface-800'
              }`} />
              <span className={`text-[10px] font-medium ${i <= step ? 'text-brand-400' : 'text-surface-500'}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* Step 0: Goal */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="section-title mb-1">What's your primary goal?</h2>
              <p className="section-subtitle mb-5">This shapes everything we show you.</p>
              <div className="grid grid-cols-2 gap-2">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setForm(f => ({ ...f, goal: g.id }))}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      form.goal === g.id
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-white/[0.08] bg-surface-800/30 text-surface-300 hover:border-brand-500/40 hover:bg-surface-800/60'
                    }`}
                  >
                    <div className="font-medium text-sm">{g.label}</div>
                    <div className={`text-[10px] mt-0.5 ${form.goal === g.id ? 'text-brand-300' : 'text-surface-500'}`}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="section-title mb-1">Select your interests</h2>
              <p className="section-subtitle mb-5">Pick all that apply. The more you select, the better.</p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => toggleInterest(opt.id)}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      form.interests.includes(opt.id)
                        ? 'border-brand-500 bg-brand-500/15 text-brand-300'
                        : 'border-white/[0.08] bg-surface-800/30 text-surface-300 hover:border-brand-500/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.interests.length > 0 && (
                <p className="text-xs text-brand-400 mt-3">{form.interests.length} selected ✓</p>
              )}
            </div>
          )}

          {/* Step 2: Style */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="section-title mb-1">Your skill level</h2>
                <p className="section-subtitle mb-3">We'll match content to where you are now.</p>
                <div className="grid grid-cols-3 gap-2">
                  {skillLevels.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setForm(f => ({ ...f, skillLevel: s.id }))}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        form.skillLevel === s.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/[0.08] bg-surface-800/30 hover:border-brand-500/40'
                      }`}
                    >
                      <div className="text-xl mb-1">{s.emoji}</div>
                      <div className="text-xs font-semibold text-white">{s.label}</div>
                      <div className="text-[10px] text-surface-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="section-title mb-1">Learning style</h2>
                <p className="section-subtitle mb-3">How do you prefer to learn?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {styles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setForm(f => ({ ...f, preferredStyle: s.id }))}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                        form.preferredStyle === s.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/[0.08] bg-surface-800/30 hover:border-brand-500/40'
                      }`}
                    >
                      <div className="text-xl mb-1">{s.emoji}</div>
                      <div className="text-xs font-semibold text-white">{s.label}</div>
                      <div className="text-[10px] text-surface-400">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="section-title mb-1">Daily time</h2>
                <div className="grid grid-cols-2 gap-2">
                  {timeOptions.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setForm(f => ({ ...f, availableTime: t.id }))}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        form.availableTime === t.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/[0.08] bg-surface-800/30 hover:border-brand-500/40'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{t.label}</div>
                      <div className="text-[10px] text-surface-400">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personal note */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="section-title">Tell the AI about you</h2>
                <span className="badge-brand text-[10px]">AI-powered</span>
              </div>
              <p className="section-subtitle mb-4">
                The AI will parse your note and extract additional personalization attributes. Optional but recommended.
              </p>

              <textarea
                className="input min-h-[140px] resize-none"
                placeholder="Example: I'm a software engineer with 3 years of experience. I want to learn AI to build smarter products. I hate long boring tutorials — I need practical examples. I'm particularly interested in LLMs and how to integrate them into web apps."
                value={form.personalNote}
                onChange={e => setForm(f => ({ ...f, personalNote: e.target.value }))}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-surface-400 flex items-center gap-1">
                  <Sparkles size={10} className="text-brand-400" />
                  AI will extract interests, preferences, and learning objectives
                </p>
                <span className="text-[10px] text-surface-500">{form.personalNote.length}/500</span>
              </div>

              {/* Summary of selections */}
              <div className="mt-4 p-3 bg-surface-800/40 rounded-xl space-y-1.5">
                <p className="text-[10px] font-semibold text-surface-300 uppercase tracking-wide">Your Profile Summary</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div><span className="text-surface-500">Goal:</span> <span className="text-white">{form.goal?.replace(/-/g, ' ')}</span></div>
                  <div><span className="text-surface-500">Level:</span> <span className="text-white capitalize">{form.skillLevel}</span></div>
                  <div><span className="text-surface-500">Style:</span> <span className="text-white capitalize">{form.preferredStyle}</span></div>
                  <div><span className="text-surface-500">Time:</span> <span className="text-white">{form.availableTime}</span></div>
                  <div className="col-span-2"><span className="text-surface-500">Interests:</span> <span className="text-brand-400">{form.interests.join(', ')}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary text-sm">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="btn-primary text-sm"
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canNext()}
                className="btn-primary text-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? 'Building your experience...' : 'Start My Experience'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
