import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, CheckCircle, SkipForward, Info, Loader2, Clock, BarChart2, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { recommendationsAPI } from '../../api';
import { usePersonalization } from '../../context/PersonalizationContext';

const categoryColors = {
  ai: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  webdev: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  business: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  design: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  marketing: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  finance: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  cybersecurity: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  'data-science': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  career: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  communication: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

const typeLabels = {
  tutorial: { label: 'Tutorial', color: 'badge-brand' },
  article: { label: 'Article', color: 'badge-green' },
  project: { label: 'Project', color: 'badge-purple' },
  challenge: { label: 'Challenge', color: 'badge-yellow' },
  video: { label: 'Video', color: 'badge-brand' },
};

const difficultyColors = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-red-400',
};

function ScoreBar({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-surface-400 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-surface-300 w-6 text-right">{Math.round(value * 100)}%</span>
    </div>
  );
}

export default function RecommendationCard({ item, showScore = true, className = '' }) {
  const { recordFeedback, trackAction } = usePersonalization();
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(item.feedbackStatus);
  const colors = categoryColors[item.category] || categoryColors.ai;
  const typeInfo = typeLabels[item.type] || { label: item.type, color: 'badge-brand' };

  const handleFeedback = async (action) => {
    if (feedbackStatus === action) return;
    setFeedbackStatus(action);
    await recordFeedback(item.id, action);
  };

  const handleExplain = async () => {
    if (explanation) {
      setShowExplanation(v => !v);
      return;
    }
    setExplaining(true);
    try {
      const res = await recommendationsAPI.explain(item.id);
      setExplanation(res.data);
      setShowExplanation(true);
    } catch {
      setExplanation({ explanation: '✓ Personalized based on your profile and behavior' });
      setShowExplanation(true);
    } finally {
      setExplaining(false);
    }
  };

  const handleClick = () => {
    trackAction(item.id, 'click');
  };

  const scoreColor =
    (item.personalizationScore || 0) > 0.75 ? 'text-emerald-400' :
    (item.personalizationScore || 0) > 0.5 ? 'text-brand-400' :
    (item.personalizationScore || 0) > 0.3 ? 'text-amber-400' : 'text-surface-400';

  return (
    <div className={`card-hover flex flex-col overflow-hidden group ${className}`} onClick={handleClick}>
      {/* Image */}
      {item.imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 to-transparent" />

          {/* Personalization score overlay */}
          {showScore && item.personalizationScore > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-surface-900/80 backdrop-blur-sm rounded-full px-2 py-1">
              <BarChart2 size={10} className={scoreColor} />
              <span className={`text-[10px] font-bold ${scoreColor}`}>
                {Math.round(item.personalizationScore * 100)}% match
              </span>
            </div>
          )}

          {/* Category badge */}
          <div className={`absolute bottom-2 left-2 badge ${colors.bg} ${colors.text} border ${colors.border}`}>
            {item.category}
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Type + Difficulty */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`badge ${typeInfo.color}`}>{typeInfo.label}</span>
          <span className={`text-xs font-medium ${difficultyColors[item.difficulty]}`}>
            {item.difficulty}
          </span>
          {item.duration && (
            <span className="flex items-center gap-1 text-[10px] text-surface-400 ml-auto">
              <Clock size={10} />
              {item.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-white text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-300 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-surface-400 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] text-surface-400 bg-surface-800/60 px-1.5 py-0.5 rounded-md">
                <Tag size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Why this? */}
        {item.matchReasons?.length > 0 && (
          <div className="mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleExplain(); }}
              className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
              disabled={explaining}
            >
              {explaining ? <Loader2 size={10} className="animate-spin" /> : <Info size={10} />}
              Why this recommendation?
              {explanation && (showExplanation ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
            </button>

            {showExplanation && explanation && (
              <div className="mt-2 p-2 rounded-lg bg-brand-500/5 border border-brand-500/15 text-[10px] text-surface-300 leading-relaxed animate-fade-in">
                {explanation.explanation?.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('✓') ? 'text-brand-400' : ''}>{line}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Score breakdown */}
        {showScore && item.breakdown && showExplanation && (
          <div className="mb-3 p-2 rounded-lg bg-surface-800/40 space-y-1">
            <ScoreBar label="Goal" value={item.breakdown.goalMatch} />
            <ScoreBar label="Interest" value={item.breakdown.interestMatch} />
            <ScoreBar label="Skill" value={item.breakdown.skillMatch} />
            <ScoreBar label="Behavior" value={item.breakdown.behaviorMatch} />
          </div>
        )}

        {/* Feedback actions */}
        <div
          className="flex items-center gap-1 pt-3 border-t border-white/[0.06]"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => handleFeedback('like')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${feedbackStatus === 'like' ? 'bg-emerald-500/20 text-emerald-400' : 'text-surface-400 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
            title="Useful"
          >
            <ThumbsUp size={12} /> {feedbackStatus === 'like' ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${feedbackStatus === 'dislike' ? 'bg-red-500/20 text-red-400' : 'text-surface-400 hover:text-red-400 hover:bg-red-500/10'}`}
            title="Not useful"
          >
            <ThumbsDown size={12} />
          </button>
          <button
            onClick={() => handleFeedback('save')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${feedbackStatus === 'save' ? 'bg-amber-500/20 text-amber-400' : 'text-surface-400 hover:text-amber-400 hover:bg-amber-500/10'}`}
            title="Save"
          >
            <Bookmark size={12} />
          </button>
          <button
            onClick={() => handleFeedback('complete')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${feedbackStatus === 'complete' ? 'bg-brand-500/20 text-brand-400' : 'text-surface-400 hover:text-brand-400 hover:bg-brand-500/10'}`}
            title="Mark complete"
          >
            <CheckCircle size={12} />
          </button>
          <button
            onClick={() => handleFeedback('skip')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ml-auto transition-all ${feedbackStatus === 'skip' ? 'bg-surface-700 text-surface-300' : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'}`}
            title="Skip"
          >
            <SkipForward size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
