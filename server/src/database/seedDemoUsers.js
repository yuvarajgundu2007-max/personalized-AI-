require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDemoUsers() {
  console.log('🌱 Seeding demo users (Priya & Alex)...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Fetch some content items to link interactions and feedback
  const allContent = await prisma.content.findMany();
  if (allContent.length === 0) {
    console.error('❌ No content found in database! Please run `node src/database/seed.js` first.');
    return;
  }

  const aiBeginner = allContent.find(c => c.category === 'ai' && c.difficulty === 'beginner') || allContent[0];
  const aiPrompt = allContent.find(c => c.title.includes('Prompt Engineering')) || allContent[1];
  const aiEthics = allContent.find(c => c.title.includes('Ethics')) || allContent[2];
  const ai5Min = allContent.find(c => c.title.includes('5 Minutes')) || allContent[3];
  const webReact = allContent.find(c => c.category === 'webdev' && c.difficulty === 'beginner') || allContent[4];

  const aiRag = allContent.find(c => c.title.includes('RAG')) || allContent[5];
  const aiFinetune = allContent.find(c => c.title.includes('Fine-tuning')) || allContent[6];
  const bizMvp = allContent.find(c => c.title.includes('MVP')) || allContent[7];
  const bizArch = allContent.find(c => c.title.includes('Technical Architecture')) || allContent[8];
  const bizPricing = allContent.find(c => c.title.includes('Pricing')) || allContent[9];

  // 1. Clean up existing demo users if they exist
  await prisma.user.deleteMany({
    where: { email: { in: ['priya@demo.com', 'alex@demo.com'] } }
  });

  // 2. Create Priya (Beginner AI Transitioner)
  const priya = await prisma.user.create({
    data: {
      email: 'priya@demo.com',
      name: 'Priya Sharma',
      password: hashedPassword,
      profile: {
        create: {
          goal: 'learn-ai',
          interests: JSON.stringify(['ai', 'webdev']),
          skillLevel: 'beginner',
          preferredStyle: 'short',
          availableTime: '15min',
          personalNote: 'Frontend developer transitioning into AI engineering. Want bite-sized, practical tutorials that teach me ML fundamentals without heavy math.',
          currentFocus: 'AI Foundations & Hands-On Prompt Engineering',
          engagementScore: 78.5,
          streak: 4,
          lastActiveDate: new Date().toISOString().split('T')[0],
          completedItems: JSON.stringify([aiBeginner.id, ai5Min.id]),
          savedItems: JSON.stringify([aiPrompt.id, webReact.id]),
          skippedItems: JSON.stringify([aiRag.id]),
          likedCategories: JSON.stringify({ ai: 5, webdev: 3 }),
          dislikedCategories: JSON.stringify({ finance: -2 }),
          behavioralSignals: JSON.stringify({
            preferredTypes: ['tutorial', 'article'],
            completionRate: 0.85,
            avgSessionMinutes: 18,
            learningVelocity: 'high',
            topicBreadth: 'focused'
          }),
          personalizationSummary: 'Priya is an energetic learner bridging frontend web engineering with AI. She excels when presented with structured, modular lessons with instant feedback.',
          pausePersonalization: false,
          onboardingComplete: true
        }
      }
    }
  });

  // Feedback for Priya
  await prisma.feedback.createMany({
    data: [
      { userId: priya.id, contentId: aiBeginner.id, action: 'like' },
      { userId: priya.id, contentId: ai5Min.id, action: 'like' },
      { userId: priya.id, contentId: aiPrompt.id, action: 'save' },
      { userId: priya.id, contentId: webReact.id, action: 'save' },
      { userId: priya.id, contentId: aiBeginner.id, action: 'complete' }
    ]
  });

  // Interactions for Priya
  await prisma.interaction.createMany({
    data: [
      { userId: priya.id, contentId: aiBeginner.id, eventType: 'VIEW', metadata: JSON.stringify({ source: 'dashboard' }) },
      { userId: priya.id, contentId: aiBeginner.id, eventType: 'COMPLETE', metadata: JSON.stringify({ timeSpentSec: 900 }) },
      { userId: priya.id, contentId: aiPrompt.id, eventType: 'SAVE', metadata: JSON.stringify({ note: 'Revisit this weekend' }) },
      { userId: priya.id, contentId: ai5Min.id, eventType: 'LIKE', metadata: JSON.stringify({}) },
      { userId: priya.id, contentId: aiRag.id, eventType: 'SKIP', metadata: JSON.stringify({ reason: 'Too advanced for now' }) },
      { userId: priya.id, eventType: 'CHAT', metadata: JSON.stringify({ topic: 'Prompt engineering strategies' }) }
    ]
  });

  // AI Insights for Priya
  await prisma.aiInsight.createMany({
    data: [
      {
        userId: priya.id,
        type: 'behavioral_summary',
        content: JSON.stringify({
          behavioralSummary: 'Priya demonstrates strong engagement with short-form AI fundamentals. She completes bite-sized articles within 15 minutes and frequently saves prompt engineering modules, indicating a preference for practical, immediately-applicable content.',
          currentFocusSuggestion: 'Bridge your React experience with AI by creating a small prompt playground or UI wrapper for LLM calls.',
          recommendationPreference: 'Short practical tutorials in AI perform best for you — long-form advanced content tends to get skipped.',
          aiLearningNote: 'Your recent interactions suggest increasing interest in AI engineering over general web development.',
          engagementTip: 'Complete one 15-minute AI article per session to keep your streak growing.',
          personalizationConfidence: { goals: 0.94, interests: 0.88, style: 0.92, behavior: 0.85 },
          aiGenerated: false
        }),
        metadata: JSON.stringify({ confidence: 0.94, dominantGoal: 'learn-ai' })
      },
      {
        userId: priya.id,
        type: 'focus_suggestion',
        content: 'Bridge your React experience with AI by creating a small prompt playground or UI wrapper for LLM calls.',
        metadata: JSON.stringify({ action: 'build_bridge_project' })
      }
    ]
  });

  // 3. Create Alex (Advanced Startup Architect)
  const alex = await prisma.user.create({
    data: {
      email: 'alex@demo.com',
      name: 'Alex Chen',
      password: hashedPassword,
      profile: {
        create: {
          goal: 'build-startup',
          interests: JSON.stringify(['ai', 'business', 'webdev']),
          skillLevel: 'advanced',
          preferredStyle: 'practical',
          availableTime: '1hr',
          personalNote: 'Senior software architect building an autonomous AI agent startup. Need advanced architecture, RAG pipelines, SaaS monetization, and technical scalability.',
          currentFocus: 'Production RAG Architecture & Startup Monetization',
          engagementScore: 92.0,
          streak: 9,
          lastActiveDate: new Date().toISOString().split('T')[0],
          completedItems: JSON.stringify([aiRag.id, bizMvp.id, bizArch.id]),
          savedItems: JSON.stringify([aiFinetune.id, bizPricing.id]),
          skippedItems: JSON.stringify([ai5Min.id, aiBeginner.id]),
          likedCategories: JSON.stringify({ ai: 8, business: 6, webdev: 4 }),
          dislikedCategories: JSON.stringify({ communication: -1 }),
          behavioralSignals: JSON.stringify({
            preferredTypes: ['project', 'article'],
            completionRate: 0.92,
            avgSessionMinutes: 48,
            learningVelocity: 'accelerated',
            topicBreadth: 'interdisciplinary'
          }),
          personalizationSummary: 'Alex operates at a high-level system architect standard. He skips introductory overviews and dives straight into production code, latency trade-offs, and go-to-market mechanics.',
          pausePersonalization: false,
          onboardingComplete: true
        }
      }
    }
  });

  // Feedback for Alex
  await prisma.feedback.createMany({
    data: [
      { userId: alex.id, contentId: aiRag.id, action: 'like' },
      { userId: alex.id, contentId: bizMvp.id, action: 'like' },
      { userId: alex.id, contentId: bizArch.id, action: 'complete' },
      { userId: alex.id, contentId: aiFinetune.id, action: 'save' },
      { userId: alex.id, contentId: bizPricing.id, action: 'save' }
    ]
  });

  // Interactions for Alex
  await prisma.interaction.createMany({
    data: [
      { userId: alex.id, contentId: aiRag.id, eventType: 'VIEW', metadata: JSON.stringify({ source: 'dashboard' }) },
      { userId: alex.id, contentId: aiRag.id, eventType: 'COMPLETE', metadata: JSON.stringify({ timeSpentSec: 3600 }) },
      { userId: alex.id, contentId: bizArch.id, eventType: 'LIKE', metadata: JSON.stringify({}) },
      { userId: alex.id, contentId: ai5Min.id, eventType: 'SKIP', metadata: JSON.stringify({ reason: 'Introductory content' }) },
      { userId: alex.id, eventType: 'CHAT', metadata: JSON.stringify({ topic: 'Vector DB sharding and indexing' }) }
    ]
  });

  // AI Insights for Alex
  await prisma.aiInsight.createMany({
    data: [
      {
        userId: alex.id,
        type: 'behavioral_summary',
        content: JSON.stringify({
          behavioralSummary: 'Alex prioritizes advanced architecture and startup scaling. His sessions are long (45+ mins) with strong focus on RAG, fine-tuning, and monetization frameworks — introductory content is consistently skipped.',
          currentFocusSuggestion: 'Examine hybrid vector search and token-cost optimization for multi-tenant LLM agents before scaling your MVP infrastructure.',
          recommendationPreference: 'Project-based and challenge content in AI + Business performs best for you.',
          aiLearningNote: 'Your behavior shows a shift from pure engineering topics toward business-technical hybrid content.',
          engagementTip: 'Tackle one advanced architecture project this week to test your scaling assumptions.',
          personalizationConfidence: { goals: 0.97, interests: 0.91, style: 0.89, behavior: 0.93 },
          aiGenerated: false
        }),
        metadata: JSON.stringify({ confidence: 0.97, dominantGoal: 'build-startup' })
      },
      {
        userId: alex.id,
        type: 'focus_suggestion',
        content: 'Examine hybrid vector search and token-cost optimization for multi-tenant LLM agents before scaling your MVP infrastructure.',
        metadata: JSON.stringify({ action: 'optimize_rag_infra' })
      }
    ]
  });

  console.log('✅ Demo users seeded successfully!');
  console.log('   Priya Sharma: priya@demo.com / password123 (Beginner AI Learner)');
  console.log('   Alex Chen:    alex@demo.com  / password123 (Advanced Startup Founder)');
}

seedDemoUsers()
  .catch((e) => {
    console.error('Error seeding demo users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
