## Project Image Uploads

- `POST /projects/upload-image`
	- Requires authentication (same Bearer token as other protected routes).
	- Accepts a multipart form field named `file` containing a JPEG, PNG, GIF, or WebP image up to 5 MB.
	- On success returns `{ "image_url": "/uploads/project_images/<filename>" }`.
- Uploaded files are written to `backend/uploads/project_images/` and exposed at `/uploads/project_images/...` via FastAPI's static file mounting.
- When creating a project, pass the returned `image_url` (the relative path) as the `image_url` field in the `POST /create/project` payload.
