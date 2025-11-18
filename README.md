# DayBook

DayBook is an open-source daily note-taking companion that pairs a modern FastAPI backend with a React/Vite frontend. Write exactly one markdown note per day, browse previous entries on a calendar, organize content with tags, search across your archive, and export data at any time. The project is inspired by DailyTxT and is intentionally built for self-hosting and community-driven enhancements.

## Highlights

- **Daily notebook workflow** – Automatically maintains a single markdown document per day with versioned timestamps.
- **Rich writing experience** – SimpleMDE-powered editor, live preview, keyboard shortcuts, and unsaved change hints.
- **Organized knowledge** – Tag notes, filter by tag, and use the instant full-text search service.
- **Calendar-first navigation** – React Calendar gives an at-a-glance overview of which days have entries.
- **Portable data** – Export every note as JSON or Markdown; SQLite storage lives in a Docker volume for easy backups.
- **Container-friendly** – First-class Docker and Compose support with health checks and persistent volumes.

## Architecture

```
Frontend (React + TypeScript + Vite)
    |
    | REST/JSON
    v
Backend (FastAPI + SQLAlchemy)
    |
    v
SQLite database (notes, tags, note_tags)
```

- **Backend**: FastAPI, SQLAlchemy 2.x, Pydantic 2, aiosqlite, served with Uvicorn.
- **Frontend**: React 18, TypeScript, Vite 6, Axios, SimpleMDE, react-calendar, date-fns.
- **Operations**: Dockerfiles per service, docker-compose orchestration, Nginx frontend image, Makefile helpers, deployment docs in `docs/`.

## Quick Start

### Prerequisites

- Docker & Docker Compose *or* Python 3.11+ and Node 20+
- Make (optional, for scripted helpers)

### Option 1: Docker (recommended)

```bash
git clone https://github.com/your-org/daybook.git
cd DayBook
docker compose up -d --build
```

Services:
- Frontend SPA → http://localhost:3000  
- Backend API → http://localhost:8000  
- API docs → http://localhost:8000/docs

Stop everything:

```bash
docker compose down        # keep the volume
docker compose down -v     # remove persisted notes
```

### Option 2: Local development

Backend (FastAPI):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend (React/Vite) – separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 for the development UI. The frontend reads the API base URL from `frontend/.env` (see `.env.example`).

## Project Layout

```
DayBook/
├── backend/                # FastAPI service, SQLAlchemy models, routers, schemas
├── frontend/               # React app, components, services, styles
├── docs/                   # Deployment + installation guides
├── docker-compose.yml      # Multi-service orchestration
├── Dockerfile.backend      # Backend image definition
├── Dockerfile.frontend     # Frontend build + Nginx image
├── Makefile                # Common tasks (lint, build, compose)
└── start.sh                # Convenience script for Docker quick start
```

## API Overview

| Domain | Endpoint | Description |
| --- | --- | --- |
| Notes | `GET /api/notes/` | List notes (paginated) |
|  | `GET /api/notes/{date}` | Fetch the note for a specific day (`YYYY-MM-DD`) |
|  | `POST /api/notes/` | Create a note (auto-enforces one per date) |
|  | `PUT /api/notes/{date}` | Update note contents/tags |
|  | `DELETE /api/notes/{date}` | Remove a note |
| Tags | `GET /api/tags/` | List all tags |
|  | `POST /api/tags/` | Create a tag |
|  | `DELETE /api/tags/{id}` | Remove a tag |
| Search | `GET /api/search/?q=...&tag_id=...` | Full-text search with tag filter |
| Export | `GET /api/export/` | Export JSON snapshot |
|  | `GET /api/export/markdown` | Export combined Markdown file |
| System | `GET /health` | Readiness probe |

Swagger UI is available at `/docs` and Redoc at `/redoc`.

## Contributing

This repository is open to new features, bug fixes, and docs improvements:

1. Fork the repo and create a topic branch.
2. Follow the linting/formatting rules defined by the backend and frontend toolchains.
3. Add or update tests where it makes sense (e.g., API contract changes).
4. Open a pull request that clearly states the motivation and summarizes the changes.

For larger changes (e.g., authentication, encryption), please start a GitHub Discussion or Issue to align with maintainers before coding.

## Community & Support

- **Issues**: Track bugs or feature ideas via GitHub Issues.
- **Discussions**: Share workflows, show off screenshots, or propose RFCs.
- **Docs**: Additional deployment, infrastructure, and environment notes live under `./docs/`.

## License

DayBook is released under the [Creative Commons Attribution-NonCommercial 4.0 International License](LICENSE), a standard non-commercial distribution license. You may use, modify, and redistribute the project for non-commercial purposes with proper attribution; contact the maintainers for commercial licensing inquiries.
