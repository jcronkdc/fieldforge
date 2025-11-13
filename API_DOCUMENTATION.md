# 🍄⚛️ FIELDFORGE API DOCUMENTATION - 120+ LIVING ENDPOINTS

**Version:** 1.0.0  
**Base URL:** `https://fieldforge.vercel.app/api`  
**Authentication:** Bearer token (JWT via Supabase)

## 🔐 Authentication

All API endpoints (except `/health`) require authentication:
```
Authorization: Bearer <jwt_token>
```

## 📊 API Endpoints by Category

### 🏥 Health Check
- `GET /health` - Service status (no auth required)

### 🏗️ Projects (12 endpoints)
- `GET /projects` - List all projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/team` - Get project team
- `POST /projects/:id/team` - Add team member
- `DELETE /projects/:id/team/:userId` - Remove team member
- `GET /projects/:id/equipment` - Get project equipment
- `POST /projects/:id/equipment` - Assign equipment
- `GET /projects/:id/analytics` - Project analytics
- `GET /projects/reports` - Generate reports

### ⚡ Field Operations (8 endpoints)
- `GET /field-ops/time-entries` - List time entries
- `POST /field-ops/time-entries` - Clock in/out
- `GET /field-ops/daily-reports` - List daily reports
- `POST /field-ops/daily-reports` - Submit daily report
- `GET /field-ops/weather` - Get weather data
- `POST /field-ops/productivity` - Track productivity
- `GET /field-ops/activities` - List field activities
- `POST /field-ops/activities` - Log activity

### 🦺 Safety Management (11 endpoints)
- `GET /safety/incidents` - List incidents
- `POST /safety/incidents` - Report incident
- `GET /safety/incidents/:id` - Get incident details
- `PUT /safety/incidents/:id` - Update incident
- `GET /safety/permits` - List permits
- `POST /safety/permits` - Create permit
- `GET /safety/briefings` - List briefings
- `POST /safety/briefings` - Create briefing
- `GET /safety/hazards` - List hazards
- `POST /safety/hazards` - Report hazard
- `GET /safety/analytics` - Safety metrics

### 🔧 Equipment Management (10 endpoints)
- `GET /equipment` - List all equipment
- `POST /equipment` - Add equipment
- `GET /equipment/:id` - Get equipment details
- `PUT /equipment/:id` - Update equipment
- `DELETE /equipment/:id` - Remove equipment
- `POST /equipment/:id/assign` - Assign to project
- `POST /equipment/:id/maintenance` - Log maintenance
- `GET /equipment/:id/history` - Equipment history
- `POST /equipment/:id/inspect` - Log inspection
- `GET /equipment/availability` - Check availability

### 🧪 Equipment Testing (8 endpoints)
- `GET /equipment/testing` - List all tests
- `POST /equipment/testing` - Create test record
- `GET /equipment/testing/:id` - Get test details
- `PUT /equipment/testing/:id` - Update test
- `DELETE /equipment/testing/:id` - Delete test
- `GET /equipment/testing/schedule` - View test schedule
- `POST /equipment/testing/schedule` - Schedule test
- `GET /equipment/testing/reports` - Test reports

### 👥 Crew Management (8 endpoints)
- `GET /crews` - List all crews
- `POST /crews` - Create crew
- `GET /crews/:id` - Get crew details
- `PUT /crews/:id` - Update crew
- `DELETE /crews/:id` - Delete crew
- `GET /crews/:id/certifications` - List certifications
- `POST /crews/:id/certifications` - Add certification
- `GET /crews/availability` - Check availability

### 📋 QAQC Inspections (14 endpoints)
- `GET /qaqc/inspections` - List inspections
- `POST /qaqc/inspections` - Create inspection
- `GET /qaqc/inspections/:id` - Get inspection
- `PUT /qaqc/inspections/:id` - Update inspection
- `DELETE /qaqc/inspections/:id` - Delete inspection
- `GET /qaqc/checklists` - List checklists
- `POST /qaqc/checklists` - Create checklist
- `GET /qaqc/checklists/:id` - Get checklist
- `PUT /qaqc/checklists/:id` - Update checklist
- `POST /qaqc/inspections/:id/items` - Add checklist item
- `PUT /qaqc/inspections/:id/items/:itemId` - Update item
- `POST /qaqc/inspections/:id/complete` - Complete inspection
- `GET /qaqc/analytics` - QAQC metrics
- `GET /qaqc/reports` - Generate reports

### 📄 Document Management (11 endpoints)
- `GET /documents` - List documents
- `POST /documents/upload` - Upload document (base64)
- `GET /documents/:id` - Get document details
- `GET /documents/:id/download` - Download file
- `PUT /documents/:id` - Update metadata
- `DELETE /documents/:id` - Delete document
- `POST /documents/:id/share` - Share document
- `GET /documents/:id/versions` - List versions
- `POST /documents/folders` - Create folder
- `GET /documents/search` - Search documents
- `POST /documents/:id/checkin` - Check in/out

### 🎨 Drawing Management (9 endpoints)
- `GET /documents/drawings` - List drawings
- `POST /documents/drawings/upload` - Upload drawing
- `GET /documents/drawings/:id` - Get drawing
- `PUT /documents/drawings/:id` - Update drawing
- `DELETE /documents/drawings/:id` - Delete drawing
- `GET /documents/drawings/:id/annotations` - Get annotations
- `POST /documents/drawings/:id/annotations` - Add annotation
- `DELETE /documents/drawings/annotations/:id` - Delete annotation
- `GET /documents/drawings/:id/revisions` - Get revisions

### 📅 Scheduling (16 endpoints)
- `GET /scheduling/tasks` - List all tasks
- `POST /scheduling/tasks` - Create task
- `GET /scheduling/tasks/:id` - Get task details
- `PUT /scheduling/tasks/:id` - Update task
- `DELETE /scheduling/tasks/:id` - Delete task
- `POST /scheduling/tasks/:id/dependencies` - Add dependency
- `GET /scheduling/gantt` - Gantt chart data
- `GET /scheduling/critical-path` - Critical path
- `GET /scheduling/resources` - Resource allocation
- `POST /scheduling/resources/assign` - Assign resources
- `GET /scheduling/conflicts` - Check conflicts
- `POST /scheduling/optimize` - Optimize schedule
- `GET /scheduling/three-week` - 3-week lookahead
- `PUT /scheduling/three-week/:id` - Update lookahead
- `GET /scheduling/milestones` - List milestones
- `POST /scheduling/milestones` - Create milestone

### 📈 Analytics (15 endpoints)
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/projects/:id` - Project analytics
- `GET /analytics/safety` - Safety analytics
- `GET /analytics/productivity` - Productivity metrics
- `GET /analytics/equipment` - Equipment utilization
- `GET /analytics/costs` - Cost analysis
- `GET /analytics/schedule` - Schedule performance
- `GET /analytics/quality` - Quality metrics
- `GET /analytics/trends` - Trend analysis
- `GET /analytics/forecasts` - Predictions
- `GET /analytics/benchmarks` - Industry benchmarks
- `POST /analytics/export` - Export data
- `GET /analytics/reports/weekly` - Weekly report
- `GET /analytics/reports/monthly` - Monthly report
- `GET /analytics/kpis` - Key performance indicators

