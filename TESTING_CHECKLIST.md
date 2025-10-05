# Testing Checklist

## Pre-Testing Setup
- [ ] Backend server is running on `http://localhost:8000`
- [ ] Frontend server is running on `http://localhost:3000`
- [ ] Database is initialized and accessible
- [ ] Environment variables are set correctly

---

## 1. Volunteer Application Flow (Simplified)

### Test Case 1.1: View Project Details
- [ ] Navigate to Dashboard → Search
- [ ] Click on any project card
- [ ] Modal opens with project details
- [ ] "Apply to Volunteer" button is visible

### Test Case 1.2: Apply to Project (New Flow)
- [ ] Click "Apply to Volunteer" button
- [ ] **Confirmation modal appears** (not form)
- [ ] Modal shows: "Do you want to apply for [Project Name]?"
- [ ] Two buttons visible: "Cancel" and "Yes, Apply"
- [ ] No input fields for name, email, phone, or message

### Test Case 1.3: Confirm Application
- [ ] Click "Yes, Apply" button
- [ ] Modal closes immediately
- [ ] Success message appears: "Your application has been sent successfully!"
- [ ] Application is created in database with user's profile data

### Test Case 1.4: Cancel Application
- [ ] Click "Apply to Volunteer" again on another project
- [ ] Click "Cancel" button
- [ ] Modal closes without submitting
- [ ] No application is created

### Test Case 1.5: Duplicate Application Prevention
- [ ] Try to apply to the same project twice
- [ ] Should show error: "You have already applied to this project"

---

## 2. Analytics Backend Endpoints

### Test Case 2.1: Analytics Overview
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/analytics/overview?days=30"
```
- [ ] Returns 200 OK status
- [ ] Response includes: `total_projects`, `total_events`, `total_volunteers`, `total_hours`, `total_applications`, `total_impact`
- [ ] All values are numbers
- [ ] Values match expected data

### Test Case 2.2: Projects by Category
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/analytics/projects-by-category?days=30"
```
- [ ] Returns 200 OK status
- [ ] Response is array of objects with `name` and `value`
- [ ] Categories match created projects
- [ ] Counts are accurate

### Test Case 2.3: Skills Distribution
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/analytics/skills-distribution?days=30"
```
- [ ] Returns 200 OK status
- [ ] Response is array of objects with `name` and `value`
- [ ] Maximum 5 skills returned
- [ ] Skills are sorted by frequency (descending)

### Test Case 2.4: Monthly Hours
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/analytics/monthly-hours?days=30"
```
- [ ] Returns 200 OK status
- [ ] Response is array of objects with `month` and `hours`
- [ ] Months are abbreviated (Jan, Feb, etc.)
- [ ] Hours are calculated correctly

