import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PersonalizationProvider } from './context/PersonalizationContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Assistant from './pages/Assistant';
import Progress from './pages/Progress';
import PersonalizationPage from './pages/PersonalizationPage';
import Activity from './pages/Activity';
import Settings from './pages/Settings';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, onboardingRequired } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-400 text-sm">Loading AdaptiveAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (onboardingRequired) return <Navigate to="/onboarding" replace />;
  return children;
}

function OnboardingRoute({ children }) {
  const { isAuthenticated, loading, onboardingRequired } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!onboardingRequired) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

      {/* Protected Dashboard Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="discover" element={<Discover />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="progress" element={<Progress />} />
        <Route path="personalization" element={<PersonalizationPage />} />
        <Route path="activity" element={<Activity />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PersonalizationProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </PersonalizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
