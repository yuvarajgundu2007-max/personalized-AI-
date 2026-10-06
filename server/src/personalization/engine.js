/**
 * AdaptiveAI Personalization Engine
 *
 * This is the core of the application.
 * It computes personalization scores for content items and
 * re-ranks recommendations based on the user's dynamic profile.
 *
 * Flow:
 * User Behavior → Update Profile → Calculate Scores → Re-rank → Adapt Experience
 */

const prisma = require('../database/client');
const { safeJsonParse } = require('../ai/aiService');

// Category to interest mapping
const CATEGORY_TO_INTEREST = {
  ai: 'ai',
  webdev: 'webdev',
  business: 'business',
  design: 'design',
  marketing: 'marketing',
  finance: 'finance',
  cybersecurity: 'cybersecurity',
  'data-science': 'data-science',
  career: 'career',
  communication: 'communication',
};

// Goal to content category mapping
const GOAL_TO_CATEGORIES = {
  'learn-ai': ['ai', 'data-science'],
  'learn-programming': ['webdev', 'ai', 'cybersecurity'],
  'improve-career': ['career', 'communication', 'webdev'],
  'prepare-interviews': ['career', 'webdev', 'ai'],
  'build-startup': ['business', 'ai', 'marketing', 'finance', 'webdev'],
  'improve-productivity': ['career', 'communication'],
  'improve-communication': ['communication', 'marketing'],
  'general': ['webdev', 'ai', 'career'],
};

// Content type preference based on style
const STYLE_TO_TYPE = {
  'short': ['article'],
  'detailed': ['tutorial', 'article'],
  'visual': ['tutorial', 'project'],
  'practical': ['project', 'challenge'],
  'challenge': ['challenge', 'project'],
};

// Duration to availableTime mapping
const DURATION_MATCH = {
  '15min': ['15min'],
  '30min': ['15min', '30min'],
  '1hr': ['15min', '30min', '1hr'],
  '2hr+': ['15min', '30min', '1hr', '2hr+'],
};

/**
 * Calculate personalization score for a content item
 *
 * Score = goalMatch * 0.28 + interestMatch * 0.22 + skillMatch * 0.15
 *       + behaviorMatch * 0.20 + feedbackScore * 0.10 + styleMatch * 0.05
 */
function calculatePersonalizationScore(content, profile, userFeedback = {}, behavioralSignals = {}) {
  const interests = safeJsonParse(profile.interests, []);
  const likedCategories = safeJsonParse(profile.likedCategories, {});
  const dislikedCategories = safeJsonParse(profile.dislikedCategories, {});
  const completedItems = safeJsonParse(profile.completedItems, []);
  const skippedItems = safeJsonParse(profile.skippedItems, []);
  const contentTags = safeJsonParse(content.tags, []);
  const contentGoalTags = safeJsonParse(content.goalTags, []);
  const preferredTypes = STYLE_TO_TYPE[profile.preferredStyle] || ['tutorial'];
  const goalCategories = GOAL_TO_CATEGORIES[profile.goal] || ['webdev'];

  // 1. GOAL MATCH (0.28)
  let goalMatch = 0;
  if (goalCategories.includes(content.category)) goalMatch += 0.7;
  if (contentGoalTags.includes(profile.goal)) goalMatch += 0.3;
  goalMatch = Math.min(goalMatch, 1.0);

  // 2. INTEREST MATCH (0.22)
  let interestMatch = 0;
  const categoryInterest = CATEGORY_TO_INTEREST[content.category];
  if (categoryInterest && interests.includes(categoryInterest)) interestMatch += 0.6;
  // Tag overlap with interests
  const tagOverlap = contentTags.filter(t => interests.some(i => t.includes(i) || i.includes(t))).length;
  interestMatch += Math.min(tagOverlap * 0.15, 0.4);
  interestMatch = Math.min(interestMatch, 1.0);

  // 3. SKILL MATCH (0.15)
  let skillMatch = 0;
  const skillLevels = { beginner: 0, intermediate: 1, advanced: 2 };
  const contentLevel = skillLevels[content.difficulty] ?? 0;
  const userLevel = skillLevels[profile.skillLevel] ?? 0;
  const levelDiff = Math.abs(contentLevel - userLevel);
  if (levelDiff === 0) skillMatch = 1.0;
  else if (levelDiff === 1) skillMatch = 0.5;
  else skillMatch = 0.1;

  // Slight bonus for content one step above (stretch)
  if (contentLevel === userLevel + 1) skillMatch = 0.65;

  // 4. BEHAVIOR MATCH (0.20)
  let behaviorMatch = 0.3; // default baseline
  const likeScore = likedCategories[content.category] || 0;
  const dislikeScore = dislikedCategories[content.category] || 0;
  behaviorMatch += Math.min(likeScore * 0.1, 0.5);
  behaviorMatch -= Math.min(dislikeScore * 0.15, 0.4);

  // Penalize completed items (show new content)
  if (completedItems.includes(content.id)) behaviorMatch -= 0.3;
  // Penalize skipped items
  if (skippedItems.includes(content.id)) behaviorMatch -= 0.5;
  behaviorMatch = Math.max(0, Math.min(behaviorMatch, 1.0));

  // 5. FEEDBACK SCORE (0.10)
  let feedbackScore = 0.5; // neutral default
  const itemFeedback = userFeedback[content.id];
  if (itemFeedback === 'like' || itemFeedback === 'complete') feedbackScore = 1.0;
  else if (itemFeedback === 'save') feedbackScore = 0.75;
  else if (itemFeedback === 'dislike' || itemFeedback === 'skip') feedbackScore = 0.0;

  // 6. STYLE MATCH (0.05) - bonus for matching preferred type
  const styleMatch = preferredTypes.includes(content.type) ? 1.0 : 0.3;

  // 7. DURATION MATCH bonus
  const allowedDurations = DURATION_MATCH[profile.availableTime] || ['30min'];
  const durationBonus = allowedDurations.includes(content.duration) ? 0.05 : -0.05;

  // FINAL SCORE
  const rawScore =
    goalMatch * 0.28 +
    interestMatch * 0.22 +
    skillMatch * 0.15 +
    behaviorMatch * 0.20 +
    feedbackScore * 0.10 +
    styleMatch * 0.05 +
    durationBonus;

  const finalScore = Math.max(0, Math.min(1.0, rawScore));

  return {
    score: finalScore,
    breakdown: {
      goalMatch: parseFloat(goalMatch.toFixed(2)),
      interestMatch: parseFloat(interestMatch.toFixed(2)),
      skillMatch: parseFloat(skillMatch.toFixed(2)),
      behaviorMatch: parseFloat(behaviorMatch.toFixed(2)),
      feedbackScore: parseFloat(feedbackScore.toFixed(2)),
      styleMatch: parseFloat(styleMatch.toFixed(2)),
    },
  };
}

