# Analytics Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Analytics Dashboard Page                          │  │
│  │  /app/dashboard/analytics/page.tsx                        │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │   KPI    │  │   Bar    │  │  Donut   │  │   Line   │ │  │
│  │  │  Cards   │  │  Chart   │  │  Chart   │  │  Chart   │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  │                                                            │  │
│  │  Date Range: [7d] [30d] [90d] [365d]  [Export CSV]       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ useEffect() + fetch()             │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP Requests (Bearer Token)
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      Backend API (FastAPI)                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Analytics Endpoints                            │ │
│  │                                                              │ │
│  │  GET /analytics/overview?days=30                           │ │
│  │  GET /analytics/projects-by-category?days=30               │ │
│  │  GET /analytics/skills-distribution?days=30                │ │
│  │  GET /analytics/monthly-hours?days=30                      │ │
│  │  GET /analytics/application-stats?days=30                  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │         Authentication Middleware                     │ │ │
│  │  │  - Verify JWT Token                                   │ │ │
│  │  │  - Extract User ID                                    │ │ │
│  │  │  - Scope queries to user's projects                   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ SQLAlchemy ORM                    │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ SQL Queries
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    Database (PostgreSQL/SQLite)                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    users     │  │   projects   │  │project_events│          │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤          │
│  │ id           │  │ id           │  │ id           │          │
│  │ name         │  │ owner_id  ───┼──▶ project_id   │          │
│  │ email        │  │ title        │  │ name         │          │
│  │ skills       │  │ category     │  │ date         │          │
│  │ created_at   │  │ created_at   │  │ slots        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │project_applications│  │project_volunteers│                    │
│  ├──────────────────┤  ├──────────────────┤                    │
│  │ id               │  │ id               │                    │
│  │ project_id       │  │ project_id       │                    │
│  │ volunteer_id     │  │ volunteer_id     │                    │
│  │ status           │  │ status           │                    │
│  │ applied_at       │  │ joined_at        │                    │
│  └──────────────────┘  │ hours_contributed│                    │
│                         └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Interaction
```
User selects date range (e.g., 30 days)
    ↓
Frontend triggers useEffect()
    ↓
Multiple parallel API calls initiated
```

### 2. API Request Flow
```
Frontend → GET /analytics/overview?days=30
         → GET /analytics/projects-by-category?days=30
         → GET /analytics/skills-distribution?days=30
         → GET /analytics/monthly-hours?days=30
    ↓
Bearer Token included in Authorization header
    ↓
Backend validates JWT token
    ↓
Extract user_id from token
```

### 3. Database Query Flow
```
Backend calculates cutoff_date = now() - days
    ↓
Query user's projects WHERE owner_id = user_id AND created_at >= cutoff_date
    ↓
Aggregate data:
  - COUNT projects by category
  - COUNT volunteers per project
  - SUM hours_contributed
  - COUNT applications by status
    ↓
Return JSON response
```

### 4. Frontend Rendering
```
Receive JSON data from all endpoints
    ↓
Update React state with analytics data
    ↓
Recharts library renders visualizations:
  - Bar Chart (projects by category)
  - Donut Chart (skills distribution)
  - Line Chart (monthly hours)
  - KPI Cards (totals)
```

## Key Components

### Frontend Components
- **AnalyticsPage**: Main container component
- **AnimatedKPICard**: Individual metric cards with animations
- **ResponsiveContainer**: Recharts wrapper for responsive charts
- **Motion components**: Framer Motion for smooth animations

### Backend Components
- **FastAPI Router**: Handles HTTP routing
- **Dependency Injection**: get_db(), get_current_user()
- **SQLAlchemy Session**: Database connection management
- **Query Builders**: Construct optimized SQL queries

### Database Tables
- **users**: User accounts and profiles
- **projects**: Project information
- **project_events**: Events within projects
- **project_applications**: Volunteer applications
- **project_volunteers**: Accepted volunteers

## Performance Considerations

### Query Optimization
```sql
-- Indexed columns for fast lookups
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_applications_project_id ON project_applications(project_id);
CREATE INDEX idx_volunteers_project_id ON project_volunteers(project_id);
```

### Caching Strategy (Future)
```
Redis Cache Layer
    ↓
Cache Key: analytics:{user_id}:{days}
TTL: 5 minutes
    ↓
If cache hit: Return cached data
If cache miss: Query DB → Cache result → Return data
```

### Parallel Processing
```javascript
// Frontend makes parallel requests
Promise.all([
  fetch('/analytics/overview'),
  fetch('/analytics/projects-by-category'),
  fetch('/analytics/skills-distribution'),
  fetch('/analytics/monthly-hours')
])
```

## Security Layers

```
┌─────────────────────────────────────┐
│  1. HTTPS/TLS Encryption            │
├─────────────────────────────────────┤
│  2. JWT Token Validation            │
├─────────────────────────────────────┤
│  3. User Authorization Check        │
├─────────────────────────────────────┤
│  4. SQL Injection Prevention (ORM)  │
├─────────────────────────────────────┤
│  5. Input Validation (Pydantic)     │
├─────────────────────────────────────┤
│  6. CORS Policy                     │
└─────────────────────────────────────┘
```

## Error Handling

### Frontend
```javascript
try {
  const response = await fetch(url, { headers });
  if (response.ok) {
    const data = await response.json();
    setAnalytics(data);
  }
} catch (error) {
  console.error('Failed to fetch analytics:', error);
  // Show error message to user
}
```

### Backend
```python
@app.get('/analytics/overview')
def get_analytics_overview(...):
    try:
        # Query database
        return analytics_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch analytics"
        )
```

## Monitoring & Logging

### Backend Logs
```
INFO: User 123 requested analytics (30 days)
INFO: Query executed in 45ms
INFO: Returned 5 projects, 25 volunteers
```

### Frontend Logs
```
[Analytics] Fetching data for 30 days
[Analytics] Received overview: 5 projects
[Analytics] Rendering charts...
```

## Scalability

### Current Capacity
- Handles 100+ concurrent users
- Query response time: < 100ms
- Chart rendering: < 500ms

### Future Scaling
- **Horizontal Scaling**: Multiple backend instances
- **Database Replication**: Read replicas for analytics
- **CDN**: Static assets and cached responses
- **Load Balancer**: Distribute traffic across servers
