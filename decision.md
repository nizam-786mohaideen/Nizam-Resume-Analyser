# Decision record: Nizam Resume Analyser, split into frontend and backend

## What the spec now asks for

1. A landing page named "Nizam Resume Analyser" (React, Vite).
2. The user uploads a resume PDF and pastes a job description (JD).
3. The result shows a score, the skills present, and the skills missing.
4. The React project lives in `frontend/`.
5. A `backend/` Express server handles the request.

The first draft was a fully client-side mock with no server. The new spec
replaces that: a server now receives the PDF and the JD.

## Decisions

**PDF parsing moves to the server.** The browser no longer reads the PDF. The
frontend sends the file in a `multipart/form-data` request. The backend reads
the bytes with `pdfjs-dist` (the Node build) and returns JSON. This keeps the
parsing logic in one place and lets the frontend drop the PDF library.

**The score is measured against the JD.** The score is the share of the skills
the JD asks for that the resume shows:

- `present` = JD skills found in the resume
- `missing` = JD skills not found in the resume
- `score` = `present / (present + missing) × 100`

The skill dictionary is the same list as before. If the JD names none of the
tracked skills, the backend falls back to scoring the whole list and says so in
the response (`basis: "general"`), so the page never shows an empty result
without explanation.

**Express with `multer`.** `multer` is the standard middleware for file upload
in Express. Files are kept in memory and capped at 5 MB. Only `application/pdf`
is accepted.

**Vite proxies `/api` to the server.** During development the frontend calls
`/api/analyse` and Vite forwards it to `http://localhost:3001`. The frontend
never hard-codes the server address, and no CORS setup is needed.

**The skill list is duplicated in the backend.** The frontend no longer needs
`skills.js`, so the file moves to `backend/`. Sharing it between the two
packages would need a workspace or a monorepo setup. That is out of scope for a
mock.

## Consequences

- Two packages, each with its own `package.json` and `node_modules`. Run
  `npm install` in both.
- Two processes in development: the API on port 3001 and Vite on its own port.
- Large or malicious PDFs are now the server's problem. The 5 MB limit and the
  PDF type check are the first line of defence.

## Open questions

- Should the JD be pasted text only, or also accepted as a PDF? This build
  takes pasted text.
- Should skill matching also look for synonyms across the JD and the resume
  (for example, "JS" and "JavaScript")? The current dictionary already maps
  synonyms to a skill label, so this is handled for the tracked list.
