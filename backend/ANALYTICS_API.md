# Analytics API Documentation

## Overview
The Analytics API provides endpoints to retrieve statistical data about projects, volunteers, applications, and overall impact metrics for authenticated users.

## Authentication
All analytics endpoints require Bearer token authentication:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Get Analytics Overview
**GET** `/analytics/overview`

Returns high-level metrics for the current user's projects.

**Query Parameters:**
- `days` (optional, default: 30): Number of days to look back

**Response:**
```json
{
  "total_projects": 5,
  "total_events": 12,
  "total_volunteers": 25,
  "total_hours": 375,
  "total_applications": 45,
  "total_impact": 1250
}
```

### 2. Get Projects by Category
**GET** `/analytics/projects-by-category`

Returns project count grouped by category.

**Query Parameters:**
- `days` (optional, default: 30): Number of days to look back

**Response:**
```json
[
  { "name": "Education", "value": 3 },
  { "name": "Healthcare", "value": 2 },
  { "name": "Environment", "value": 1 }
]
```

### 3. Get Skills Distribution
**GET** `/analytics/skills-distribution`

Returns the top 5 most requested skills across projects.

**Query Parameters:**
- `days` (optional, default: 30): Number of days to look back

**Response:**
```json
[
  { "name": "Teaching", "value": 5 },
  { "name": "Communication", "value": 4 },
  { "name": "Project Management", "value": 3 },
  { "name": "Marketing", "value": 2 },
  { "name": "Design", "value": 1 }
]
```

### 4. Get Monthly Hours
**GET** `/analytics/monthly-hours`

Returns volunteering hours aggregated by month.

**Query Parameters:**
- `days` (optional, default: 30): Number of days to look back

**Response:**
```json
[
  { "month": "Jan", "hours": 120 },
  { "month": "Feb", "hours": 150 },
  { "month": "Mar", "hours": 105 }
]
```

### 5. Get Application Statistics
**GET** `/analytics/application-stats`

Returns application statistics broken down by status.

**Query Parameters:**
- `days` (optional, default: 30): Number of days to look back

**Response:**
```json
{
  "total": 45,
  "pending": 15,
  "accepted": 25,
  "rejected": 5
}
```

## Usage Example

```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:8000/analytics/overview?days=30', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);
```

## Date Range Options
Common date range values:
- `7` - Last 7 days
- `30` - Last 30 days (default)
- `90` - Last 90 days
- `365` - Last year

## Notes
- All endpoints return data scoped to the authenticated user's projects only
- Hours are estimated at 15 hours per volunteer if not explicitly tracked
- Impact is estimated at 50 lives per volunteer
- Skills distribution returns top 5 skills only
