# ThreadSecurity Chatbot — Colleague Integration Guide

Everything your colleague needs to embed this chatbot into `threadsecurity.in`.

---

## What This Chatbot Does

- Answers questions about ThreadSecurity's AI & Cybersecurity courses, mentors, projects, and enrollment
- Shows interactive course catalogs with clickable filters (domain → duration → course details)
- Streams AI responses in real-time (typing effect) from a Groq LLM via RAG (Qdrant vector search)
- Caches responses in Redis to avoid repeated LLM calls
- Handles greetings, farewells, enrollment intent, and out-of-scope guardrails locally (no backend call needed)

---

## Architecture Overview

```
threadsecurity.in (website)
        │
        │  POST /chat  (fetch API, streaming)
        ▼
  FastAPI Backend (port 8000)
        ├── Redis       → response cache
        ├── Qdrant      → vector DB (course/mentor knowledge)
        └── Groq LLM   → generates streamed answers
```

---

## Part 1 — Backend Deployment (Server Side)

### What to Deploy

The entire `chatbott/` folder contains the backend. The key pieces are:

| File/Folder | Purpose |
|---|---|
| `app/` | FastAPI application code |
| `data/` | JSON knowledge files (courses, mentors, projects, platform info) |
| `Dockerfile` | Builds the API image |
| `docker-compose.yml` | Runs API + Qdrant + Redis together |
| `requirements.txt` | Python dependencies |
| `.env` | API keys and config (see below) |

### Step 1 — Configure `.env`

Create a `.env` file in the root `chatbott/` folder with these values:

```env
# Vector Database (Qdrant)
QDRANT_URL=http://qdrant:6333        # use this exact value when running via Docker Compose
QDRANT_API_KEY=                      # leave blank for local/self-hosted Qdrant

# LLM Provider — get your own keys, do NOT use the dev keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Cache
REDIS_URL=redis://redis:6379         # use this exact value when running via Docker Compose

# Auth (optional, not currently enforced)
JWT_SECRET=change-this-to-something-strong

# LLM Model
GROQ_MODEL=mixtral-8x7b-32768
```

> **Warning:** The dev `.env` file contains real API keys. **Replace them** with production keys before deploying. Never commit `.env` to git.

### Step 2 — Deploy with Docker Compose

On your server (AWS EC2, DigitalOcean Droplet, Render, etc.):

```bash
# Clone / upload the chatbott/ folder to the server, then:
cd chatbott/

# Build and start all services (API + Qdrant + Redis)
docker-compose up -d --build

# Check they're all running
docker-compose ps

# View API logs
docker-compose logs -f api
```

This starts:
- **FastAPI API** on port `8000`
- **Qdrant** (vector DB) on port `6333`
- **Redis** (cache) on port `6379`

### Step 3 — Set Up Nginx Reverse Proxy

Map the API to a subdomain like `api.threadsecurity.in` with SSL:

```nginx
server {
    listen 443 ssl;
    server_name api.threadsecurity.in;

    ssl_certificate     /etc/letsencrypt/live/api.threadsecurity.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.threadsecurity.in/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;

        # Required for streaming responses
        proxy_buffering    off;
        proxy_read_timeout 60s;
    }
}
```

Get SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d api.threadsecurity.in
```

### Step 4 — Update CORS for Production

Open `app/main.py` and change this line:

```python
# CHANGE THIS:
allow_origins=["*"],

# TO THIS:
allow_origins=["https://threadsecurity.in", "https://www.threadsecurity.in"],
```

### Step 5 — Verify the API is Live

Visit `https://api.threadsecurity.in/` in browser — you should see:
```json
{"status": "ok", "service": "ThreadSecurity Chatbot API is running"}
```

---

## Part 2 — Frontend Integration (Website Side)

There are **three ways** to embed the chatbot. Pick one.

---

### Option A — Iframe Embed (Easiest, Recommended)

If the frontend is deployed separately (e.g., on Vercel/Netlify), drop an iframe anywhere on the website:

```html
<!-- Paste this wherever you want the chatbot on threadsecurity.in -->
<iframe
  src="https://chat.threadsecurity.in"
  width="100%"
  height="700px"
  style="border: none; border-radius: 24px;"
  title="ThreadSecurity AI Assistant"
></iframe>
```

Deploy the `frontend/` folder to Vercel or Netlify:
```bash
cd frontend/
npm install
npm run build
# Drag the dist/ folder into Vercel/Netlify, or connect your git repo
```

After deploying, update the API URL inside `frontend/src/App.jsx` (~line 402):
```js
// Change:
const response = await fetch('/api/chat', {
// To:
const response = await fetch('https://api.threadsecurity.in/chat', {
```

