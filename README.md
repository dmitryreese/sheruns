# News Analyzer

Search recent news articles, trigger AI-powered summaries and sentiment analysis, and browse the full history of analyzed articles.

## Stack

- **Next.js** (Pages Router) + TypeScript
- **PostgreSQL** via `pg` (raw SQL, no ORM)
- **OpenAI** `gpt-4.1-nano` for summarization and sentiment
- **GNews API** for real-time news search

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/news/search?q=query` | Search GNews — results are ephemeral, nothing stored |
| `POST` | `/api/articles/analyze` | Analyze an article with OpenAI and persist the result |
| `GET` | `/api/articles` | List all stored analyses, newest first |

`POST /api/articles/analyze` is idempotent — sending the same article URL twice returns the cached DB row without calling OpenAI again.

## Local setup

1. Copy the env file and fill in your keys:

```bash
cp .env.example .env.local
```

2. Start a local PostgreSQL database and set `DATABASE_URL` in `.env.local`. The table is created automatically on first request.

3. Install dependencies and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

### Vercel (frontend + API)

```bash
npx vercel
```

Add `GNEWS_API_KEY`, `OPENAI_API_KEY`, and `DATABASE_URL` as environment variables in the Vercel dashboard.

### Railway (PostgreSQL)

Create a new PostgreSQL service on Railway and copy the `DATABASE_URL` it provides.