/**
 * Get personalized recommendations for a user
 */
async function getPersonalizedRecommendations(userId, options = {}) {
  const { limit = 12, excludeIds = [], category = null } = options;

  // Fetch user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  });

  if (!profile) {
    // Return all content without personalization
    const content = await prisma.content.findMany({ take: limit });
    return content.map(c => ({ ...c, personalizationScore: 0.5, breakdown: {}, matchReasons: [] }));
  }

  // Fetch user feedback map
  const feedbackRecords = await prisma.feedback.findMany({
    where: { userId },
    select: { contentId: true, action: true },
  });
  const feedbackMap = {};
  feedbackRecords.forEach(f => {
    feedbackMap[f.contentId] = f.action;
  });

  // Build content query
  const whereClause = {
    id: { notIn: excludeIds.length > 0 ? excludeIds : ['__none__'] },
    ...(category && { category }),
  };

  const allContent = await prisma.content.findMany({ where: whereClause });

  // Score all content
  const scored = allContent.map(content => {
    const { score, breakdown } = calculatePersonalizationScore(content, profile, feedbackMap);

    // Generate human-readable match reasons
    const matchReasons = [];
    if (breakdown.goalMatch > 0.6) matchReasons.push(`Matches your goal: ${profile.goal}`);
    if (breakdown.interestMatch > 0.5) {
      const interests = safeJsonParse(profile.interests, []);
      matchReasons.push(`Matches your interests: ${interests.slice(0, 2).join(', ')}`);
    }
    if (breakdown.skillMatch > 0.8) matchReasons.push(`Perfect for your ${profile.skillLevel} level`);
    if (breakdown.behaviorMatch > 0.6) matchReasons.push('Based on your recent activity');
    if (breakdown.feedbackScore > 0.7) matchReasons.push('Similar to content you liked');
    if (breakdown.styleMatch > 0.8) matchReasons.push(`Matches your ${profile.preferredStyle} learning style`);

    return {
      ...content,
      tags: safeJsonParse(content.tags, []),
      goalTags: safeJsonParse(content.goalTags, []),
      personalizationScore: parseFloat(score.toFixed(3)),
      breakdown,
      matchReasons,
      feedbackStatus: feedbackMap[content.id] || null,
    };
  });

  // Sort by personalization score (descending)
  scored.sort((a, b) => b.personalizationScore - a.personalizationScore);

  return scored.slice(0, limit);
}

/**
 * Update user profile based on an interaction event
 * This is the core feedback loop
 */