---

### Option B — React Component (If site already uses React)

Copy these two files into your React project:

| Copy from | Copy to |
|---|---|
| `frontend/src/App.jsx` | `src/components/Chatbot.jsx` |
| `frontend/src/App.css` | `src/components/Chatbot.css` |

Update the import at the top of `Chatbot.jsx`:
```js
// Change:
import './App.css';
// To:
import './Chatbot.css';
```

Update the API fetch URL in `Chatbot.jsx` (~line 402):
```js
// Change:
const response = await fetch('/api/chat', {
// To:
const response = await fetch('https://api.threadsecurity.in/chat', {
```

Use it anywhere on the site:
```jsx
import Chatbot from './components/Chatbot';

function ContactPage() {
  return (
    <div>
      <h1>Talk to Our Assistant</h1>
      <Chatbot />
    </div>
  );
}
```

---

### Option C — Plain HTML Page (No React)

Build the frontend and embed it as a static page:

```bash
cd frontend/
npm install
npm run build
# This generates the frontend/dist/ folder
```

Upload the contents of `dist/` to your server (e.g., at `/chatbot/`). Then embed in any HTML page:

```html
<!-- In <head> -->
<link rel="stylesheet" href="/chatbot/assets/index.css">

<!-- At end of <body> -->
<div id="chatbot-root"></div>
<script type="module" src="/chatbot/assets/index.js"></script>
```

---

## Part 3 — API Reference (For Custom Integrations)

If the website already has its own chat UI and just needs to call the backend:

### POST `/chat`

**Request:**
```json
{
  "query": "What AI courses do you offer?",
  "session_id": "any-unique-string-per-user-session"
}
```

**Response:** Plain text stream (`text/plain; charset=utf-8`)

The response is streamed chunk by chunk. Read it with:

```js
const sessionId = Math.random().toString(36).slice(2); // generate once per page load

const response = await fetch('https://api.threadsecurity.in/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userMessage, session_id: sessionId })
});

const reader = response.body.getReader();
const decoder = new TextDecoder('utf-8');

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  // append chunk to your chat UI
}
```

**GET `/`** — Health check, returns `{"status": "ok"}`

---

## Part 4 — Local Development (For Testing)

To run everything locally before deploying:

```bash
# Terminal 1 — Start backend services + API
cd chatbott/
docker-compose up -d qdrant redis   # starts Qdrant + Redis
uvicorn app.main:app --reload       # starts FastAPI on http://localhost:8000

# Terminal 2 — Start frontend dev server
cd chatbott/frontend/
npm install
npm run dev                         # opens http://localhost:5173
```

The Vite dev server automatically proxies `/api/*` → `http://localhost:8000` (configured in `vite.config.js`). No CORS issues locally.

---

## Part 5 — Environment Variables Reference

| Variable | Where to Get It | Notes |
|---|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Required for LLM responses |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | Optional fallback |
| `GROQ_MODEL` | Groq docs | Default: `mixtral-8x7b-32768` |
| `QDRANT_URL` | Your Qdrant instance | `http://qdrant:6333` in Docker |
| `REDIS_URL` | Your Redis instance | `redis://redis:6379` in Docker |
| `JWT_SECRET` | Any random string | For future auth use |

---

## Part 6 — Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:8000` | Backend isn't running. Run `uvicorn app.main:app --reload` |
| `ImportError: cannot import name 'runtime_version'` | Run `pip install --upgrade google-generativeai protobuf` |
| Chatbot shows "having trouble reaching server" | Check CORS — add your domain to `allow_origins` in `app/main.py` |
| Responses not streaming | Nginx must have `proxy_buffering off` |
| Qdrant connection error | Run `docker-compose up -d qdrant` |
| Redis connection error | Run `docker-compose up -d redis` |

---

## File Structure Summary

```
chatbott/
├── app/                    ← FastAPI backend
│   ├── main.py             ← API endpoints (/chat, /)
│   ├── config.py           ← loads .env variables
│   ├── cache/              ← Redis client
│   ├── generation/         ← LLM client + prompts
│   ├── retrieval/          ← Qdrant hybrid search
│   └── observability/      ← logging
├── data/                   ← Knowledge base JSON files
├── frontend/               ← React chat UI
│   └── src/
│       ├── App.jsx         ← full chatbot component (copy this)
│       └── App.css         ← all styles (copy this)
├── Dockerfile              ← builds the API Docker image
├── docker-compose.yml      ← runs API + Qdrant + Redis
├── requirements.txt        ← Python dependencies
└── .env                    ← API keys (DO NOT COMMIT TO GIT)
```