### Test Case 2.5: Application Stats
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/analytics/application-stats?days=30"
```
- [ ] Returns 200 OK status
- [ ] Response includes: `total`, `pending`, `accepted`, `rejected`
- [ ] Sum of statuses equals total
- [ ] Counts match database

### Test Case 2.6: Date Range Filtering
Test with different date ranges:
- [ ] `days=7` - Returns last 7 days data
- [ ] `days=30` - Returns last 30 days data
- [ ] `days=90` - Returns last 90 days data
- [ ] `days=365` - Returns last year data

### Test Case 2.7: Authentication
- [ ] Request without token returns 401 Unauthorized
- [ ] Request with invalid token returns 401 Unauthorized
- [ ] Request with expired token returns 401 Unauthorized
- [ ] Request with valid token returns 200 OK

### Test Case 2.8: Authorization
- [ ] User A can only see their own project analytics
- [ ] User A cannot see User B's project analytics
- [ ] Empty projects return zero values (not errors)

---

## 3. Analytics Frontend Integration

### Test Case 3.1: Page Load
- [ ] Navigate to Dashboard → Analytics
- [ ] Loading spinner appears initially
- [ ] Page loads without errors
- [ ] All charts render correctly

### Test Case 3.2: KPI Cards
- [ ] 5 KPI cards are visible
- [ ] Cards show: Projects, Events, Hours, Volunteers, Impact
- [ ] Numbers are formatted correctly
- [ ] Cards have gradient backgrounds
- [ ] Hover animation works

### Test Case 3.3: Bar Chart (Projects by Category)
- [ ] Chart title: "Projects by Category"
- [ ] X-axis shows category names
- [ ] Y-axis shows counts
- [ ] Bars have gradient color
- [ ] Tooltip shows on hover
- [ ] Empty state shows "No data available" if no projects

### Test Case 3.4: Donut Chart (Skills Distribution)
- [ ] Chart title: "Most Popular Skill Categories"
- [ ] Shows top 5 skills
- [ ] Each segment has different color
- [ ] Labels show skill names
- [ ] Tooltip shows count on hover
- [ ] Empty state shows "No data available" if no skills

### Test Case 3.5: Line Chart (Monthly Hours)
- [ ] Chart title: "Volunteering Hours by Month"
- [ ] X-axis shows months
- [ ] Y-axis shows hours
- [ ] Line is smooth and pink
- [ ] Data points are visible
- [ ] Tooltip shows on hover
- [ ] Empty state shows "No data available" if no data

### Test Case 3.6: Impact Summary Card
- [ ] Gradient background (pink to red)
- [ ] Shows 4 metrics: Projects, Volunteers, Hours, Lives Impacted
- [ ] Numbers are large and bold
- [ ] Card has sparkle icons
- [ ] Only shows if user has projects

### Test Case 3.7: Date Range Filter
- [ ] 4 buttons visible: 7d, 30d, 90d, 365d
- [ ] Default selection is 30d
- [ ] Clicking button updates data
- [ ] Active button has gradient background
- [ ] Inactive buttons are gray
- [ ] Data refreshes on selection

### Test Case 3.8: Export Functionality
- [ ] "Export" button is visible
- [ ] Clicking opens export options
- [ ] CSV export downloads file
- [ ] CSV contains correct data
- [ ] Filename includes date range

### Test Case 3.9: Responsive Design
- [ ] Page looks good on desktop (1920x1080)
- [ ] Page looks good on tablet (768x1024)
- [ ] Page looks good on mobile (375x667)
- [ ] Charts resize appropriately
- [ ] No horizontal scrolling

### Test Case 3.10: Error Handling
- [ ] If backend is down, shows error gracefully
- [ ] If no data, shows empty states
- [ ] If API returns error, logs to console
- [ ] Page doesn't crash on errors

---

## 4. Integration Tests

### Test Case 4.1: End-to-End Flow
1. [ ] Create a new user account
2. [ ] Login with credentials
3. [ ] Create 3 projects in different categories
4. [ ] Add events to projects
5. [ ] Apply to own projects (should fail - can't apply to own projects)
6. [ ] Create second user account
7. [ ] Login as second user
8. [ ] Apply to first user's projects using simplified flow
9. [ ] Login back as first user
10. [ ] Accept some applications
11. [ ] Navigate to Analytics
12. [ ] Verify all data is correct

### Test Case 4.2: Data Consistency
- [ ] Create project → Check analytics shows +1 project
- [ ] Accept application → Check analytics shows +1 volunteer
- [ ] Add event → Check analytics shows +1 event
- [ ] Change date range → Data updates correctly

### Test Case 4.3: Performance
- [ ] Analytics page loads in < 2 seconds
- [ ] API responses return in < 500ms
- [ ] Charts render in < 1 second
- [ ] No memory leaks on repeated navigation

---

## 5. Edge Cases

### Test Case 5.1: Empty States
- [ ] New user with no projects sees zeros
- [ ] User with projects but no volunteers sees correct data
- [ ] User with projects but no applications sees correct data

### Test Case 5.2: Large Datasets
- [ ] Create 50+ projects
- [ ] Accept 100+ applications
- [ ] Analytics still loads quickly
- [ ] Charts render correctly

### Test Case 5.3: Special Characters
- [ ] Project with special characters in title
- [ ] Category with unicode characters
- [ ] Skills with spaces and hyphens

### Test Case 5.4: Date Boundaries
- [ ] Projects created exactly 30 days ago
- [ ] Projects created 31 days ago (should not appear in 30d filter)
- [ ] Future-dated projects

---

## 6. Security Tests

### Test Case 6.1: Authentication
- [ ] Cannot access analytics without login
- [ ] Token expires after configured time
- [ ] Logout clears token

### Test Case 6.2: Authorization
- [ ] User cannot see other users' analytics
- [ ] User cannot modify other users' data
- [ ] Admin privileges work correctly (if implemented)

### Test Case 6.3: Input Validation
- [ ] Invalid date range (e.g., -1) is rejected
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized

---

## 7. Browser Compatibility

### Test Case 7.1: Chrome
- [ ] All features work
- [ ] Charts render correctly
- [ ] Animations are smooth

### Test Case 7.2: Firefox
- [ ] All features work
- [ ] Charts render correctly
- [ ] Animations are smooth

### Test Case 7.3: Safari
- [ ] All features work
- [ ] Charts render correctly
- [ ] Animations are smooth

### Test Case 7.4: Edge
- [ ] All features work
- [ ] Charts render correctly
- [ ] Animations are smooth

---

## 8. Accessibility

### Test Case 8.1: Keyboard Navigation
- [ ] Can navigate with Tab key
- [ ] Can activate buttons with Enter/Space
- [ ] Focus indicators are visible

### Test Case 8.2: Screen Readers
- [ ] Charts have proper ARIA labels
- [ ] Buttons have descriptive labels
- [ ] Error messages are announced

### Test Case 8.3: Color Contrast
- [ ] Text is readable on all backgrounds
- [ ] Charts have sufficient contrast
- [ ] Focus indicators are visible

---

## Test Results Summary

### Volunteer Application Flow
- Total Tests: ___
- Passed: ___
- Failed: ___
- Notes: ___

### Analytics Backend
- Total Tests: ___
- Passed: ___
- Failed: ___
- Notes: ___

### Analytics Frontend
- Total Tests: ___
- Passed: ___
- Failed: ___
- Notes: ___

### Integration Tests
- Total Tests: ___
- Passed: ___
- Failed: ___
- Notes: ___

### Overall Status
- [ ] All critical tests passed
- [ ] Ready for production
- [ ] Issues to address: ___

---

## Sign-off

Tested by: _______________
Date: _______________
Version: _______________
Environment: _______________

Notes:
_______________________________________________
_______________________________________________
_______________________________________________
