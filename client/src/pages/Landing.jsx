import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, ArrowRight, Brain, TrendingUp, Users, Star, CheckCircle,
  BarChart2, MessageSquare, Compass, Shield, ChevronRight, Sparkles,
  Activity
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'Learns From Behavior', desc: 'Every click, like, skip, and completion updates your personalization profile in real-time.' },
  { icon: TrendingUp, title: 'Adaptive Recommendations', desc: 'Our scoring engine ranks content by goal match, interest fit, skill level, and behavioral signals.' },
  { icon: MessageSquare, title: 'Personalized AI Assistant', desc: 'The AI assistant knows your goals, skill level, and recent activity. No generic answers.' },
  { icon: BarChart2, title: 'Behavioral Insights', desc: 'See how the AI understands you. Track your engagement, preferences, and learning patterns.' },
  { icon: Shield, title: 'You Stay in Control', desc: 'Edit preferences, pause personalization, or reset your profile anytime. No hidden data.' },
  { icon: Activity, title: 'Real-time Adaptation', desc: 'Interact with content, watch your recommendations shift. The loop is demonstrably live.' },
];

const steps = [
  { n: '01', title: 'Create Your Profile', desc: 'Set your goal, interests, skill level, and learning style in a short onboarding.' },
  { n: '02', title: 'Interact Naturally', desc: 'Like, skip, complete, or save content. Every action is a signal.' },
  { n: '03', title: 'AI Learns You', desc: 'Behavioral signals update your dynamic profile. The personalization engine re-ranks everything.' },
  { n: '04', title: 'Experience Adapts', desc: 'Your dashboard, recommendations, and AI assistant all change to reflect who you actually are.' },
];

