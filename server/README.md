# RoadSense AI - Server

This small Express server provides a single placeholder endpoint for Gemini insights.

Quick start

1. Change to the server directory:

   cd server

2. Install dependencies:

   npm install

3. Create a `.env` file (optional for now) from the example:

   cp .env.example .env

4. Start the server:

   npm start

The server listens on port 3001 by default. The placeholder endpoint is:

POST http://localhost:3001/api/gemini-insights

Request JSON:

{
  "locationData": { /* ... */ }
}

Response (placeholder):

{
  "text": "test response"
}

Next steps

- Replace the placeholder logic in `index.js` with a server-side call to the Gemini SDK using `process.env.GEMINI_KEY`.
- Securely set `GEMINI_KEY` in the server's environment (do not commit secrets to git).

Running locally with Gemini key

1. Create a `server/.env` file with your Gemini API key:

```text
GEMINI_KEY=your_key_here
```

2. Run the backend (from the repo root or `server` folder):

```bash
cd server
npm install
node index.js
```

The backend will run on port 3001 by default.

3. Run the frontend (from the repo root):

```bash
npm run dev
```

The frontend runs on Vite's default port (usually 5173). The frontend will POST location data to the backend at `http://localhost:3001/api/gemini-insights`.
