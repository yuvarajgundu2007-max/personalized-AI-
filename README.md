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

# Copy the example env (DATABASE_URL, JWT_SECRET, optional GEMINI_API_KEY)
cp .env.example .env

# One command: generate Prisma Client + push schema + seed content + seed demo users
npm run db:setup

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

Visit **`http://localhost:5173`** in your browser. Sign in with a demo account (quick-fill buttons on the login page) or register a new account and complete onboarding.

> **No Gemini API key?** Everything still works — the deterministic behavioral engine takes over insights and chat until you add `GEMINI_API_KEY` to `server/.env`.

---

## 🗄️ Database Schema (Prisma)

```
users            ├─ id, name, email (unique), password (bcrypt hash), timestamps
user_profiles    ├─ 1:1 with users — goal, interests, skillLevel, preferredStyle,
                 │   availableTime, personalNote, currentFocus, engagementScore,
                 │   streak, lastActiveDate, completedItems, savedItems,
                 │   skippedItems, likedCategories, dislikedCategories,
                 │   behavioralSignals, personalizationSummary,
                 │   pausePersonalization, onboardingComplete
content          ├─ title, description, category, type, difficulty, duration,
                 │   tags, goalTags, imageUrl, author
interactions     ├─ userId → users, contentId → content, eventType
                 │   (VIEW/CLICK/SAVE/COMPLETE/SKIP/LIKE/DISLIKE/SEARCH/CHAT/
                 │   PREFERENCE_CHANGE), metadata, timestamp
                 │   Indexed on (userId, timestamp) and (userId, eventType)
feedback         ├─ userId → users, contentId → content, action
                 │   Unique on (userId, contentId, action)
ai_insights      ├─ userId → users, type, content, metadata
sessions         ├─ userId → users, token, expiresAt
```

All relations use foreign keys with `onDelete: Cascade` where appropriate. Behavioral JSON blobs live in `user_profiles` to keep the hot scoring path a single-table read.

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check (no auth) |
| `POST` | `/api/auth/register` | Create account (Zod validation, bcrypt hashing) |
| `POST` | `/api/auth/login` | Obtain JWT |
| `GET` | `/api/auth/me` | Current user + profile summary (auth) |
| `GET` | `/api/profile` | Full personalization profile (auth) |
| `PUT` | `/api/profile` | Onboarding / profile update; AI-parses the personal note |
| `GET` | `/api/preferences` | Explicit preference settings |
| `PUT` | `/api/preferences` | Update preferences (logs `PREFERENCE_CHANGE`) |
| `DELETE` | `/api/preferences/history` | Clear activity history & behavioral signals |
| `POST` | `/api/preferences/reset` | Full personalization reset |
| `GET` | `/api/recommendations` | Ranked recommendations with score breakdowns |
| `POST` | `/api/recommendations/:id/feedback` | like / dislike / save / complete / skip |
| `GET` | `/api/recommendations/:id/explain` | "Why this?" — score breakdown + explanation |
| `POST` | `/api/recommendations/:id/action` | click / view tracking |
| `POST` | `/api/interactions` | Record a behavioral event |
| `GET` | `/api/interactions` | Recent interaction history |
| `GET` | `/api/personalization/profile` | Behavioral summary (top categories, events) |
| `GET` | `/api/personalization/insights` | AI insights (30-min cache) |
| `POST` | `/api/personalization/refresh` | Force insight re-generation |
| `GET` | `/api/personalization/analytics` | Charts data: 7-day activity, categories, feedback |
| `POST` | `/api/ai/chat` | Personalized AI assistant |
| `POST` | `/api/ai/personalize` | Regenerate personalization summary |
| `GET` | `/api/content` | Full catalog with search + filters |

All authenticated routes expect `Authorization: Bearer <token>`. Responses use a consistent JSON shape; errors return `{ "error": "..." }` with proper status codes.

---

## 🔐 Environment Variables

### `server/.env` (copy from `server/.env.example`)
```env
DATABASE_URL="file:./dev.db"     # SQLite locally; PostgreSQL URL in production
JWT_SECRET="change-me"           # Long random string in production
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY=""                # Optional — deterministic fallback works without it
CLIENT_URL="http://localhost:5173"
PORT=3001
NODE_ENV="development"
```

### `client/.env` (copy from `client/.env.example`)
```env
VITE_API_URL=http://localhost:3001/api
```

`.env` files are git-ignored and never committed. The Gemini key only ever exists server-side — the client bundle contains no AI credentials.

---

## 🧪 Testing

The backend ships with **49 automated tests** (Jest + Supertest) covering:

* **Authentication** — registration validation, duplicate rejection, bcrypt hashing verification, login, tampered/expired JWT rejection
* **Personalization engine** — unit tests for the 6-factor scoring function, behavior→profile→re-rank integration tests, dislike suppression, pause flag enforcement
* **Recommendations API** — ranking order, per-user differentiation (User A vs User B receive opposite rankings), feedback validation, explanation endpoint
* **AI fallback** — insights/chat degrade gracefully with zero API keys, insight cache stored as valid JSON
* **Content & interactions** — case-insensitive search, filters, event validation, cross-user data isolation
* **User controls** — history clearing, full personalization reset

