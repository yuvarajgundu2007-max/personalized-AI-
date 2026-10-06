# 🚀 AdaptiveAI — Intelligent Personalized Experience Engine

> **Hackathon Theme: Personalized AI Experiences**  
> *"Users often receive generic digital experiences that fail to adapt to their individual preferences, goals, behaviors, interests, skill levels, previous interactions, feedback, changing needs, and current context."*

**AdaptiveAI** is a production-grade, full-stack adaptive learning intelligence platform where **personalization is the core engine**, not an afterthought or an isolated chatbot widget.

---

## 🌟 The Core Personalization Loop

Traditional applications present static feeds or simple filter tags. **AdaptiveAI** demonstrates a closed, continuous learning loop:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE CONTINUOUS PERSONALIZATION LOOP                  │
└────────────────────────────────────────────────────────────────────────┘
       ▲                                                           │
       │                                                           ▼
┌───────────────┐     Implicit & Explicit Signals        ┌───────────────────┐
│     USER      │ ─────────────────────────────────────► │ BEHAVIORAL ENGINE │
│  INTERACTIONS │  (Views, Clicks, Skips, Likes, Chats)  │  (Session Time,   │
└───────────────┘                                        │   Velocity, CTF)  │
       ▲                                                 └───────────────────┘
       │                                                           │
       │                                                           ▼
┌───────────────┐          Dynamic 6-D Scoring           ┌───────────────────┐
│ ADAPTED FEEDS │ ◄───────────────────────────────────── │ NEURAL USER MODEL │
│ & AI COPILOT  │      (28% Goal + 22% Interest +        │  (Skill Matrix,   │
└───────────────┘       20% Behavior + 15% Skill...)     │   Learned Persona)│
                                                         └───────────────────┘
```

1. **User Action:** The user browses, reads, likes, bookmarks, completes, or skips content, or queries the AI copilot.
2. **Behavioral Ingestion:** Events stream immediately into the analytics engine with metadata (dwell time, category, difficulty).
3. **Neural Profile Evolution:** The mathematical persona model updates topic affinity, completion velocity, and skill indicators.
4. **Scoring Engine Recalibration:** Content items are evaluated through a 6-factor reward function.
5. **Real-time Adapted Experience:** Recommendations, AI explanations, and Copilot context adjust live.
6. **Explicit User Agency:** Users can view *why* items were recommended, pause personalization, or reset their neural profile anytime.

---

## 🧮 Mathematical Personalization Algorithm

Every piece of content is scored in real time for each user according to a multi-objective optimization formula:

$$\text{Personalization Score} = w_g S_{\text{goal}} + w_i S_{\text{interest}} + w_b S_{\text{behavior}} + w_s S_{\text{skill}} + w_f S_{\text{feedback}} + w_t S_{\text{style}}$$

| Dimension | Weight | Formula & Mechanism |
| :--- | :---: | :--- |
| **Goal Alignment ($S_{\text{goal}}$)** | **28%** | Jaccard similarity & tag intersection with active user milestone |
| **Category Affinity ($S_{\text{interest}}$)** | **22%** | Frequency of interactions & explicit topic selection |
| **Implicit Behavior ($S_{\text{behavior}}$)** | **20%** | Reading dwell time, completion velocity, and bounce rate |
| **Skill Calibration ($S_{\text{skill}}$)** | **15%** | Distance between user level (Beginner/Intermediate/Advanced) & content level |
| **Explicit Feedback ($S_{\text{feedback}}$)** | **10%** | Liked (+25%), Saved (+20%), Completed (+30%), Skipped (-15%), Disliked (-35%) |
| **Delivery Style ($S_{\text{style}}$)** | **5%** | Match with preferred format (Bite-sized, Hands-on, Deep dive, Challenge) |

---

## 👥 Pre-Configured Demo Accounts for Judges

To immediately experience contrasting personalized models without manual onboarding, use the quick-fill buttons on the login page:

### 1. **Priya Sharma** (`priya@demo.com` / `password123`)
* **Persona:** Frontend Developer transitioning into AI Engineering.
* **Goal:** `🤖 Learn AI & Machine Learning`
* **Skill Level:** `Beginner`
* **Style:** `Short-form / Bite-sized` (15 mins/day)
* **Experience:** Feeds emphasize intuitive ML concepts, prompt engineering basics, and visual guides. High-theory or advanced RAG pipelines are deprioritized.

### 2. **Alex Chen** (`alex@demo.com` / `password123`)
* **Persona:** Senior Software Architect building an autonomous agent startup.
* **Goal:** `🚀 Build a Tech Startup`
* **Skill Level:** `Advanced`
* **Style:** `Practical / Architecture` (1 hour/day)
* **Experience:** Feeds prioritize production RAG pipelines, LLM fine-tuning, vector database scalability, and SaaS monetization frameworks. Beginner tutorials are filtered out.

---

## 💻 Tech Stack & Architecture

### Frontend (`/client`)
* **React 19** + **Vite 8**
* **Tailwind CSS v3** with bespoke design system (dark glassmorphism, HSL harmonious gradients, smooth micro-interactions)
* **Recharts 3** for real-time 7-day velocity charts, category affinity graphs, and score gauges
* **Lucide React** icons
* **React Hot Toast** for instantaneous action feedback
* **Axios** with JWT auth interceptors

### Backend (`/server`)
* **Node.js** + **Express**
* **Prisma ORM** + **SQLite** (`dev.db` for zero-friction setup, provider-agnostic)
* **Google Gemini API** (`@google/generative-ai`) with heuristic fallback engines for 100% offline uptime
* **JWT (JSON Web Tokens)** + **Bcrypt.js** (12 salt rounds)
* **Zod** for schema validation
* **Helmet**, **CORS**, and **Rate Limiting** for enterprise security

---

## 🛠️ Quickstart Guide

### 1. Prerequisites
* **Node.js** (v18 or v20+ recommended)
* **npm**

### 2. Setup Server
```bash
cd server
npm install

