import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { profileAPI, personalizationAPI, recommendationsAPI, interactionsAPI } from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const PersonalizationContext = createContext(null);

export function PersonalizationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await profileAPI.get();
      setProfile(res.data.profile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, [isAuthenticated]);

  const fetchRecommendations = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setRecsLoading(true);
    try {
      const res = await recommendationsAPI.get(params);
      setRecommendations(res.data.recommendations);
      return res.data.recommendations;
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      return [];
    } finally {
      setRecsLoading(false);
    }
  }, [isAuthenticated]);

  // Record feedback and update local state + re-fetch recs
  const recordFeedback = useCallback(async (contentId, action) => {
    try {
      await recommendationsAPI.feedback(contentId, action);

      // Optimistically update local recommendation state
      setRecommendations(prev => prev.map(r =>
        r.id === contentId ? { ...r, feedbackStatus: action } : r
      ));

      const actionMessages = {
        like: '👍 Marked as useful — recommendations updated',
        dislike: '👎 Got it — we\'ll show less like this',
        save: '🔖 Saved to your collection',
        complete: '✓ Marked as complete — great progress!',
        skip: '× Skipped — we\'ll adjust your feed',
      };
      toast.success(actionMessages[action] || 'Feedback recorded', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      });

      // Refresh recommendations after a short delay
      setTimeout(() => fetchRecommendations(), 1500);
    } catch (err) {
      toast.error('Failed to record feedback');
    }
  }, [fetchRecommendations]);

  const trackAction = useCallback(async (contentId, action) => {
    try {
      await recommendationsAPI.action(contentId, action);
    } catch {
      // silent fail for tracking
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchRecommendations();
    }
  }, [isAuthenticated, fetchProfile, fetchRecommendations]);

  return (
    <PersonalizationContext.Provider value={{
      profile,
      recommendations,
      loading,
      recsLoading,
      fetchProfile,
      fetchRecommendations,
      recordFeedback,
      trackAction,
      setProfile,
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export const usePersonalization = () => {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) throw new Error('usePersonalization must be used within PersonalizationProvider');
  return ctx;
};
