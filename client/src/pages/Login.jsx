import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { onboardingRequired } = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(onboardingRequired ? '/onboarding' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login helpers
  const fillDemo = (email, password) => {
    setForm({ email, password });
    toast('Demo credentials filled — click Sign In', { icon: '💡' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white">Welcome back</h1>
          <p className="text-surface-400 text-sm mt-1">Your personalized experience is waiting</p>
        </div>

        {/* Demo Accounts */}
        <div className="card p-4 mb-5 border-brand-500/20">
          <p className="text-xs font-semibold text-brand-400 mb-2.5 flex items-center gap-1.5">
            <span className="text-base">🧪</span> Demo Accounts (Hackathon)
          </p>
          <div className="space-y-2">
            <button onClick={() => fillDemo('priya@demo.com', 'password123')}
              className="w-full text-left p-2.5 bg-surface-800/50 rounded-xl hover:bg-surface-800 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white">👤 Priya — Beginner AI Learner</p>
                  <p className="text-[10px] text-surface-400">Goal: Learn AI · Style: Short</p>
                </div>
                <ArrowRight size={12} className="text-surface-500 group-hover:text-brand-400 transition-colors" />
              </div>
            </button>
            <button onClick={() => fillDemo('alex@demo.com', 'password123')}
              className="w-full text-left p-2.5 bg-surface-800/50 rounded-xl hover:bg-surface-800 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white">👤 Alex — Advanced Startup Builder</p>
                  <p className="text-[10px] text-surface-400">Goal: Build Startup · Style: Projects</p>
                </div>
                <ArrowRight size={12} className="text-surface-500 group-hover:text-brand-400 transition-colors" />
              </div>
            </button>
          </div>
          <p className="text-[10px] text-surface-500 mt-2">These accounts have pre-built activity to show personalization differences.</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