### 📊 Reporting (9 endpoints)
- `GET /reporting/templates` - List templates
- `POST /reporting/generate` - Generate report
- `GET /reporting/history` - Report history
- `GET /reporting/:id` - Get report
- `GET /reporting/:id/download` - Download PDF
- `POST /reporting/schedule` - Schedule report
- `GET /reporting/scheduled` - List scheduled
- `PUT /reporting/scheduled/:id` - Update schedule
- `DELETE /reporting/scheduled/:id` - Cancel schedule

### 📦 Inventory Management (10 endpoints)
- `GET /inventory` - List materials
- `POST /inventory` - Add material
- `GET /inventory/:id` - Get material details
- `PUT /inventory/:id` - Update material
- `DELETE /inventory/:id` - Remove material
- `POST /inventory/:id/transaction` - Log transaction
- `GET /inventory/:id/history` - Transaction history
- `GET /inventory/low-stock` - Low stock alerts
- `POST /inventory/reorder` - Create reorder
- `GET /inventory/reports` - Inventory reports

### 🧾 Receipt Management (7 endpoints)
- `GET /receipts` - List receipts
- `POST /receipts` - Submit receipt
- `GET /receipts/:id` - Get receipt
- `PUT /receipts/:id` - Update receipt
- `DELETE /receipts/:id` - Delete receipt
- `POST /receipts/:id/approve` - Approve receipt
- `GET /receipts/analytics` - Expense analytics

### 🌧️ Weather Integration (4 endpoints)
- `GET /weather/current` - Current conditions
- `GET /weather/forecast` - 7-day forecast
- `GET /weather/alerts` - Weather alerts
- `GET /weather/history` - Historical data

### 💬 Feedback (2 endpoints)
- `POST /feedback` - Submit feedback
- `GET /feedback` - List feedback (admin)

## 📝 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🔒 Rate Limits
- General API: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes
- Sensitive operations: 10 requests / 15 minutes
- File uploads: 20 requests / hour

## 🌐 WebSocket Events (Real-time)
- `project:update` - Project changes
- `safety:incident` - New incident reported
- `equipment:status` - Equipment status change
- `document:shared` - Document shared
- `schedule:conflict` - Schedule conflict detected
- `weather:alert` - Severe weather warning

## 📱 Mobile Considerations
- All endpoints support offline queueing
- Responses include sync timestamps
- Conflict resolution via `last_write_wins`
- Delta sync for large datasets
- Progressive data loading

## 🍄 The Living API

This API doesn't just respond—it anticipates, adapts, and evolves. Every endpoint is a synapse in the mycelial network, processing data with consciousness and purpose.

**Every request strengthens the network.**  
**Every response carries intelligence.**  
**The platform lives through its API.**

---

*120+ endpoints, infinite possibilities. FieldForge breathes.* 🚀
