import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersonalization } from '../context/PersonalizationContext';
import {
  LayoutDashboard, Compass, MessageSquare, TrendingUp,
  Brain, Activity, Settings, LogOut, Zap, Menu, X, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/assistant', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/progress', icon: TrendingUp, label: 'My Progress' },
  { to: '/personalization', icon: Brain, label: 'Personalization' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const categoryColors = {
  'learn-ai': 'text-violet-400',
  'learn-programming': 'text-blue-400',
  'build-startup': 'text-orange-400',
  'improve-career': 'text-emerald-400',
  'prepare-interviews': 'text-yellow-400',
  'improve-productivity': 'text-cyan-400',
  'improve-communication': 'text-pink-400',
  'general': 'text-surface-400',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { profile } = usePersonalization();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-white">AdaptiveAI</h1>
            <p className="text-[10px] text-surface-400 leading-none">An experience that learns you</p>
          </div>
        </div>
      </div>

      {/* User profile mini-card */}
      {profile && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-br from-brand-600/10 to-violet-600/10 border border-brand-500/15">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className={`text-[10px] capitalize truncate ${categoryColors[profile.goal] || 'text-surface-400'}`}>
                {profile.goal?.replace(/-/g, ' ')} · {profile.skillLevel}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(profile.engagementScore || 0, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-surface-400">{Math.round(profile.engagementScore || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 sidebar-scroll overflow-y-auto">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider px-3 mb-2 mt-1">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {label === 'AI Assistant' && (
              <span className="text-[9px] font-bold text-brand-400 bg-brand-500/15 px-1.5 py-0.5 rounded-full">AI</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Streak badge */}
      {profile?.streak > 0 && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-semibold text-amber-400">{profile.streak} day streak!</p>
            <p className="text-[10px] text-surface-400">Keep the momentum going</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <button
          onClick={handleLogout}
          className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/[0.06] flex-shrink-0 bg-surface-900/50">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-surface-900 border-r border-white/[0.06] flex flex-col z-50 animate-slide-in-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface-900/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">AdaptiveAI</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-surface-400 hover:text-white">
            <Menu size={22} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
