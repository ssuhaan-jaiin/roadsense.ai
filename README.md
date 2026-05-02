# roadsense.ai

Interactive road crash explorer for India-scale CSV data: **Leaflet** map + filters, charts, footer metrics, and optional **Gemini** insights via a small Express proxy.

## Quick start

```bash
npm install
npm install --prefix server
npm run dev          # Vite · http://localhost:5173
npm run server       # API · http://localhost:3001 (Gemini proxy)
```

Copy `.env.example` → `.env.local` and set variables as needed. Put **`GEMINI_KEY`** only in **`server/.env`** (never commit secrets).

## Deploy

| Layer | Suggestion |
|--------|------------|
| **Frontend** | Connect this repo to [Vercel](https://vercel.com) or [Netlify](https://netlify.com): build `npm run build`, publish **`dist`**. SPA routing is configured (`vercel.json`, `public/_redirects`). |
| **Backend** | Use **[Render](https://render.com)** — `render.yaml` provisions a **`server/`** Node web service. Add **`GEMINI_KEY`** in the Render dashboard. |

After Render gives you a URL such as `https://your-service.onrender.com`, set in your frontend host:

`VITE_GEMINI_INSIGHT_URL=https://your-service.onrender.com/api/gemini-insights`

Rebuild/redeploy the frontend so the client picks up the env var.

## Scripts

- `npm run build` — production static assets in `dist/`
- `npm run preview` — local preview of `dist/`
- `npm run server` — start Express from `server/`

## License

Specify your license in the repo settings or add a `LICENSE` file.