```bash
cd server
npm test
```

Tests run against an isolated `test.db` (auto-created via `prisma db push --force-reset`), never touching your dev database.

---

## 🚀 Deployment

### Frontend → Vercel / Netlify
```bash
cd client && npm run build   # outputs to client/dist
```
Set `VITE_API_URL` to your production API URL (e.g. `https://your-api.render.com/api`).

### Backend → Render / Railway / Fly.io
* Start command: `npm start` (runs `node src/app.js`)
* Set `NODE_ENV=production`, `JWT_SECRET`, `CLIENT_URL` (your deployed frontend origin), and `GEMINI_API_KEY`
* CORS is configured from `CLIENT_URL`; request logging is disabled outside development

### Database → PostgreSQL (Supabase / Neon / Railway)
The Prisma schema is provider-agnostic. To switch from the zero-config SQLite dev database to PostgreSQL:

```prisma
// server/prisma/schema.prisma
datasource db {
  provider = "postgresql"            // was "sqlite"
  url      = env("DATABASE_URL")     // e.g. postgresql://user:pass@host:5432/adaptiveai
}
```

```bash
npm run db:push && npm run db:seed && npm run db:seed:demo
```

All queries already run through Prisma's parameterized engine, so no query changes are required.

---

## 🎬 3-Minute Hackathon Demo Script

| Time | Action | What to say / show |
| :--- | :--- | :--- |
| 0:00–0:20 | Landing page | "Most applications treat everyone the same. AdaptiveAI learns you." |
| 0:20–0:50 | Login as **Priya** (quick-fill) | Show the dashboard: short AI articles, beginner level, "Good morning, Priya" |
| 0:50–1:20 | Open any card's **"Why this recommendation?"** | Reveal the exact 6-factor score breakdown — full transparency |
| 1:20–2:00 | 👍 Like one AI item, 👎 dislike a web-dev item, ✅ complete another | Watch the toast feedback, then click **Refresh** — the feed visibly re-ranks |
| 2:00–2:30 | Open **Personalization** page | "How the AI Understands You" — live affinities, engine confidence, AI learning note |
| 2:30–3:00 | Ask the **AI Assistant**: "What should I focus on today?" | The answer references her actual goal, streak, and focus — not a generic reply |
| 3:00–3:40 | Logout → Login as **Alex** (quick-fill) | Completely different dashboard: RAG pipelines, startup monetization, advanced projects |
| 3:40–4:00 | Close on **Activity** page | "Same app, same engine — a different experience per person. It doesn't just use AI; it learns from you." |

---

## 🗺️ Project Structure

```
personalized-AI-/
├── client/                  # React 19 + Vite frontend
│   └── src/
│       ├── api/             # Axios instance + endpoint modules
│       ├── components/      # RecommendationCard, etc.
│       ├── context/         # AuthContext, PersonalizationContext
│       ├── layouts/         # DashboardLayout (sidebar + responsive nav)
│       ├── pages/           # Landing, Login, Register, Onboarding, Dashboard,
│       │                    # Discover, Assistant, Progress, Personalization,
│       │                    # Activity, Settings
│       └── index.css        # Tailwind + bespoke design system
├── server/                  # Express + Prisma backend
│   ├── prisma/              # schema.prisma
│   ├── src/
│   │   ├── ai/              # aiService.js — Gemini + deterministic fallbacks
│   │   ├── database/        # prisma client + seed scripts
│   │   ├── middleware/      # JWT auth, global error handler
│   │   ├── personalization/ # engine.js — scoring + profile evolution
│   │   ├── routes/          # auth, profile, preferences, recommendations,
│   │   │                    # interactions, personalization, ai, content
│   │   └── app.js
│   └── tests/               # 49 Jest + Supertest tests
└── README.md
```

---

## 🔮 Future Improvements
* Content-based embeddings for semantic similarity between items
* Contextual bandits (exploration/exploitation) instead of fixed score weights
* Collaborative filtering once the user base grows
* Dwell-time telemetry via Intersection Observer for implicit signal richness
* Streaming AI responses (SSE) in the assistant
* Notification digest personalized to each user's available time window

---

## 📄 License

MIT — built for the **Personalized AI Experiences** hackathon.

---

## 🔒 Security & Privacy Commitments
* **AI API Keys:** Stored strictly server-side in `.env`; never leaked to client bundles.
* **Graceful Degradation:** Intelligent fallback heuristic engine allows full application evaluation even without a live Gemini API key.
* **Zero Plaintext Passwords:** Secure bcrypt hashing with 12 rounds.
* **Data Privacy:** Users can pause data collection or wipe interaction history at will.
