# Nizam Resume Analyser

A React and Vite frontend for matching a PDF resume against a pasted job
description. The results include a match score, skills found, and skills to
highlight.

## Run the app

Start the API in one terminal:

```bash
cd backend
npm install
npm start
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. During development, Vite proxies `/api`
requests to the Express server at `http://localhost:3001`.

## Upload requirements

- Resume must be a PDF no larger than 5 MB.
- Paste the job description into the form.
- The analyser scores against tracked skills found in the job description. If
  it finds none, the result explains that it used the full tracked skills list.