const demoProfiles = [
  {
    name: 'Priya',
    goal: 'Learn AI',
    skill: 'Beginner',
    style: 'Short articles',
    color: 'from-violet-600 to-blue-600',
    recs: ['AI in 5 Minutes', 'Intro to Machine Learning', 'AI Ethics Guide'],
  },
  {
    name: 'Alex',
    goal: 'Build Startup',
    skill: 'Advanced',
    style: 'Projects',
    color: 'from-orange-600 to-pink-600',
    recs: ['RAG Systems', 'Build a SaaS', 'AI Agent Architecture'],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">AdaptiveAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/08 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-blue-600/06 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-20 pb-24 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-brand-400 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles size={14} />
            Built for the AI Personalization Hackathon
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight mb-6 animate-slide-up">
            An experience that
            <br />
            <span className="gradient-text">learns you.</span>
          </h1>

          <p className="text-xl text-surface-300 max-w-2xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            Most apps treat everyone the same. AdaptiveAI builds a dynamic understanding of who you
            are — your goals, behaviors, and feedback — and adapts every recommendation, insight, and interaction accordingly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button onClick={() => navigate('/register')} className="btn-primary text-base px-7 py-3.5 shadow-xl shadow-brand-500/25">
              Start Your Personalized Journey <ArrowRight size={18} />
            </button>
            <Link to="/login" className="btn-secondary text-base px-7 py-3.5">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '36+', label: 'Curated Resources' },
              { value: '10+', label: 'Behavioral Signals' },
              { value: '6', label: 'Score Dimensions' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-display font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-surface-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-red mb-4">The Problem</div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                Generic experiences<br />
                <span className="text-surface-400">fail everyone.</span>
              </h2>
              <p className="text-surface-300 leading-relaxed mb-6">
                Whether you're a beginner trying to learn AI or an expert building a startup,
                most platforms show you the same content, the same order, the same suggestions.
                You're just one of millions.
              </p>
              <div className="space-y-3">
                {['Your goals are ignored', 'Your skill level is assumed', 'Your feedback disappears', 'Your behavior is never learned'].map(p => (
                  <div key={p} className="flex items-center gap-2 text-surface-400">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6 space-y-3">
              <p className="text-sm font-semibold text-surface-300">Traditional Platform:</p>
              {['👤 User A (Beginner, AI)', '👤 User B (Expert, Startup)', '👤 User C (Designer)'].map(u => (
                <div key={u} className="flex items-center gap-3 p-3 bg-surface-800/40 rounded-xl">
                  <span className="text-sm text-surface-300">{u}</span>
                  <ChevronRight size={14} className="text-surface-600 mx-auto flex-1" />
                  <span className="text-xs text-surface-500 bg-surface-800 px-2 py-1 rounded-lg">Same feed 😐</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-sm font-semibold text-surface-300 mb-3">AdaptiveAI:</p>
                {[
                  { u: '👤 User A', r: 'Beginner AI tutorials ✨', c: 'text-violet-400' },
                  { u: '👤 User B', r: 'Advanced startup projects ✨', c: 'text-orange-400' },
                  { u: '👤 User C', r: 'Design systems & UI ✨', c: 'text-pink-400' },
                ].map(({ u, r, c }) => (
                  <div key={u} className="flex items-center gap-3 p-3 bg-surface-800/40 rounded-xl mb-2">
                    <span className="text-sm text-surface-300">{u}</span>
                    <ChevronRight size={14} className="text-surface-600" />
                    <span className={`text-xs ${c} font-medium ml-auto`}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-white/[0.06] bg-surface-900/30">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="badge-brand mb-4 inline-flex">How It Works</div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">The Personalization Loop</h2>
            <p className="text-surface-400 max-w-xl mx-auto">A live, demonstrable feedback loop that continuously improves your experience.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={step.n} className="card p-5 relative">
                <div className="text-4xl font-display font-black text-brand-600/20 mb-3">{step.n}</div>
                <h3 className="font-semibold text-white mb-2 text-sm">{step.title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight size={16} className="absolute -right-2 top-1/2 -translate-y-1/2 text-surface-600 hidden lg:block z-10" />
                )}
              </div>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="mt-10 card p-6">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Personalization Engine Flow</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['User Action', 'Store Behavior', 'Update Signals', 'Recalculate Scores', 'Re-rank Recommendations', 'AI Insights', 'Adapted Experience'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg font-medium ${i === 0 ? 'bg-brand-500/20 text-brand-400' : i === 6 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-800 text-surface-300'}`}>
                    {step}
                  </span>
                  {i < 6 && <ArrowRight size={12} className="text-surface-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Profiles */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="badge-purple mb-4 inline-flex">Live Demo</div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">Two users. Two experiences.</h2>
            <p className="text-surface-400">The same platform. Completely different dashboards.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {demoProfiles.map(profile => (
              <div key={profile.name} className="card p-6">
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${profile.color} bg-clip-text text-transparent font-display font-bold text-lg mb-4`}>
                  👤 {profile.name}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Goal', profile.goal], ['Level', profile.skill], ['Style', profile.style]].map(([k, v]) => (
                    <div key={k} className="bg-surface-800/50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-surface-400 mb-1">{k}</p>
                      <p className="text-xs font-medium text-white">{v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-2">Personalized recommendations:</p>
                  <div className="space-y-2">
                    {profile.recs.map(r => (
                      <div key={r} className="flex items-center gap-2 p-2 bg-surface-800/30 rounded-lg">
                        <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-surface-200">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/[0.06] bg-surface-900/30">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">Everything Personalized</h2>
            <p className="text-surface-400">Not one feature. The entire experience.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 hover:border-brand-500/30 transition-all duration-300">
                <div className="w-9 h-9 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={16} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Ready to experience<br />
            <span className="gradient-text">personalized AI?</span>
          </h2>
          <p className="text-surface-400 mb-8">Create your account in 30 seconds. Your personalized experience starts immediately.</p>
          <button onClick={() => navigate('/register')} className="btn-primary text-base px-8 py-4 shadow-2xl shadow-brand-500/30">
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-violet-500 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm text-surface-400">AdaptiveAI — An experience that learns you.</span>
          </div>
          <p className="text-xs text-surface-500">Built for the AI Personalization Hackathon 2024</p>
        </div>
      </footer>
    </div>
  );
}