# Push database schema & generate Prisma Client
npm run db:push
npm run db:generate

# Seed 36 curated learning resources
npm run db:seed

# Seed the two demo accounts (Priya & Alex)
npm run db:seed:demo

# Start the backend server (runs on port 3001)
npm run dev
```

### 3. Setup Client
```bash
cd ../client
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧭 Application Tour & Feature Highlights

### 1. Dynamic Dashboard (`/dashboard`)
* AI-generated greeting and daily adaptive insight card.
* **"Why this recommendation?"** modal breakdown on every card revealing the exact score weights.
* Instant feedback actions: 👍 Like, 👎 Dislike, 🔖 Save, ✅ Complete, ⏩ Skip.
* Engaging statistics: streak counter, engagement score, catalog completion.

### 2. Intelligent Content Discovery (`/discover`)
* Search across all 36 topics with instant multi-factor filtering (Categories, Difficulty, Format).
* Sort by **AI Match (Highest)** to see personalized rankings recalculate.

### 3. Context-Aware AI Copilot (`/assistant`)
* Live chat with Google Gemini trained with active learner parameters in system prompt memory.
* Live inspector sidebar showing active AI memory: goal, skill level, interests, and recent session notes.
* Chat interactions stream back into the recommendation engine.

### 4. Learning Analytics & Growth (`/progress`)
* Recharts **7-Day Velocity Chart** tracking daily interactions vs. completions.
* **Topic Affinity Distribution** horizontal bar graph.
* Explicit feedback audit breakdown (+ weights for likes/saves/completions).
* Adaptive Milestone unlocks.

### 5. "How the AI Understands You" (`/personalization`)
* Neural Persona Formulation summary with confidence score.
* Visual transparent breakdown of the 6-dimension scoring formula.
* Learned affinities matrix.
* **"Recalibrate AI Persona"** button for immediate on-demand model training.

### 6. Transparency & Ethical AI Controls (`/settings`)
* Edit goals, skill level, format, and available time anytime.
* **Pause Dynamic Personalization:** Freezes persona adaptation for unbiased discovery.
* **Clear Activity History & Reset Model:** Full data sovereignty.

---

## 🔒 Security & Privacy Commitments
* **AI API Keys:** Stored strictly server-side in `.env`; never leaked to client bundles.
* **Graceful Degradation:** Intelligent fallback heuristic engine allows full application evaluation even without a live Gemini API key.
* **Zero Plaintext Passwords:** Secure bcrypt hashing with 12 rounds.
* **Data Privacy:** Users can pause data collection or wipe interaction history at will.
