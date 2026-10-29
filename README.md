# itelect4-backend

[![CI](https://github.com/JBenjo/itelect4-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/JBenjo/itelect4-backend/actions/workflows/ci.yml)

The REST API behind the ITELECT4 class demo: Express in TypeScript,
MongoDB Atlas through Mongoose, JWT login, and one route that asks
Gemini to review a project description.

## Live

- **Backend:** https://itelect4-backend-nine.vercel.app
- **Frontend:** https://itelect4-project-three.vercel.app

## Architecture

```mermaid
flowchart LR
  fe["itelect4-project<br/>React + Vite on Vercel"]
  be["itelect4-backend<br/>Express on Vercel"]
  db[("MongoDB Atlas")]
  ai["Gemini API"]
  fe -- "fetch + Bearer token" --> be
  be -- "Mongoose" --> db
  be -- "GEMINI_API_KEY" --> ai
```

## Tests

`npm test` runs the Supertest suite in `tests/` against the real
Express app, with the database replaced and Gemini never called.
GitHub Actions runs it on every push (`.github/workflows/ci.yml`).

