# roadsense.ai

**RoadSense** is an exploratory web dashboard for large-scale road crash data. It turns a CSV of incidents into an interactive map with heat layering, filters, rankings, hourly risk summaries, and optional **Google Gemini** text for selected map hotspots.  
The UI is geared toward **patterns and hypotheses**, not legal, medical, or official conclusions.

Live shape of the project:

| Area | Route | Role |
|------|--------|------|
| Landing & story | `/` | Hero, motivations, platform copy, footer links |
| Data explorer | `/explorer` | Map, pills, tabbed rail (`Top states` · `Causes` · `Insights`), footer tiles |

---

## Features

- **Spatial view** — Leaflet basemap, heat layer, capped crash markers coloured by dominant cause tier.
- **Filters** — Pills slice one shared dataset across map and analytics (highway vs urban flavour, weather, night, etc. per loader rules).
- **Right rail tabs** — State bar chart; causes donut + legend; AI panel when you pick a point.
- **Footer strip** — National totals from the **full CSV** plus **risk-by-hour** tied to **current filters**.
- **Gemini insights** — Server proxies the model so the browser never holds your provider key.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19, Vite 8, react-router-dom |
| Map | Leaflet, react-leaflet, leaflet.heat |
| CSV | Papa Parse (`src/data/loader.js`) |
| Charts | Recharts |
| API | Node.js, Express (`server/`); Google Generative Language REST |

---

## Repository layout

```
roadsense-ai/
├── public/               # SPA fallback for Netlify, static assets
├── server/               # Express Gemini proxy (`POST /api/gemini-insights`)
├── src/
│   ├── components/       # Explorer rail, MapView, MetricCards, etc.
│   ├── pages/           # HomePage, ExplorerPage
│   ├── data/            # accidents.csv + loader utilities
│   ├── services/        # geminiApi.js, dataGovApi.js stub
│   └── config/          # site URLs, asset paths
├── index.html
├── vite.config.js       # `/api` → localhost proxy in development
├── vercel.json          # SPA rewrite (Vercel)
├── render.yaml          # Optional Render blueprint for `server/`
└── .env.example         # Frontend env template (copy to `.env.local`)
```

Data columns expected by the loader are documented in comments at the top of `src/data/loader.js`.

---

## Prerequisites

- **Node.js 18+** (20 recommended for parity with deployment).
- A **Gemini API key** if you want live insights (`server/`).

---

## Local development

```bash
# Install frontend deps
npm install

# Install API deps
npm install --prefix server
```

**Terminal A — frontend (Vite, default http://localhost:5173):**

```bash
npm run dev
```

**Terminal B — backend (Express, http://localhost:3001):**

```bash
npm run server
```

Vite proxies `/api` to the Node server (`vite.config.js`), so `getAVInsights()` can POST to **`/api/gemini-insights`** without CORS fuss during development.

Production builds do not include the Express app; deploy the **`server`** separately if you ship only `dist/` to a CDN.

---

## Environment variables

### Frontend (`.env.local`)

Copy from `.env.example`. Only variables prefixed with `VITE_` are exposed to the client.

| Variable | Purpose |
|----------|---------|
| `VITE_GEMINI_INSIGHT_URL` | Full URL to Gemini proxy in prod, e.g. `https://your-api.onrender.com/api/gemini-insights`. If unset locally, falls back to `/api/gemini-insights`. |
| `VITE_GITHUB_REPO_URL` | GitHub repo used by in-app GitHub buttons. |
| `VITE_CONTACT_WEBSITE_URL` | Optional footer “Website”. |
| `VITE_LINKEDIN_URL` | Optional footer LinkedIn. |
| `VITE_GITHUB_CONTACT_URL` | Optional footer GitHub profile. |

### Backend (`server/.env`)

| Variable | Purpose |
|----------|---------|
| `GEMINI_KEY` | Primary Gemini key (**or** use `GEMINI_API_KEY` / `GOOGLE_API_KEY`). Never commit real values. |
| `PORT` | Optional; defaults to `3001` locally (Render supplies `PORT` automatically). |

---

## Gemini API

**Endpoint:** `POST /api/gemini-insights`  
**Body:** `{ "locationData": { … } }` — name, counts, causes, weather, risk, coords, etc. (see `AIInsightPanel`).

The prompt asks for exactly **three** short bullets summarised as:

1. Environmental / perception-type challenge for people and autonomy-style futures.  
2. Dominant collision pattern implied by the numbers.  
3. One concrete policy or infrastructure angle.

Responses are exploratory only; validate anything important externally.

---

## Production deployment

### Static frontend

Build output is **`dist/`** after:

```bash
npm run build
npm run preview   # optional local check
```

Suggested hosts: **[Vercel](https://vercel.com)** or **[Netlify](https://netlify.com)** pointed at this repo:

- Build command: `npm run build`  
- Output directory: `dist`  

**React Router (`/explorer`):** SPA routing already has **`vercel.json`** rewrites and **`public/_redirects`** for Netlify.

After deploy, set **`VITE_GEMINI_INSIGHT_URL`** on the host to your live API URL and trigger a redeploy.

### Gemini backend on Render

- **Blueprint:** connect the repo and use root **`render.yaml`**, **or**
- **Web Service manually:** Root directory **`server`**, install `npm install`, start `node index.js`, add **`GEMINI_KEY`** in the dashboard.

Cold starts on free tiers are normal.

---

## Scripts

| Script | Meaning |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run server` | Run `server/index.js` |

---

## License

`package.json` lists **ISC**; replace with another `LICENSE` file if your organisation needs different terms.
