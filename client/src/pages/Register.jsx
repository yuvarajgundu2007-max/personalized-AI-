import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const perks = [
  'AI learns from every interaction',
  'Personalized recommendations from day 1',
  'Behavioral insights updated in real-time',
  'Full control over your data',
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Let\'s personalize your experience.');
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'good' : form.password.length >= 4 ? 'weak' : 'none';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center animate-slide-up">
        {/* Left: Value Prop */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">AdaptiveAI</span>
          </div>

          <h2 className="text-3xl font-display font-bold mb-3">
            Your experience,<br />
            <span className="gradient-text">finally personalized.</span>
          </h2>
          <p className="text-surface-400 mb-8 leading-relaxed">
            Join thousands of learners who've discovered that a platform that truly understands them
            is fundamentally more valuable.
          </p>

          <div className="space-y-3">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-brand-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={11} className="text-brand-400" />
                </div>
                <span className="text-sm text-surface-300">{perk}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 card p-4">
            <p className="text-xs text-surface-400 mb-2">After registration, you'll complete a short onboarding to set up your personalization profile. Takes ~2 minutes.</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['P', 'A', 'M', 'J'].map(l => (
                  <div key={l} className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 border-2 border-surface-900 flex items-center justify-center text-white text-[10px] font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-xs text-surface-400">Join other personalized learners</p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <div className="text-center lg:text-left mb-6">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <Link to="/">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
              </Link>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Create your account</h1>
            <p className="text-surface-400 text-sm mt-1">Your personalized AI journey starts here</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {['weak', 'good', 'strong'].map((s, i) => (
                      <div key={s} className={`flex-1 h-1 rounded-full transition-all ${
                        strength === 'weak' && i === 0 ? 'bg-red-400' :
                        strength === 'good' && i <= 1 ? 'bg-amber-400' :
                        strength === 'strong' ? 'bg-emerald-400' : 'bg-surface-700'
                      }`} />
                    ))}
                    <span className="text-[10px] text-surface-400 ml-2 capitalize">{strength !== 'none' ? strength : ''}</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <p className="text-[11px] text-surface-500 text-center">
                By creating an account, you agree that your interactions may be used to personalize your experience.
              </p>
            </form>

            <p className="text-center text-sm text-surface-400 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
