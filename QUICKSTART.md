# Quick Start Guide

## Prerequisites
- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- PostgreSQL or SQLite (database)

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv .venv
```

### 3. Activate virtual environment
**Windows:**
```bash
.venv\Scripts\activate
```

**Mac/Linux:**
```bash
source .venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Set environment variables
Create a `.env` file:
```env
TOKEN_EXPIRATION=4
DATABASE_URL=sqlite:///./sheleads.db
SECRET_KEY=your-secret-key-here
```

### 6. Run the backend server
```bash
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`

### 7. Test the API
```bash
# Check if server is running
curl http://localhost:8000/

# Expected response: {"message": "Hello World"}
```

---

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Set environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run the development server
```bash
npm run dev
# or
pnpm dev
```

Frontend will be available at: `http://localhost:3000`

---

## Testing the Implementation

### 1. Create a User Account
1. Navigate to `http://localhost:3000/signup`
2. Fill in the registration form
3. Submit to create account

### 2. Login
1. Navigate to `http://localhost:3000/login`
2. Enter your credentials
3. You'll be redirected to the dashboard

### 3. Create a Project
1. Go to Dashboard → Projects
2. Click "Create New Project"
3. Fill in project details
4. Add events if needed
5. Submit

### 4. Test Volunteer Application (Simplified Flow)
1. Go to Dashboard → Search
2. Find a project
3. Click "View Details"
4. Click "Apply to Volunteer"
5. **NEW**: You'll see a simple confirmation modal
6. Click "Yes, Apply" to submit
7. Application is created with your profile data automatically

### 5. View Analytics
1. Go to Dashboard → Analytics
2. **NEW**: Data is now fetched from backend API
3. Try different date ranges (7d, 30d, 90d, 365d)
4. View charts and metrics
5. Export data as CSV

---

## API Testing with cURL

### Get Analytics Overview
```bash
# First, login to get token
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Use the token in subsequent requests
TOKEN="your_token_here"

# Get analytics overview
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/analytics/overview?days=30"

# Get projects by category
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/analytics/projects-by-category?days=30"

# Get skills distribution
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/analytics/skills-distribution?days=30"

# Get monthly hours
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/analytics/monthly-hours?days=30"

# Get application stats
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/analytics/application-stats?days=30"
```

---

## Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
- Check if port 8000 is already in use
- Verify Python version: `python --version`
- Ensure all dependencies are installed: `pip list`

### Issue: Frontend won't start
**Solution:**
- Check if port 3000 is already in use
- Verify Node version: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Issue: Analytics page shows no data
**Solution:**
- Verify backend is running
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Ensure you're logged in
- Create some projects first
- Check browser console for errors

### Issue: CORS errors
**Solution:**
- Backend already has CORS enabled for all origins
- If still having issues, check browser console
- Verify API_URL in frontend matches backend URL

### Issue: Authentication errors
**Solution:**
- Check if token is stored in localStorage
- Try logging out and logging back in
- Verify token hasn't expired (default: 4 weeks)

---

## Development Workflow

### Making Changes to Backend
1. Edit files in `backend/`
2. Server auto-reloads (if using `--reload` flag)
3. Test endpoints with cURL or Postman
4. Check logs in terminal

### Making Changes to Frontend
1. Edit files in `frontend/`
2. Next.js auto-reloads
3. Check browser for changes
4. Check browser console for errors

### Database Changes
1. Modify models in `backend/models.py`
2. Create migration (if using Alembic)
3. Run migration
4. Restart backend server

---

## Project Structure

```
sheleads/
├── backend/
│   ├── main.py              # Main API file with analytics endpoints
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication logic
│   ├── database.py          # Database configuration
│   ├── utils.py             # Utility functions
│   └── ANALYTICS_API.md     # API documentation
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx # Analytics dashboard (UPDATED)
│   │   │   └── search/
│   │   │       └── page.tsx # Search page (UPDATED)
│   │   ├── login/
│   │   └── signup/
│   ├── components/
│   ├── contexts/
│   └── lib/
│
├── IMPLEMENTATION_SUMMARY.md
├── ANALYTICS_ARCHITECTURE.md
└── QUICKSTART.md (this file)
```

---

## Next Steps

1. **Add More Projects**: Create diverse projects to see analytics
2. **Test Applications**: Apply to projects and accept/reject applications
3. **Explore Charts**: Try different date ranges in analytics
4. **Export Data**: Test CSV export functionality
5. **Customize**: Modify colors, add new metrics, etc.

---

## Useful Commands

### Backend
```bash
# Run tests (if available)
pytest

# Check code style
black main.py

# Type checking
mypy main.py

# View database
sqlite3 sheleads.db
```

### Frontend
```bash
# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Recharts Docs**: https://recharts.org/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/

---

## Support

For issues or questions:
1. Check the documentation files
2. Review error logs
3. Verify environment variables
4. Test API endpoints individually
5. Check database for data

Happy coding! 🚀
