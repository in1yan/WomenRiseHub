# WomenRiseHub

A full-stack platform empowering women changemakers to discover volunteer opportunities, launch community projects, and collaborate on impact initiatives. The project couples a Next.js 15 frontend with a FastAPI backend, backed by PostgreSQL and JWT-based authentication.

## 🚀 Demo

- **Live Site:** https://women-rise-hub.vercel.app/
- **Demo Video:** https://www.youtube.com/watch?v=Z1CrgXSmYbI

## ✨ Key Features

- **Volunteer & Project Management** – Authenticated volunteers can create projects, manage events, and apply to opportunities.
- **JWT Authentication** – Secure login, signup, and protected API routes with bearer tokens.
- **Rich Analytics** – Aggregated metrics for applications, volunteer hours, and project categories.
- **In-app Notifications** – Context-aware updates for new applications, volunteer status changes, and upcoming events.
- **Image Uploads** – Secure project image handling with size/type validation and static serving.

## 🧱 Architecture

| Tier | Tech | Highlights |
| ---- | ---- | ---------- |
| Frontend | [Next.js 15](https://nextjs.org/) (App Router), React 19, TypeScript, Tailwind CSS | Authentication context, dashboard experience, shadcn-style components |
| Backend | [FastAPI](https://fastapi.tiangolo.com/) + SQLAlchemy | REST API, JWT auth, analytics aggregation, image uploads |
| Database | PostgreSQL | Persisted via SQLAlchemy ORM models |
| Tooling | pnpm, uv / pip | Deterministic dependency management |

```
frontend/       # Next.js application
backend/        # FastAPI + SQLAlchemy service
uploads/        # Project image uploads (served by FastAPI)
```

## ⚙️ Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io/installation)
- Python 3.12+
- PostgreSQL database (local or hosted)
- (Optional) [uv](https://docs.astral.sh/uv/) for Python dependency management

## 🗂️ Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>"
SECRET_KEY="super-secret-key"
ALGORITHM="HS256"
TOKEN_EXPIRATION=1  # Token lifetime in weeks
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

> The frontend reads `NEXT_PUBLIC_API_URL` to locate the FastAPI service. Adjust the value when deploying.

## 🛠️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/in1yan/WomenRiseHub.git
cd WomenRiseHub
```

### 2. Backend setup

Using **uv** (recommended):

```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

Using **pip**:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt  # Generate with `uv pip compile pyproject.toml -o requirements.txt`
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs live at `http://127.0.0.1:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to access the app.

## 🔑 Authentication Flow

1. Users sign up via `/create/user` and receive a short volunteer ID.
2. Login via `/login` returns a JWT; the frontend stores it in `localStorage`.
3. Protected routes (e.g., `/projects`, `/me`) require the `Authorization: Bearer <token>` header.
4. Tokens expire after the configured number of weeks (`TOKEN_EXPIRATION`).

## 📡 API Highlights

| Method | Route | Description |
| ------ | ----- | ----------- |
| `POST` | `/create/user` | Register a new volunteer (name, email, phone, password) |
| `POST` | `/login` | Obtain JWT access token |
| `GET` | `/me` | Fetch authenticated user profile |
| `PUT` | `/update/user` | Update profile details, skills, and story |
| `POST` | `/projects/upload-image` | Upload project image (JPEG/PNG/GIF/WebP up to 5 MB) |
| `POST` | `/create/project` | Create a project with events and skill requirements |
| `GET` | `/projects` | List all projects with owner info and events |
| `POST` | `/projects/{project_id}/apply` | Volunteer applies to a project |
| `GET` | `/projects/{project_id}/applications` | List applications for a project |
| `PUT` | `/projects/{project_id}/applications/{application_id}` | Update application status |
| `POST` | `/projects/{project_id}/volunteers` | Add volunteer to a project |
| `GET` | `/analytics/overview` | Aggregated project & volunteer metrics |

## 🧪 Testing & Quality

- **Frontend:** `pnpm run build` (Next.js production build) and add lint/test scripts as needed.
- **Backend:** Add pytest suites and run with `pytest` once configured.
- Static typing can be enforced via mypy; linting via Ruff (caches already ignored).

## 📦 Deployment Notes

- **Frontend:** Deployable on Vercel (as in the live demo). Ensure `NEXT_PUBLIC_API_URL` points to your backend.
- **Backend:** Deploy on any ASGI-compatible platform (e.g., Railway, Render, Fly.io). Provide the same environment variables and expose `/uploads` for static project images.
- Maintain secure secrets management and HTTPS termination in production.

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Follow the coding standards for each stack (Prettier/Tailwind conventions for frontend, PEP 8 for backend).
3. Ensure build/tests pass before submitting a PR.
4. Document any new endpoints or UI flows.

## 📝 License

Distributed under the MIT License. See `LICENSE` for details (add the file if it is missing).
