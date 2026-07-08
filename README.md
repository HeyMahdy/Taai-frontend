# TAAI

AI-powered automated grading system for university teachers in Bangladesh. Teachers upload assignment questions, rubrics, and student answer sheets — TAAI extracts content via OCR and grades submissions against the rubric using AI.

## Features

- Auth (signup/login/JWT)
- Student CRUD (add/edit/delete/view)
- Assignment CRUD (create/view/edit/delete)
- Questions, rubrics, and teacher solutions upload with AI OCR extraction + manual edit
- Responsive UI with dark mode

## Tech Stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) — full-stack React framework & routing
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- [TanStack Query](https://tanstack.com/query) — server state
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — forms & validation
- [Cloudflare Workers](https://workers.cloudflare.com/) (`wrangler`) — deployment target

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and set the backend API URL:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=<your-backend-api-url>
```

### Run Dev Server

```bash
npm run dev
```

App runs at `http://localhost:3000` by default.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (TanStack Start / SSR) |
| `npm run build:spa` | Production build (static SPA) |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── components/
│   ├── app/       # App-level components (shell, sidebar, topbar, file preview, markdown render...)
│   └── ui/        # shadcn/ui primitives (button, dialog, table, form...)
├── hooks/         # Custom React hooks
├── lib/           # Utilities, API client, auth, error handling
├── routes/        # File-based routes (TanStack Router)
├── router.tsx     # Router setup
├── server.ts      # Server entry (SSR)
├── start.ts       # TanStack Start entry
└── styles.css     # Global styles
```

## Deployment

Configured for both Vercel (`vercel.json`) and Cloudflare Workers (`wrangler.jsonc`).

## Documentation

- [`BACKEND_API.md`](./BACKEND_API.md) — backend API reference
- [`FIELD_REQUIREMENTS.md`](./FIELD_REQUIREMENTS.md) — data field requirements
- [`PRODUCT_ROADMAP.md`](./PRODUCT_ROADMAP.md) — gap analysis & roadmap
