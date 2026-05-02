# RoadSense.ai

RoadSense is a web dashboard for exploring road accident data through an interactive map. It helps you visualize patterns like high-risk locations, common causes, and time-based trends using filters and analytics.

> This project is for data exploration and insight — not official or legal conclusions.

---

## Features

- Interactive map with heatmap and accident markers
- Filter data by conditions like weather, road type, and time
- View top states and accident causes
- Analyze risk by hour based on selected filters
- Optional AI-generated insights for selected locations

---

## Pages

- `/` → Landing page (project overview)
- `/explorer` → Main dashboard (map, filters, analytics, insights)

---

## Tech Stack

- React + Vite
- Leaflet (maps)
- Recharts (charts)
- Node.js + Express (backend API)
- Google Gemini (optional AI insights)

---

## Getting Started

### Install dependencies

```bash
npm install
npm install --prefix server
```

### Run the project

Frontend:

```bash
npm run dev
```

Backend (AI insights):

```bash
npm run server
```

Open:

```
http://localhost:5173
```

---

## Environment Variables

### Backend (`server/.env`)

```bash
GEMINI_KEY=your_api_key_here
```

---

## Build & Deploy

### Frontend build

```bash
npm run build
```

Deploy the `dist/` folder to hosting platforms like Vercel or Netlify.

### Backend deploy

Deploy the `server/` folder to a Node hosting service (e.g. Render) and set:

- `GEMINI_KEY` in environment variables

---

## Notes

- Requires a CSV dataset of road accidents
- AI insights are optional and depend on API key setup
- Designed for exploration, not prediction or decision-making
