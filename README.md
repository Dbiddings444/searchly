# Searchly

Searchly is a small image-upload and tagging project that demonstrates a full-stack workflow: a React + Vite frontend, an Express + TypeScript backend, S3 for image storage, AWS Rekognition for automated tag detection, and PostgreSQL for metadata storage.

This README is written for contributors and users who may not be deeply familiar with development tools. Follow the steps below to run the project locally.

**Repository structure (high level)**
- **backend/** — Express server, database code, and services that call AWS (S3 + Rekognition).
- **frontend/** — React + TypeScript app (Vite) that provides the image upload UI.
- **db/** — database connection code and SQL migrations.
- **lib/** — small helpers for AWS SDK clients.

**Main features**
- Upload images directly to S3 using pre-signed URLs.
- Automatically analyze images with AWS Rekognition and save detected tags.
- Save and manage image metadata (title, description, tags) in PostgreSQL.
- Edit and delete images via the UI.
- Filter images by title or tags within a post.

Prerequisites (what you need on your machine)
- Node.js (LTS recommended) and npm or yarn
- PostgreSQL (local or a cloud instance)
- An AWS account with S3 and Rekognition access (or mock/stub these for local testing)

Environment variables
Create a `.env` file in the `backend/` folder (or set these variables in your shell):

- `AWS_REGION` — AWS region (e.g. `us-east-1`)
- `AWS_ACCESS_KEY_ID` — AWS access key id
- `AWS_SECRET_ACCESS_KEY` — AWS secret
- `S3_BUCKET_NAME` — the S3 bucket used for uploads
- `DATABASE_URL` or connection pieces used by the backend (see `backend/db/index.ts` for exact config)
- `PORT` — (optional) server port, default in code is `8080`

If you do not want to use real AWS services while developing, you can:
- Use a local S3-compatible server (e.g., MinIO) and point `S3_BUCKET_NAME` and `AWS_REGION` accordingly.
- Stub or mock Rekognition in tests or temporarily bypass calls in the code.

Database setup
1. Create a PostgreSQL database for the project.
2. Run the SQL migration in `backend/db/migrations/001_init_table.sql` to create the `images` table. For example:

```bash
psql -d your_database -f backend/db/migrations/001_init_table.sql
```

3. Ensure `backend/db/index.ts` has the correct connection configuration or set `DATABASE_URL`.

Run the app locally

Backend (API)
1. Open a terminal, go to the backend folder:

```bash
cd backend
npm install
```

2. Start the dev server (uses `tsx` and `nodemon` for hot reloads):

```bash
npm run dev
```

The backend will listen on `http://localhost:8080` by default and exposes the images API under `/api/images`.

Frontend (UI)
1. Open another terminal, go to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

2. The Vite dev server will start and open the app (usually at `http://localhost:5173`). The frontend expects the backend API at `http://localhost:8080/api/images` (see `frontend/src/HomePage.tsx`); update `API_BASE` in that file if your backend runs elsewhere.

API endpoints (small reference)
- `POST /api/images/upload-url` — request a pre-signed S3 upload URL. Body: `{ fileName, fileType }`.
- `POST /api/images` — save image metadata (called after successful S3 upload). Body: `{ url, s3Key, tags, description, title }`. The server will attempt Rekognition analysis for `s3Key` and merge detected tags.
- `GET /api/images` — list saved images and metadata.
- `GET /api/images/:id` — get single image metadata.
- `PUT /api/images/:id` — update metadata (`tags`, `title`, `description`). Tags are normalized (trimmed, lowercased, deduped).
- `DELETE /api/images/:id` — delete a saved image metadata row.

Developer notes and conventions
- Tags normalization: tags stored by the server are trimmed, lowercased, and deduplicated. This prevents accidental duplicates and makes searching more consistent.
- Rekognition integration: the backend calls Rekognition to detect labels and merges them with user-provided tags before saving.
- AWS credentials: for local dev, prefer environment variables or an AWS named profile. Do not commit credentials to the repository.

Troubleshooting
- If uploads fail with permission errors, double-check the S3 bucket policy and credentials.
- If Rekognition calls fail, verify `AWS_REGION` and that the IAM user/role has Rekognition permissions.
- If database queries fail, ensure your connection string and that the `images` table exists (run the SQL migration).

Testing ideas
- Upload an image through the UI and verify tags are auto-populated.
- Use Postman or curl to call `POST /api/images/upload-url` and `POST /api/images` to simulate the flow.

Contributing
- Please open an issue for bugs or feature requests.
- Create a branch per change, add tests for non-trivial logic, and open a pull request describing the change.

Contact
- For questions about running the project locally, open an issue or contact the repo owner.