async function updateProfileFromInteraction(userId, eventType, contentId, metadata = {}) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const content = contentId ? await prisma.content.findUnique({ where: { id: contentId } }) : null;

  let updates = {};
  const likedCategories = safeJsonParse(profile.likedCategories, {});
  const dislikedCategories = safeJsonParse(profile.dislikedCategories, {});
  const completedItems = safeJsonParse(profile.completedItems, []);
  const savedItems = safeJsonParse(profile.savedItems, []);
  const skippedItems = safeJsonParse(profile.skippedItems, []);
  let engagementDelta = 0;

  if (content) {
    const cat = content.category;

    switch (eventType) {
      case 'LIKE':
        likedCategories[cat] = (likedCategories[cat] || 0) + 2;
        engagementDelta = 3;
        break;
      case 'COMPLETE':
        likedCategories[cat] = (likedCategories[cat] || 0) + 3;
        if (!completedItems.includes(contentId)) completedItems.push(contentId);
        engagementDelta = 10;
        break;
      case 'SAVE':
        likedCategories[cat] = (likedCategories[cat] || 0) + 1;
        if (!savedItems.includes(contentId)) savedItems.push(contentId);
        engagementDelta = 2;
        break;
      case 'DISLIKE':
        dislikedCategories[cat] = (dislikedCategories[cat] || 0) + 2;
        engagementDelta = 1;
        break;
      case 'SKIP':
        if (!skippedItems.includes(contentId)) skippedItems.push(contentId);
        // Don't penalize engagement much for skips
        engagementDelta = 0;
        break;
      case 'CLICK':
        likedCategories[cat] = (likedCategories[cat] || 0) + 0.5;
        engagementDelta = 1;
        break;
      case 'VIEW':
        engagementDelta = 0.5;
        break;
    }

    // Update current focus based on strongest liked category
    const topCategory = Object.entries(likedCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)[0];
    if (topCategory) updates.currentFocus = topCategory;
  }

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const lastActive = profile.lastActiveDate;
  let streak = profile.streak;

  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (lastActive === yesterdayStr) {
      streak += 1;
    } else if (lastActive && lastActive < yesterdayStr) {
      streak = 1; // reset streak
    } else if (!lastActive) {
      streak = 1;
    }
    updates.lastActiveDate = today;
    updates.streak = streak;
  }

  // Update engagement score (capped at 100)
  const newEngagement = Math.min(100, Math.max(0, profile.engagementScore + engagementDelta));

  updates = {
    ...updates,
    likedCategories: JSON.stringify(likedCategories),
    dislikedCategories: JSON.stringify(dislikedCategories),
    completedItems: JSON.stringify(completedItems),
    savedItems: JSON.stringify(savedItems),
    skippedItems: JSON.stringify(skippedItems),
    engagementScore: newEngagement,
    updatedAt: new Date(),
  };

  await prisma.userProfile.update({
    where: { userId },
    data: updates,
  });

  return updates;
}

/**
 * Get the user's behavioral signals summary
 */
async function getBehavioralSummary(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return null;

  const recentInteractions = await prisma.interaction.findMany({
    where: { userId },
    include: { content: { select: { title: true, category: true, type: true } } },
    orderBy: { timestamp: 'desc' },
    take: 20,
  });

  const likedCategories = safeJsonParse(profile.likedCategories, {});
  const dislikedCategories = safeJsonParse(profile.dislikedCategories, {});
  const completedItems = safeJsonParse(profile.completedItems, []);
  const savedItems = safeJsonParse(profile.savedItems, []);
  const interests = safeJsonParse(profile.interests, []);

  // Top categories by activity
  const topCategories = Object.entries(likedCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, score]) => ({ category, score }));

  // Event type breakdown
  const eventCounts = {};
  recentInteractions.forEach(i => {
    eventCounts[i.eventType] = (eventCounts[i.eventType] || 0) + 1;
  });

  // Category distribution from recent interactions
  const categoryDist = {};
  recentInteractions.forEach(i => {
    if (i.content?.category) {
      categoryDist[i.content.category] = (categoryDist[i.content.category] || 0) + 1;
    }
  });

  return {
    profile: {
      goal: profile.goal,
      interests,
      skillLevel: profile.skillLevel,
      preferredStyle: profile.preferredStyle,
      availableTime: profile.availableTime,
      currentFocus: profile.currentFocus,
      engagementScore: profile.engagementScore,
      streak: profile.streak,
      completedCount: completedItems.length,
      savedCount: savedItems.length,
      onboardingComplete: profile.onboardingComplete,
    },
    behavioral: {
      topCategories,
      dislikedCategories: Object.entries(dislikedCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, score]) => ({ category, score })),
      recentInteractionCount: recentInteractions.length,
      eventCounts,
      categoryDistribution: categoryDist,
    },
    recentInteractions: recentInteractions.slice(0, 10).map(i => ({
      eventType: i.eventType,
      contentTitle: i.content?.title,
      contentCategory: i.content?.category,
      timestamp: i.timestamp,
    })),
  };
}

module.exports = {
  calculatePersonalizationScore,
  getPersonalizedRecommendations,
  updateProfileFromInteraction,
  getBehavioralSummary,
  GOAL_TO_CATEGORIES,
  CATEGORY_TO_INTEREST,
};
