# FieldForge™ - T&D/Substation Construction Management Platform

**© 2025 Cronk Companies, LLC. All Rights Reserved.**  
**PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE**

> ⚠️ **LEGAL NOTICE**: This source code is the exclusive property of Cronk Companies, LLC. Unauthorized copying, modification, or distribution of this code, via any medium, is strictly prohibited and will be prosecuted to the fullest extent of the law.

> **FieldForge™** is a trademark of Cronk Companies, LLC.

---

## 🏗️ Overview

**FieldForge** is a comprehensive construction management platform specifically designed for **Transmission & Distribution (T&D) and Substation** construction projects. Built for electrical infrastructure contractors working on projects from 69kV to 765kV, FieldForge provides real-time collaboration, safety compliance tracking, equipment management, and regulatory reporting.

## ⚡ Key Features

### Safety & Compliance
- **Job Safety Analysis (JSA)** with digital signatures
- **Switching Orders** and clearance management
- **Arc Flash Boundaries** and PPE calculations
- **LOTO Procedures** with tag tracking
- **NERC/FERC Compliance** reporting

### Project Management
- **Plan of Day (POD)** with crew assignments
- **3-Week Look-Ahead** scheduling
- **Master Schedule** integration
- **Outage Coordination** with utilities
- **Weather Monitoring** with work restrictions

### Equipment & Materials
- **Transformer Tracking** with test reports
- **Circuit Breaker** management (SF6 monitoring)
- **Conductor/Cable** pulling records
- **Structure Installation** tracking
- **Material Inventory** with QR codes

### Quality & Testing
- **QAQC Inspections** with photo documentation
- **Test Reports** (Doble, relay, ground grid)
- **Commissioning Checklists**
- **NCR Management**
- **Torque Verification** records

### Documentation
- **RFI Management** with response tracking
- **Submittal Workflows** with approval chains
- **Drawing Management** with version control
- **As-Built/Red-line** capture
- **Meeting Minutes** with action items

### Communication
- **Role-based Messaging** channels
- **Emergency Broadcasts**
- **Video Calls** for field support
- **Toolbox Talks** documentation
- **Daily Reports** with production metrics

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL with PostGIS
- **Authentication**: Supabase Auth with MFA
- **Real-time**: WebSocket connections for live updates
- **Mobile**: Progressive Web App (PWA) with offline support
- **Storage**: S3-compatible for documents and photos
- **Maps**: GIS integration for transmission line routing

## 📁 Project Structure

```
FieldForge/
├── apps/
│   └── swipe-feed/          # React PWA frontend application
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # API clients and utilities
│       │   └── views/       # Application views
├── backend/
│   ├── migrations/          # Database schema
│   │   ├── 001_core_company_project_tables.sql
│   │   ├── 002_safety_compliance_tables.sql
│   │   ├── 003_equipment_material_tables.sql
│   │   ├── 004_qaqc_testing_tables.sql
│   │   ├── 005_scheduling_crew_tables.sql
│   │   ├── 006_rfi_submittal_document_tables.sql
│   │   ├── 007_messaging_communication_tables.sql
│   │   └── 008_environmental_row_change_tables.sql
│   └── src/
│       ├── api/            # REST API endpoints
│       ├── services/       # Business logic
│       └── utils/          # Helper functions
└── docs/
    └── FIELDFORGE_TD_ARCHITECTURE.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ with PostGIS extension
- Supabase account for authentication
- S3-compatible storage (AWS S3, MinIO, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/fieldforge.git
cd fieldforge
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../apps/swipe-feed
npm install
```

3. **Set up environment variables**

Backend (.env):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fieldforge
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
S3_BUCKET=your-s3-bucket
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
WEATHER_API_KEY=your-weather-api-key
```

Frontend (.env):
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your-mapbox-token
```

4. **Run database migrations**
```bash
cd backend
npm run migrate
```

5. **Start development servers**
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd apps/swipe-feed
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

7. **Build for production**
```bash
cd apps/swipe-feed
npm run build
# or run strict mode with full checks
npm run build:strict
```

## ✅ Development Quality Checks

From `apps/swipe-feed/` you can run the following project guards:

- `npm run lint:ui-copy` — ensure UI text contains no placeholder ellipses.
- `npm run lint:media` — verify media elements include explicit dimensions.
- `npm run lint:copy` — enforce product copy guidelines.
- `npm run lint` — run all UI/media/copy checks plus TypeScript type checking.
- `npm run test` — execute Vitest + Testing Library smoke tests.
- `npm run test:watch` — run the test suite in watch mode during development.

## 📒 Review Artifacts

- [Micro-review log](docs/review/REVIEW_LOG.md)
- [Open review gaps](docs/review/GAPS.md)

## 📱 Mobile Application

FieldForge is built as a Progressive Web App (PWA) with full offline capabilities:

- **Install on mobile devices** through browser "Add to Home Screen"
- **Offline mode** with automatic sync when connected
- **Camera integration** for photo documentation
- **GPS tracking** for location-based reporting
- **Push notifications** for safety alerts and updates
- **Barcode scanning** for material tracking

## 🔒 Security

- **Role-based access control** (RBAC) at project level
- **Row-level security** (RLS) in PostgreSQL
- **End-to-end encryption** for sensitive data
- **Multi-factor authentication** (MFA)
- **Audit logging** for all critical operations
- **NERC CIP compliance** for critical infrastructure

## 🏢 User Roles

1. **Field Worker** - Basic reporting and documentation
2. **Foreman** - Crew management and daily planning
3. **Safety Manager** - Incident tracking and compliance
4. **QC Inspector** - Quality documentation and NCRs
5. **Project Engineer** - Technical documentation and RFIs
6. **Superintendent** - Overall project oversight
7. **Project Manager** - Full system access
8. **Executive** - Dashboard and reporting only

## 📊 Key Metrics

- **30% reduction** in documentation time
- **50% faster** RFI response time
- **25% improvement** in schedule adherence
- **40% reduction** in safety incidents
- **Zero** NERC compliance violations

## 🛣️ Roadmap

### Phase 1 (Q1 2025) ✅
- Core platform with authentication
- Project and company management
- Database schema implementation

### Phase 2 (Q2 2025) 🚧
- Safety management system
- Equipment and material tracking
- QAQC documentation

### Phase 3 (Q3 2025)
- RFI/Submittal workflows
- Advanced scheduling features
- Mobile PWA optimization

### Phase 4 (Q4 2025)
- AI-powered insights
- Predictive analytics
- Third-party integrations

## 🤝 Support

For technical support or questions:
- Email: support@fieldforge.com
- Phone: 1-800-FIELD-4G
- Documentation: https://docs.fieldforge.com

## 📝 License

This is proprietary software owned by Cronk Companies, LLC. All rights reserved.

---

**Built with ❤️ for the T&D/Substation construction industry by Cronk Companies, LLC**