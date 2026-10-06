/**
 * AI Service Abstraction Layer
 * Supports Google Gemini (default) with graceful fallback
 * Provider can be swapped by changing GEMINI_API_KEY / adding other env vars
 */

let genAI = null;

function getGeminiClient() {
  if (!genAI) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here' || apiKey === '') {
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Build a structured user context string for AI prompts
 */
function buildUserContext(profile, recentInteractions = [], feedbackSummary = {}) {
  const interests = safeJsonParse(profile.interests, []);
  const completedItems = safeJsonParse(profile.completedItems, []);
  const likedCategories = safeJsonParse(profile.likedCategories, {});
  const dislikedCategories = safeJsonParse(profile.dislikedCategories, {});

  const topLiked = Object.entries(likedCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const topDisliked = Object.entries(dislikedCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k);

  return `
USER CONTEXT:
- Name: ${profile.user?.name || 'User'}
- Primary Goal: ${profile.goal}
- Interests: ${interests.join(', ')}
- Skill Level: ${profile.skillLevel}
- Preferred Learning Style: ${profile.preferredStyle}
- Available Time Per Day: ${profile.availableTime}
- Current Focus: ${profile.currentFocus || 'Not set'}
- Engagement Score: ${profile.engagementScore.toFixed(1)}/100
- Streak: ${profile.streak} days

BEHAVIORAL SIGNALS:
- Completed items: ${completedItems.length}
- Top liked categories: ${topLiked.join(', ') || 'Not enough data yet'}
- Categories to reduce: ${topDisliked.join(', ') || 'None'}
- Recent interactions: ${recentInteractions.slice(0, 5).map(i => `${i.eventType}:${i.content?.category || 'unknown'}`).join(', ') || 'None yet'}

PERSONALIZATION NOTE:
${profile.personalNote || 'No personal preferences noted'}
`.trim();
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Generate personalized insights for the user
 */
async function generatePersonalizationInsights(profile, recentInteractions) {
  const userContext = buildUserContext(profile, recentInteractions);

  const prompt = `
You are an AI personalization engine. Analyze this user's profile and behavior, then generate actionable insights.

${userContext}

Generate a JSON response with these fields:
{
  "behavioralSummary": "2-3 sentence description of the user's interaction patterns and what they seem to gravitate toward",
  "currentFocusSuggestion": "A specific, actionable focus area based on their goals and behavior (1 concise sentence)",
  "recommendationPreference": "What type of content performs best for this user (1 sentence)",
  "aiLearningNote": "An insight about how the user's preferences have evolved (1-2 sentences)",
  "engagementTip": "A specific tip to increase this user's engagement (1 sentence)",
  "personalizationConfidence": {
    "goals": 0.85,
    "interests": 0.72,
    "style": 0.90,
    "behavior": 0.60
  }
}

Be specific, reference actual data from the user context. Do not be generic. Return only valid JSON.
`;

  try {
    const client = getGeminiClient();
    if (!client) {
      return generateFallbackInsights(profile, recentInteractions);
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateFallbackInsights(profile, recentInteractions);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { ...parsed, aiGenerated: true };
  } catch (error) {
    console.error('[AI] Insights generation failed, using fallback:', error.message);
    return generateFallbackInsights(profile, recentInteractions);
  }
}

/**
 * Generate personalized AI chat response
 */
async function generateChatResponse(userMessage, profile, recentInteractions, chatHistory = []) {
  const userContext = buildUserContext(profile, recentInteractions);

  const systemContext = `
You are a personalized AI assistant for AdaptiveAI. You have access to this specific user's profile and adapt your responses accordingly.

${userContext}

Your responses must:
1. Be directly tailored to this user's goals, skill level, and current focus
2. Reference specific details from their profile when relevant
3. Be concise (match their preferred style: ${profile.preferredStyle})
4. When suggesting resources, explain WHY it matches their specific situation
5. Never be generic - always personalize to this user
6. If they ask what to do, give specific, actionable recommendations based on their goal (${profile.goal}) and current focus
`;

  const historyContext = chatHistory.length > 0
    ? `\nPrevious conversation:\n${chatHistory.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n')}\n`
    : '';

  const fullPrompt = `${systemContext}${historyContext}\nUser: ${userMessage}\n\nAssistant:`;

  try {
    const client = getGeminiClient();
    if (!client) {
      return generateFallbackChatResponse(userMessage, profile);
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    return {
      message: cleanMarkdown(result.response.text()),
      aiGenerated: true,
    };
  } catch (error) {
    console.error('[AI] Chat generation failed, using fallback:', error.message);
    return generateFallbackChatResponse(userMessage, profile);
  }
}

/**
 * Generate recommendation explanation
 */
async function generateRecommendationExplanation(content, profile, matchReasons) {
  const prompt = `
You are an AI personalization engine. Explain why this content is recommended to this specific user.

User Profile:
- Goal: ${profile.goal}
- Interests: ${safeJsonParse(profile.interests, []).join(', ')}
- Skill Level: ${profile.skillLevel}
- Style: ${profile.preferredStyle}

Content: "${content.title}" (${content.category}, ${content.difficulty}, ${content.type})
Description: ${content.description}

Match factors:
${JSON.stringify(matchReasons, null, 2)}

Write a brief, specific explanation (2-4 bullet points) of why this is personalized for this user.
Start each bullet with ✓
Be specific, reference their actual goals/interests.
Keep it concise and user-friendly.
`;

  try {
    const client = getGeminiClient();
    if (!client) {
      return generateFallbackExplanation(content, profile, matchReasons);
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return {
      explanation: cleanMarkdown(result.response.text()),
      aiGenerated: true,
    };
  } catch (error) {
    return generateFallbackExplanation(content, profile, matchReasons);
  }
}

/**
 * Parse personal note into structured attributes
 */
async function parsePersonalNote(personalNote, profile) {
  if (!personalNote || personalNote.trim().length < 10) {
    return { parsedAttributes: {}, aiGenerated: false };
  }

  const prompt = `
Parse this user's personal preference note into structured attributes.

Note: "${personalNote}"
Current goal: ${profile.goal}
Current interests: ${safeJsonParse(profile.interests, []).join(', ')}

Return JSON:
{
  "additionalInterests": ["array of detected interests not in their list"],
  "contentPreferences": ["specific content preferences detected"],
  "avoidances": ["things they want to avoid"],
  "focusAreas": ["specific focus areas mentioned"],
  "learningGoals": ["specific learning objectives mentioned"]
}

Return only valid JSON. If nothing relevant found, return empty arrays.
`;

  try {
    const client = getGeminiClient();
    if (!client) return { parsedAttributes: {}, aiGenerated: false };

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { parsedAttributes: {}, aiGenerated: false };

    return {
      parsedAttributes: JSON.parse(jsonMatch[0]),
      aiGenerated: true,
    };
  } catch (error) {
    return { parsedAttributes: {}, aiGenerated: false };
  }
}

function cleanMarkdown(text) {
  if (!text) return text;
  return text.replace(/\*\*/g, '');
}

// ===== FALLBACK FUNCTIONS (no AI needed) =====

function generateFallbackInsights(profile, recentInteractions) {
  const interests = safeJsonParse(profile.interests, []);
  const likedCats = safeJsonParse(profile.likedCategories, {});
  const topLiked = Object.entries(likedCats).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);

  return {
    behavioralSummary: `You're a ${profile.skillLevel} learner focused on ${profile.goal}. ${topLiked.length ? `You've shown strong interest in ${topLiked.join(' and ')}.` : `Your interests span ${interests.slice(0, 2).join(' and ')}.`} Your preferred style is ${profile.preferredStyle} content.`,
    currentFocusSuggestion: `Focus on ${profile.currentFocus || interests[0] || profile.goal} with ${profile.availableTime} of dedicated practice.`,
    recommendationPreference: `${profile.preferredStyle} content in ${interests[0] || profile.goal} category performs best for you.`,
    aiLearningNote: `Based on your ${profile.engagementScore.toFixed(0)}-point engagement score, the system is continuously refining your recommendations.`,
    engagementTip: `Try completing one ${profile.type || 'project'} per session to boost your streak and improve recommendations.`,
    personalizationConfidence: {
      goals: 0.85,
      interests: interests.length > 2 ? 0.80 : 0.50,
      style: 0.90,
      behavior: Math.min(profile.engagementScore / 100, 0.95),
    },
    aiGenerated: false,
  };
}

function generateFallbackChatResponse(userMessage, profile) {
  const interests = safeJsonParse(profile.interests, []);
  const message = userMessage.toLowerCase();

  let response = '';

  if (message.includes('today') || message.includes('focus') || message.includes('do')) {
    response = `Based on your goal to **${profile.goal}** and your interests in **${interests.slice(0, 2).join(' and ')}**, I'd recommend:

1. **Start with your current focus area**: ${profile.currentFocus || interests[0] || 'your primary interest'}
2. **Match your style**: Look for ${profile.preferredStyle} content — it works best for how you learn
3. **Time block**: With ${profile.availableTime} available, pick one focused activity rather than spreading across multiple topics

Your engagement score of ${profile.engagementScore.toFixed(0)} shows you're building momentum — keep it going! 🎯`;
  } else if (message.includes('recommend') || message.includes('suggest')) {
    response = `Given your **${profile.skillLevel}** level and focus on **${interests[0] || profile.goal}**, I'd suggest:

- Check the "Recommended for You" section on your dashboard — it's personalized to your exact profile
- Look for **${profile.preferredStyle}** content tagged with **${interests.slice(0, 2).join(' or ')}**
- Your streak is ${profile.streak} days — great momentum!`;
  } else if (message.includes('progress') || message.includes('how am i')) {
    response = `Here's your personalization status:

📊 **Engagement Score**: ${profile.engagementScore.toFixed(0)}/100
🔥 **Streak**: ${profile.streak} days
🎯 **Goal**: ${profile.goal}
✨ **Top Interests**: ${interests.slice(0, 3).join(', ')}

The more you interact with content, the better the AI learns your preferences. Keep going!`;
  } else {
    response = `As a **${profile.skillLevel}** learner focused on **${profile.goal}**, here's my personalized take:

Your interests in ${interests.slice(0, 2).join(' and ')} give you a great foundation. I recommend checking the Discover page for content that matches your ${profile.preferredStyle} learning style. 

Is there something specific about **${interests[0] || profile.goal}** you'd like to explore?`;
  }

  return {
    message: cleanMarkdown(response),
    aiGenerated: false,
  };
}

function generateFallbackExplanation(content, profile, matchReasons) {
  const interests = safeJsonParse(profile.interests, []);
  const bullets = [];

  if (matchReasons.goalMatch > 0.5) bullets.push(`✓ Directly supports your goal: **${profile.goal}**`);
  if (matchReasons.interestMatch > 0.5) bullets.push(`✓ Matches your interests in **${interests.slice(0, 2).join(' and ')}**`);
  if (matchReasons.skillMatch > 0.7) bullets.push(`✓ Perfectly matched to your **${profile.skillLevel}** skill level`);
  if (matchReasons.behaviorMatch > 0.5) bullets.push(`✓ Similar to content you've engaged with before`);
  if (content.duration === profile.availableTime) bullets.push(`✓ Fits your **${profile.availableTime}** daily schedule`);

  if (bullets.length === 0) bullets.push(`✓ Selected based on your **${profile.goal}** goal and **${profile.skillLevel}** level`);

  return {
    explanation: cleanMarkdown(bullets.join('\n')),
    aiGenerated: false,
  };
}

module.exports = {
  generatePersonalizationInsights,
  generateChatResponse,
  generateRecommendationExplanation,
  parsePersonalNote,
  buildUserContext,
  safeJsonParse,
  generateFallbackInsights,
  generateFallbackChatResponse,
  generateFallbackExplanation,
};
