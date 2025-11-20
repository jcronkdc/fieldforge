/**
 * AI Navigation & Site Intelligence System
 * Gives AI god-level knowledge of the entire FieldForge platform
 * 
 * The AI can:
 * - Navigate to any route in the app
 * - Understand all features and their purposes
 * - Guide users through workflows
 * - Execute operations on behalf of users
 * - Provide expert-level support
 */

export interface SiteRoute {
  path: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  accessLevel: 'public' | 'authenticated' | 'admin';
  relatedRoutes?: string[];
  commonTasks?: string[];
  integrations?: string[];
}

export interface AIInstruction {
  feature: string;
  steps: string[];
  tips: string[];
  commonIssues?: string[];
  videoUrl?: string;
}

/**
 * COMPLETE SITE MAP with detailed feature information
 * This is the AI's brain - it knows EVERYTHING about the platform
 */
export const SITE_ROUTES: SiteRoute[] = [
  // ========== DASHBOARD & HOME ==========
  {
    path: '/dashboard',
    name: 'Dashboard',
    category: 'Core',
    description: 'Main command center with real-time project overview, collaboration hub, active projects, recent feed activity, and quick access to all features',
    features: [
      'Real-time project status overview',
      'Collaboration hub with video/chat integration',
      'Active projects list with budget/schedule tracking',
      'Recent feed activity from your team',
      'Quick action buttons for common tasks',
      'Getting started checklist',
      'Project health indicators',
      'Team notifications',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/projects', '/feed', '/analytics', '/safety'],
    commonTasks: [
      'Check project status',
      'Start collaboration session',
      'View recent team updates',
      'Navigate to specific project',
      'Monitor budget and schedule',
    ],
    integrations: ['Daily.co video', 'Ably real-time', 'Stripe payments'],
  },

  // ========== PROJECT MANAGEMENT ==========
  {
    path: '/projects',
    name: 'Project Manager',
    category: 'Project Management',
    description: 'Complete project lifecycle management - create projects, manage teams, track budgets, schedules, milestones, and collaborate with video/chat',
    features: [
      'Create and archive projects',
      'Team management with role assignments (Admin, Manager, Supervisor, Worker, Viewer)',
      'Budget tracking and variance analysis',
      'Schedule management and milestones',
      'Project collaboration hub with Daily.co video rooms',
      'Team messaging with Ably real-time',
      'Document management',
      'Cost code tracking',
      'Project health dashboard',
      'Client management',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/schedule', '/schedule/overview', '/schedule/lookahead', '/documents', '/collaboration'],
    commonTasks: [
      'Create new project',
      'Add team members',
      'Track budget vs actual',
      'Start video collaboration',
      'View project timeline',
      'Upload project documents',
      'Monitor milestones',
    ],
    integrations: ['Daily.co', 'Ably', 'Supabase', 'Stripe'],
  },

  {
    path: '/schedule',
    name: '3-Week Lookahead',
    category: 'Scheduling',
    description: 'Rolling 3-week schedule planning with constraint resolution, crew assignments, resource planning, and team coordination via video calls',
    features: [
      'Rolling 3-week schedule view',
      'Constraint identification and resolution',
      'Resource allocation and leveling',
      'Crew assignment planning',
      'Critical path analysis',
      'Planning Call video collaboration',
      'Weather impact considerations',
      'Material delivery tracking',
      'Dependency management',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/schedule/overview', '/projects', '/weather', '/field/crews'],
    commonTasks: [
      'Plan next 3 weeks',
      'Resolve scheduling conflicts',
      'Assign crews to tasks',
      'Start planning call',
      'Coordinate resources',
    ],
    integrations: ['Daily.co planning rooms', 'Weather API', 'Project database'],
  },

  {
    path: '/schedule/overview',
    name: 'Project Schedule',
    category: 'Scheduling',
    description: 'Gantt-chart style project schedule with resource management, critical path, and dependencies',
    features: [
      'Gantt chart visualization',
      'Critical path analysis',
      'Task dependencies',
      'Resource allocation',
      'Progress tracking',
      'Milestone management',
      'Schedule baseline comparison',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/schedule', '/projects', '/analytics'],
    commonTasks: [
      'View project timeline',
      'Track critical path',
      'Update task progress',
      'Manage dependencies',
    ],
  },

  // ========== SAFETY MANAGEMENT ==========
  {
    path: '/safety',
    name: 'Safety Hub',
    category: 'Safety',
    description: 'Comprehensive safety management - incidents, permits, JSAs, toolbox talks, inspections, team safety calls, and compliance tracking',
    features: [
      'Incident reporting and tracking',
      'Digital safety permits (Hot Work, Confined Space, Energized Work, Elevated Work)',
      'JSA (Job Safety Analysis) creation',
      'Toolbox talk library and sign-in',
      'Safety inspection checklists',
      'Team safety video calls',
      'Near-miss reporting',
      'OSHA compliance tracking',
      'Safety statistics dashboard',
      'Emergency alert system integration',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/emergency', '/projects', '/field'],
    commonTasks: [
      'Report safety incident',
      'Create work permit',
      'Conduct JSA',
      'Host safety briefing call',
      'Review safety statistics',
      'Submit near-miss report',
    ],
    integrations: ['Daily.co safety calls', 'Emergency alerts', 'Document storage'],
  },

  // ========== QUALITY CONTROL ==========
  {
    path: '/qaqc',
    name: 'QA/QC Hub',
    category: 'Quality',
    description: 'Quality assurance and quality control - inspections, checklists, deficiency tracking, video inspection calls, and compliance',
    features: [
      'Inspection creation and management',
      'Digital checklists with photo evidence',
      'Deficiency tracking and resolution',
      'Video inspection calls with remote experts',
      'Punch list management',
      'Material testing logs',
      'Quality metrics dashboard',
      'Rework tracking',
      'Compliance verification',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/testing', '/projects', '/documents'],
    commonTasks: [
      'Create inspection',
      'Start video inspection call',
      'Track deficiencies',
      'Upload inspection photos',
      'Generate QA reports',
    ],
    integrations: ['Daily.co inspection rooms', 'Photo storage', 'PDF generation'],
  },

  // ========== EQUIPMENT MANAGEMENT ==========
  {
    path: '/equipment',
    name: 'Equipment Hub',
    category: 'Equipment',
    description: 'Equipment inventory, maintenance, QR code scanning, utilization tracking, video inspections, and service scheduling',
    features: [
      'Equipment inventory with QR codes',
      'Maintenance scheduling and tracking',
      'Equipment utilization reports',
      'Video inspection capability',
      'Service history logging',
      'Fuel and hours tracking',
      'Equipment assignment to projects',
      'Predictive maintenance alerts',
      'Asset depreciation tracking',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/equipment/inventory', '/equipment/maintenance', '/testing', '/field'],
    commonTasks: [
      'Scan QR code',
      'Log maintenance',
      'Start video inspection',
      'Check equipment status',
      'Schedule service',
    ],
    integrations: ['QR scanner', 'Daily.co video', 'Maintenance database'],
  },

  // ========== DOCUMENT MANAGEMENT ==========
  {
    path: '/documents',
    name: 'Document Hub',
    category: 'Documents',
    description: 'Centralized document management - upload, version control, CAD drawings, specifications, collaborative reviews, RFIs, submittals',
    features: [
      'Document upload and storage',
      'Version control',
      'CAD drawing viewer',
      'Collaborative document review calls',
      'Specification management',
      'RFI (Request for Information) tracking',
      'Submittal management',
      'Document search and filtering',
      'Access control and permissions',
      'Drawing comparison tools',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/documents/drawings', '/submittals', '/projects'],
    commonTasks: [
      'Upload document',
      'View CAD drawing',
      'Start review call',
      'Create RFI',
      'Track submittals',
      'Compare drawing versions',
    ],
    integrations: ['Daily.co drawing reviews', 'Cloud storage', 'PDF viewer', 'CAD viewer'],
  },

  {
    path: '/documents/drawings',
    name: 'Drawing Viewer',
    category: 'Documents',
    description: 'Advanced CAD/PDF drawing viewer with collaborative cursor control, markup tools, side-by-side collaboration, and real-time annotations',
    features: [
      'CAD and PDF drawing viewing',
      'Collaborative cursor control (see team members cursors)',
      'Side-by-side collaboration mode',
      'Markup and annotation tools',
      'Drawing comparison',
      'Measurement tools',
      'Layer control',
      'Real-time collaboration',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/documents', '/projects', '/collaboration'],
    commonTasks: [
      'View drawing',
      'Start collaboration session',
      'Add markup',
      'Compare revisions',
      'Share cursor control',
    ],
    integrations: ['Daily.co', 'Ably cursor sync', 'CAD parser', 'PDF.js'],
  },

  // ========== FIELD OPERATIONS ==========
  {
    path: '/field',
    name: 'Daily Operations',
    category: 'Field Operations',
    description: 'Daily field reporting, activity tracking, productivity monitoring, weather impacts, crew coordination, and field team video calls',
    features: [
      'Daily activity reports',
      'Work hour logging',
      'Productivity tracking',
      'Weather impact documentation',
      'Material usage tracking',
      'Equipment utilization',
      'Field team video calls',
      'Photo documentation',
      'Daily safety briefings',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/field/crews', '/field/time', '/weather', '/receipts'],
    commonTasks: [
      'Submit daily report',
      'Log work hours',
      'Start field call',
      'Track productivity',
      'Document weather delays',
    ],
    integrations: ['Daily.co field calls', 'Weather API', 'Photo storage'],
  },

  {
    path: '/field/crews',
    name: 'Crew Management',
    category: 'Field Operations',
    description: 'Crew organization, skill tracking, certifications, assignments, availability, and crew coordination calls',
    features: [
      'Crew creation and organization',
      'Skill and certification tracking',
      'Crew assignments to projects',
      'Availability management',
      'Crew coordination video calls',
      'Performance metrics',
      'Training records',
      'License expiration tracking',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/field', '/field/time', '/schedule', '/safety'],
    commonTasks: [
      'Create crew',
      'Assign to project',
      'Track certifications',
      'Start crew call',
      'View availability',
    ],
    integrations: ['Daily.co crew calls', 'HR database', 'Training tracking'],
  },

  {
    path: '/field/time',
    name: 'Time Tracking',
    category: 'Field Operations',
    description: 'Time card management, cost code tracking, overtime monitoring, payroll integration, and timesheet approvals',
    features: [
      'Digital time cards',
      'Cost code allocation',
      'Overtime tracking',
      'Break compliance',
      'Timesheet approvals',
      'Payroll export',
      'Labor burden analysis',
      'Real-time timer',
      'Historical time reports',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/field', '/field/crews', '/analytics', '/receipts'],
    commonTasks: [
      'Clock in/out',
      'Assign cost codes',
      'Submit timesheet',
      'Approve hours',
      'Export to payroll',
    ],
    integrations: ['Payroll systems', 'Project cost tracking'],
  },

  // ========== FINANCIAL & RECEIPTS ==========
  {
    path: '/receipts',
    name: 'Receipt Manager',
    category: 'Financial',
    description: 'Receipt scanning, OCR processing, expense tracking, approval workflows, vendor management, and budget analysis via video calls',
    features: [
      'Receipt photo capture',
      'OCR text extraction',
      'Expense categorization',
      'Approval workflows',
      'Vendor management',
      'Budget tracking',
      'Approval call video sessions',
      'Receipt history',
      'Tax documentation',
      'Export to accounting',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/projects', '/analytics', '/field/time'],
    commonTasks: [
      'Scan receipt',
      'Submit for approval',
      'Start approval call',
      'Track expenses',
      'Export receipts',
    ],
    integrations: ['OCR engine', 'Daily.co approval calls', 'Accounting export'],
  },

  // ========== WEATHER & ENVIRONMENT ==========
  {
    path: '/weather',
    name: 'Weather Dashboard',
    category: 'Weather',
    description: 'Real-time weather, 14-day forecasts, construction workability scores, safety alerts, activity recommendations, and project location tracking',
    features: [
      'Real-time weather by location',
      '5/7/14-day forecasts',
      'Construction workability scoring (EXCELLENT/GOOD/FAIR/POOR/UNSAFE)',
      'Safety alerts (lightning, high wind, temperature extremes)',
      'Activity-specific recommendations (concrete, crane ops, heat stress)',
      'Project location auto-detection',
      'AI-powered weather impact analysis',
      'Historical weather data',
      'Weather delay documentation',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/field', '/schedule', '/safety', '/projects'],
    commonTasks: [
      'Check today\'s forecast',
      'View 3-week outlook',
      'Get workability score',
      'Review safety alerts',
      'Plan around weather',
    ],
    integrations: ['OpenWeatherMap API', 'AI analysis', 'Project locations'],
  },

  {
    path: '/environmental',
    name: 'Environmental Compliance',
    category: 'Compliance',
    description: 'Environmental monitoring, regulatory compliance, permit tracking, incident logging, audit management, and coordination calls',
    features: [
      'Environmental monitoring',
      'Permit tracking (NPDES, SWPPP, wetlands)',
      'Incident documentation',
      'Audit management',
      'Regulatory compliance tracking',
      'Environmental audit video calls',
      'Inspection reports',
      'Remediation tracking',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/safety', '/documents', '/projects'],
    commonTasks: [
      'Log environmental incident',
      'Track permits',
      'Start audit call',
      'Submit inspection',
      'Monitor compliance',
    ],
    integrations: ['Daily.co audit rooms', 'Regulatory database'],
  },

  // ========== SUBMITTALS & RFIs ==========
  {
    path: '/submittals',
    name: 'Submittal Manager',
    category: 'Documents',
    description: 'Submittal tracking, approval workflows, RFI coordination, specification reviews, and collaborative review video calls',
    features: [
      'Submittal creation and tracking',
      'Approval workflow management',
      'RFI coordination',
      'Specification review calls',
      'Status tracking (pending, approved, rejected)',
      'Revision management',
      'Notification system',
      'Document linking',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/documents', '/projects', '/collaboration'],
    commonTasks: [
      'Submit material approval',
      'Track submittal status',
      'Start review call',
      'Coordinate RFI',
      'Review specifications',
    ],
    integrations: ['Daily.co review rooms', 'Document storage', 'Email notifications'],
  },

  // ========== EMERGENCY & OUTAGES ==========
  {
    path: '/emergency',
    name: 'Emergency Alerts',
    category: 'Safety',
    description: 'Critical emergency broadcasts, incident coordination, instant team video calls, SMS alerts, and emergency response protocols',
    features: [
      'Emergency alert broadcasting',
      'Incident coordination',
      'Instant emergency video calls (pulsing red button)',
      'SMS alert integration',
      'Emergency response protocols',
      'Team notification',
      'Incident timeline',
      'Emergency contact management',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/safety', '/field', '/collaboration'],
    commonTasks: [
      'Send emergency alert',
      'Start emergency call',
      'Coordinate response',
      'Notify team',
      'Document incident',
    ],
    integrations: ['Twilio SMS', 'Daily.co emergency rooms', 'Push notifications'],
  },

  {
    path: '/outages',
    name: 'Outage Coordination',
    category: 'Operations',
    description: 'Power outage planning, switching coordination, multi-crew planning, safety reviews, customer impact analysis, and planning video calls',
    features: [
      'Outage planning and scheduling',
      'Switching procedure coordination',
      'Multi-crew assignment',
      'Safety review integration',
      'Customer impact tracking',
      'Planning video calls',
      'Switching step verification',
      'Post-outage analysis',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/safety', '/schedule', '/field/crews', '/projects'],
    commonTasks: [
      'Plan outage',
      'Coordinate switching',
      'Start planning call',
      'Assign crews',
      'Review safety procedures',
    ],
    integrations: ['Daily.co planning rooms', 'Safety protocols', 'Customer database'],
  },

  // ========== TESTING & INVENTORY ==========
  {
    path: '/testing',
    name: 'Testing Dashboard',
    category: 'Equipment',
    description: 'Equipment testing, diagnostic analysis, compliance tracking, test result review calls, and certification management',
    features: [
      'Equipment testing logs',
      'Diagnostic analysis',
      'Compliance verification',
      'Test result review video calls',
      'Certification tracking',
      'Testing equipment management',
      'Test report generation',
      'Historical test data',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/equipment', '/qaqc', '/documents'],
    commonTasks: [
      'Log test results',
      'Start review call',
      'Track compliance',
      'Generate report',
      'Verify certifications',
    ],
    integrations: ['Daily.co review rooms', 'Testing equipment', 'Report generation'],
  },

  {
    path: '/inventory',
    name: 'Material Inventory',
    category: 'Materials',
    description: 'Material tracking, stock levels, procurement coordination, supplier management, order reviews, and warehouse management',
    features: [
      'Material inventory tracking',
      'Stock level monitoring',
      'Procurement coordination calls',
      'Supplier management',
      'Order tracking',
      'Warehouse location management',
      'Material usage analytics',
      'Reorder point alerts',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/receipts', '/projects', '/field'],
    commonTasks: [
      'Check stock levels',
      'Start procurement call',
      'Order materials',
      'Track deliveries',
      'Manage suppliers',
    ],
    integrations: ['Daily.co procurement rooms', 'Supplier systems', 'Order tracking'],
  },

  // ========== SOCIAL & COLLABORATION ==========
  {
    path: '/feed',
    name: 'Social Feed',
    category: 'Collaboration',
    description: 'Construction social network - post updates, photos, milestones, safety alerts, achievements, with likes, comments, and reposts',
    features: [
      'Social media style feed',
      'Post types: update, achievement, safety, issue, photo, milestone',
      'Reactions (like, love, celebrate, insightful)',
      'Comments and discussions',
      'Repost/share functionality',
      'Media upload (photos, documents)',
      'Project-specific visibility',
      'Real-time updates',
      'Notification integration',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/dashboard', '/projects', '/collaboration'],
    commonTasks: [
      'Post update',
      'Share milestone',
      'Upload photo',
      'React to posts',
      'Comment on activity',
    ],
    integrations: ['Ably real-time', 'Media storage', 'Notifications'],
  },

  {
    path: '/messaging',
    name: 'Team Messaging',
    category: 'Collaboration',
    description: 'Real-time team chat, direct messages, group conversations, file sharing, typing indicators, and video call transitions',
    features: [
      'Real-time messaging with Ably',
      'Direct messages and group chats',
      'File and photo sharing',
      'Typing indicators',
      'Message reactions',
      'Video call transition',
      'Message history',
      'Search conversations',
      'Notification controls',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/collaboration', '/feed', '/projects'],
    commonTasks: [
      'Send message',
      'Create group chat',
      'Share file',
      'Start video call',
      'Search messages',
    ],
    integrations: ['Ably messaging', 'Daily.co video', 'File storage'],
  },

  {
    path: '/collaboration',
    name: 'Project Collaboration',
    category: 'Collaboration',
    description: 'Unified collaboration hub - video rooms, team chat, cursor control, screen sharing, recording, and invite-only group management',
    features: [
      'Daily.co video rooms',
      'Collaborative cursor control',
      'Screen sharing',
      'Recording capability',
      'Room discovery and browsing',
      'Invite-only access control',
      'Knocking for entry',
      'Room host controls',
      'Participant management',
      'Real-time chat integration',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/projects', '/messaging', '/documents'],
    commonTasks: [
      'Create video room',
      'Join meeting',
      'Share screen',
      'Control access',
      'Browse active rooms',
    ],
    integrations: ['Daily.co', 'Ably', 'Database persistence', 'RLS security'],
  },

  // ========== ANALYTICS & AI ==========
  {
    path: '/analytics',
    name: 'Real-Time Analytics',
    category: 'Analytics',
    description: 'Live project analytics, KPI dashboards, productivity metrics, cost analysis, schedule performance, and predictive insights',
    features: [
      'Real-time KPI dashboard',
      'Project health metrics',
      'Budget vs actual analysis',
      'Schedule performance (SPI, CPI)',
      'Productivity tracking',
      'Resource utilization',
      'Safety statistics',
      'Quality metrics',
      'Predictive analytics',
      'Custom reports',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/dashboard', '/projects', '/field', '/receipts'],
    commonTasks: [
      'View project health',
      'Analyze costs',
      'Track productivity',
      'Generate report',
      'Export data',
    ],
    integrations: ['Real-time database', 'Data visualization', 'Export tools'],
  },

  {
    path: '/ai',
    name: 'FieldForge AI',
    category: 'AI',
    description: 'Advanced AI assistant powered by Claude Sonnet 4.5 and GPT-4 Turbo - conversational AI, document analysis, image recognition, risk analysis, predictive maintenance',
    features: [
      'Conversational AI with construction expertise',
      'OSHA safety knowledge (1926/1910, NFPA 70E)',
      'Document analysis (PDFs, CAD, specs)',
      'Image analysis (safety hazards, equipment, progress)',
      'Risk assessment across all dimensions',
      'Predictive maintenance recommendations',
      'Schedule optimization (CPM)',
      'Equipment management guidance',
      'QA/QC procedures',
      'Environmental compliance',
      'Weather impact analysis',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/dashboard', '/projects', '/safety', '/weather'],
    commonTasks: [
      'Ask safety question',
      'Analyze drawing',
      'Review site photo',
      'Get risk assessment',
      'Optimize schedule',
      'Predict equipment failure',
      'Check weather impact',
    ],
    integrations: ['Claude Sonnet 4.5', 'GPT-4 Turbo', 'OpenWeatherMap', 'Database context'],
  },

  // ========== 3D VISUALIZATION ==========
  {
    path: '/map',
    name: '3D Project Map',
    category: 'Visualization',
    description: 'Real-time 3D site visualization with equipment tracking, crew locations, geofencing, and spatial coordination',
    features: [
      '3D site map',
      'Real-time equipment tracking',
      'Crew location monitoring',
      'Geofencing and alerts',
      'Site layout visualization',
      'Progress tracking',
      'Spatial coordination',
      'Drone integration ready',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/projects', '/equipment', '/field/crews'],
    commonTasks: [
      'View site layout',
      'Track equipment',
      'Monitor crew locations',
      'Set geofences',
      'Visualize progress',
    ],
    integrations: ['GPS tracking', '3D rendering', 'Geolocation services'],
  },

  {
    path: '/substations',
    name: '3D Substation Model',
    category: 'Visualization',
    description: '3D electrical substation visualization with equipment models, single-line diagrams, and maintenance planning',
    features: [
      '3D substation visualization',
      'Equipment models (transformers, breakers, switches)',
      'Single-line diagram integration',
      'Equipment status tracking',
      'Maintenance planning',
      'Clearance visualization',
      'Safety zone marking',
    ],
    accessLevel: 'authenticated',
    relatedRoutes: ['/equipment', '/projects', '/map'],
    commonTasks: [
      'View substation layout',
      'Check equipment status',
      'Plan maintenance',
      'Verify clearances',
      'Visualize safety zones',
    ],
    integrations: ['3D modeling', 'Equipment database', 'Engineering data'],
  },

  // ========== PUBLIC PAGES ==========
  {
    path: '/',
    name: 'Landing Page',
    category: 'Marketing',
    description: 'Futuristic home page with product showcase, feature highlights, pricing info, and call-to-action buttons',
    features: [
      'Hero section with animations',
      'Feature showcase',
      'Pricing overview',
      'Customer testimonials',
      'Demo request',
      'Sign up / Login buttons',
    ],
    accessLevel: 'public',
    relatedRoutes: ['/login', '/signup', '/pricing', '/contact'],
    commonTasks: [
      'Learn about FieldForge',
      'View pricing',
      'Request demo',
      'Sign up',
    ],
  },

  {
    path: '/pricing',
    name: 'Pricing Page',
    category: 'Marketing',
    description: 'Subscription pricing plans with Stripe integration for secure checkout',
    features: [
      'Multiple plan tiers',
      'Feature comparison',
      'Stripe checkout integration',
      'Annual/monthly pricing',
    ],
    accessLevel: 'public',
    relatedRoutes: ['/', '/signup', '/contact'],
    commonTasks: [
      'Compare plans',
      'Subscribe',
      'Contact sales',
    ],
  },

  {
    path: '/acquisition-inquiry',
    name: 'Acquisition Inquiry',
    category: 'Marketing',
    description: 'Business acquisition evaluation form for potential deals',
    features: [
      'Acquisition form',
      'Business evaluation',
      'Contact capture',
    ],
    accessLevel: 'public',
    relatedRoutes: ['/contact', '/'],
    commonTasks: [
      'Submit inquiry',
      'Evaluate opportunity',
    ],
  },
];

/**
 * DETAILED INSTRUCTIONS for every major feature
 * This is how the AI teaches users to use the platform
 */
export const AI_INSTRUCTIONS: AIInstruction[] = [
  {
    feature: 'Starting a Video Collaboration',
    steps: [
      '1. Navigate to any feature page (Projects, Safety, Documents, etc.)',
      '2. Look for the collaboration button in the header (e.g., "Team Collaboration", "Safety Team Call", "Review Call")',
      '3. Click the button to open the Collaboration Hub',
      '4. Switch to the "Video" tab',
      '5. Click "Create Room" and enter a room name',
      '6. Enable desired features: Cursor Control, Screen Sharing, Recording',
      '7. Set privacy to "Invite-Only" (default) for secure sessions',
      '8. Click "Create Room" to start the video session',
      '9. Share the room link or use "Browse Rooms" for team members to discover',
      '10. Other team members can join by clicking "Join Room"',
    ],
    tips: [
      'Cursor Control lets team members see each other\'s cursors in real-time',
      'Enable Screen Sharing for remote demonstrations',
      'Recording is useful for safety briefings and training',
      'Invite-Only rooms are secured at the database level with RLS',
      'Only room creators and project admins can manage participants',
    ],
    commonIssues: [
      'If video doesn\'t work: Check that DAILY_API_KEY is configured in Vercel',
      'If you can\'t join a room: Verify you\'re a project team member',
      'If cursor control is laggy: Check that ABLY_API_KEY is configured',
    ],
  },

  {
    feature: 'Creating a New Project',
    steps: [
      '1. Navigate to /projects',
      '2. Click "Create New Project" button',
      '3. Fill in project details:',
      '   - Project number (unique identifier)',
      '   - Project name',
      '   - Client information',
      '   - Location (address, city, state, zip)',
      '   - Start and end dates',
      '   - Budget and contract value',
      '   - Project type (T&D, Substation, etc.)',
      '4. Click "Create Project"',
      '5. You\'ll be automatically added as the Project Admin',
      '6. Navigate to "Team" tab to add team members',
      '7. Assign roles: Admin, Project Manager, Supervisor, Worker, or Viewer',
      '8. Set permissions: can_edit, can_invite, can_view_budget',
    ],
    tips: [
      'Project creators are automatically added as admins via database trigger',
      'Only users with can_invite permission can add team members',
      'Use descriptive project numbers for easy searching',
      'Budget and dates can be updated later',
      'Each project is completely isolated with RLS policies',
    ],
    commonIssues: [
      'Can\'t create project: Verify you\'re authenticated',
      'Team members can\'t access: Check they were invited properly',
      'Budget not visible: Ensure user has can_view_budget permission',
    ],
  },

  {
    feature: 'Reporting a Safety Incident',
    steps: [
      '1. Navigate to /safety',
      '2. Click "Report Incident" button',
      '3. Fill in incident details:',
      '   - Incident type (injury, near-miss, property damage, etc.)',
      '   - Severity level',
      '   - Date and time',
      '   - Location on site',
      '   - Description of what happened',
      '   - People involved',
      '   - Witnesses',
      '   - Contributing factors',
      '4. Upload photos of the incident scene',
      '5. Identify immediate actions taken',
      '6. Suggest corrective actions',
      '7. Click "Submit Report"',
      '8. Incident is logged and stakeholders are notified',
      '9. Track resolution in the "Incidents" tab',
    ],
    tips: [
      'Report near-misses to prevent future incidents',
      'Include detailed photos for investigation',
      'Document witness statements immediately',
      'Corrective actions should be specific and measurable',
      'Use "Safety Team Call" for immediate coordination',
    ],
    commonIssues: [
      'Photos won\'t upload: Check file size (<10MB)',
      'Can\'t see incident: Verify project permissions',
      'Notifications not sent: Check email settings',
    ],
  },

  {
    feature: 'Using the AI Weather System',
    steps: [
      '1. Navigate to /weather',
      '2. The system auto-detects your project location',
      '3. View current weather conditions',
      '4. Check the Construction Workability Score:',
      '   - EXCELLENT: Ideal conditions, proceed normally',
      '   - GOOD: Minor considerations, proceed with awareness',
      '   - FAIR: Some restrictions, modify plans',
      '   - POOR: Significant limitations, consider delays',
      '   - UNSAFE: Stop work, implement safety protocols',
      '5. Review 5/7/14-day forecasts',
      '6. Check safety alerts:',
      '   - Lightning within 6 miles: Shelter immediately',
      '   - Wind >30mph: Stop crane operations',
      '   - Temperature <40°F: No concrete pours',
      '   - Heat index >95°F: Implement heat stress protocols',
      '7. Review activity-specific recommendations',
      '8. Use AI weather analysis for planning',
    ],
    tips: [
      'Check weather every morning before work',
      'Plan critical activities (concrete pours) around weather',
      'Lightning rule: 30-30 (shelter when <30s between flash and thunder, wait 30min after last thunder)',
      'High wind stops: Crane ops, elevated work, material hoisting',
      'Document weather delays for schedule justification',
    ],
  },

  {
    feature: 'Scanning and Managing Receipts',
    steps: [
      '1. Navigate to /receipts',
      '2. Click "Scan Receipt" or "Upload"',
      '3. Take a clear photo of the receipt',
      '4. OCR automatically extracts:',
      '   - Vendor name',
      '   - Date',
      '   - Amount',
      '   - Line items',
      '5. Review and correct any OCR errors',
      '6. Assign to project and cost code',
      '7. Add notes or description',
      '8. Submit for approval',
      '9. Approver gets notification',
      '10. Use "Approval Call" for quick reviews',
      '11. Once approved, receipt is finalized',
      '12. Export to accounting system',
    ],
    tips: [
      'Take photos in good lighting',
      'Ensure receipt is flat and in focus',
      'Assign cost codes accurately for reporting',
      'Attach receipt to specific work order if applicable',
      'Use approval calls for complex or disputed receipts',
    ],
  },

  {
    feature: 'Creating a QA/QC Inspection',
    steps: [
      '1. Navigate to /qaqc',
      '2. Click "New Inspection"',
      '3. Select inspection type (electrical, concrete, steel, etc.)',
      '4. Choose or create inspection checklist',
      '5. Fill in inspection details:',
      '   - Location',
      '   - Work being inspected',
      '   - Contractor',
      '   - Inspection date',
      '6. Go through checklist items:',
      '   - Mark Pass/Fail for each item',
      '   - Add photos for deficiencies',
      '   - Write detailed notes',
      '7. Document deficiencies:',
      '   - Description',
      '   - Location',
      '   - Severity',
      '   - Corrective action required',
      '8. Use "Inspection Call" for remote reviews',
      '9. Generate and sign inspection report',
      '10. Track deficiency resolution',
    ],
    tips: [
      'Use video inspection calls for remote expert reviews',
      'Take photos of both deficiencies and quality work',
      'Be specific in deficiency descriptions',
      'Set realistic correction deadlines',
      'Re-inspect after corrections',
      'Document everything - if it\'s not documented, it didn\'t happen',
    ],
  },

  {
    feature: 'Using Collaborative Cursor Control in Drawings',
    steps: [
      '1. Navigate to /documents/drawings',
      '2. Select a CAD drawing or PDF',
      '3. Click "Collaborate" button in toolbar',
      '4. Interface switches to side-by-side:',
      '   - Drawing on left (50% width)',
      '   - Collaboration panel on right (50% width)',
      '5. In collaboration panel, create or join room',
      '6. Enable "Cursor Control" feature when creating room',
      '7. Team members join the room',
      '8. Everyone\'s cursor appears in real-time',
      '9. Use cursors to point out specific items',
      '10. Add markup and annotations',
      '11. Discuss via video/chat simultaneously',
      '12. Toggle collaboration off to return to full-width',
    ],
    tips: [
      'Cursor control requires ABLY_API_KEY configured',
      'Each cursor is color-coded by user',
      'Use screen sharing for additional context',
      'Great for RFI discussions and design reviews',
      'Drawing viewer works with CAD files and PDFs',
    ],
  },

  {
    feature: 'Managing Team Time Tracking',
    steps: [
      '1. Navigate to /field/time',
      '2. Workers click "Clock In" at start of shift',
      '3. Select project and cost code',
      '4. During work, switch cost codes as needed',
      '5. Take breaks (tracked automatically for compliance)',
      '6. Click "Clock Out" at end of shift',
      '7. Review time card for accuracy',
      '8. Add notes about work performed',
      '9. Submit timesheet for approval',
      '10. Supervisor reviews and approves',
      '11. Approved time exports to payroll',
    ],
    tips: [
      'Switch cost codes when changing tasks',
      'Document break times for labor law compliance',
      'Add detailed notes for non-productive time',
      'Review timesheets daily, not weekly',
      'Export payroll data on schedule cutoff',
    ],
  },

  {
    feature: 'Using the Social Feed',
    steps: [
      '1. Navigate to /feed',
      '2. View posts from your project team',
      '3. Create a new post:',
      '   - Click "Create Post"',
      '   - Select post type (Update, Achievement, Safety, Issue, Photo, Milestone)',
      '   - Write your message',
      '   - Upload photos/media (optional)',
      '   - Set visibility (project-wide or specific teams)',
      '4. React to posts: Like, Love, Celebrate, Insightful',
      '5. Comment on posts to discuss',
      '6. Repost important updates',
      '7. Filter feed by post type or project',
    ],
    tips: [
      'Use Safety posts for important safety alerts',
      'Achievement posts boost team morale',
      'Photo posts are great for progress documentation',
      'Milestone posts automatically track project progress',
      'React thoughtfully - it\'s visible to the team',
    ],
  },

  {
    feature: 'Running Analytics and Reports',
    steps: [
      '1. Navigate to /analytics',
      '2. Dashboard shows real-time KPIs:',
      '   - Project health score',
      '   - Budget performance (CPI)',
      '   - Schedule performance (SPI)',
      '   - Safety statistics',
      '   - Quality metrics',
      '   - Productivity trends',
      '3. Filter by:',
      '   - Date range',
      '   - Specific project',
      '   - Cost code',
      '   - Crew or team',
      '4. Click on any metric for detailed breakdown',
      '5. Use AI to analyze trends and predict outcomes',
      '6. Generate custom reports',
      '7. Export data (CSV, Excel, PDF)',
      '8. Schedule automated reports',
    ],
    tips: [
      'Check dashboard daily for project health',
      'CPI < 1.0 means over budget, >1.0 means under budget',
      'SPI < 1.0 means behind schedule, >1.0 means ahead',
      'Use trend analysis for proactive problem solving',
      'Share reports with stakeholders weekly',
    ],
  },

  {
    feature: 'Asking the AI Questions',
    steps: [
      '1. Click the AI Assistant button (floating brain icon)',
      '2. Type your question in natural language',
      '3. AI understands context from:',
      '   - Your current project',
      '   - Recent activities',
      '   - Project data',
      '   - Weather conditions',
      '   - Safety records',
      '4. AI responds with:',
      '   - Direct answer',
      '   - Relevant data',
      '   - Recommendations',
      '   - Related insights',
      '5. Ask follow-up questions',
      '6. Use quick actions for common queries',
      '7. AI can:',
      '   - Analyze documents',
      '   - Review site photos',
      '   - Assess project risks',
      '   - Predict equipment failures',
      '   - Optimize schedules',
      '   - Check weather impacts',
    ],
    tips: [
      'Be specific in your questions',
      'Ask about OSHA regulations and safety',
      'Get schedule optimization suggestions',
      'Use AI for risk assessment before critical work',
      'Ask for predictive maintenance on equipment',
      'Get weather impact analysis for planning',
    ],
    commonIssues: [
      'AI not responding: Check ANTHROPIC_API_KEY is configured',
      'Generic responses: Provide more project context',
      'Slow responses: AI is analyzing large documents',
    ],
  },
];

/**
 * Get route information by path
 */
export function getRouteInfo(path: string): SiteRoute | undefined {
  return SITE_ROUTES.find(route => route.path === path);
}

/**
 * Get all routes by category
 */
export function getRoutesByCategory(category: string): SiteRoute[] {
  return SITE_ROUTES.filter(route => route.category === category);
}

/**
 * Get instruction for a feature
 */
export function getInstruction(featureName: string): AIInstruction | undefined {
  return AI_INSTRUCTIONS.find(
    instr => instr.feature.toLowerCase().includes(featureName.toLowerCase())
  );
}

/**
 * Search routes by keyword
 */
export function searchRoutes(keyword: string): SiteRoute[] {
  const lowerKeyword = keyword.toLowerCase();
  return SITE_ROUTES.filter(route =>
    route.name.toLowerCase().includes(lowerKeyword) ||
    route.description.toLowerCase().includes(lowerKeyword) ||
    route.features.some(f => f.toLowerCase().includes(lowerKeyword)) ||
    route.commonTasks?.some(t => t.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return [...new Set(SITE_ROUTES.map(route => route.category))].sort();
}

/**
 * Generate navigation guidance for AI
 */
export function generateNavigationGuidance(currentPath: string, targetFeature: string): string {
  const routes = searchRoutes(targetFeature);
  
  if (routes.length === 0) {
    return `I couldn't find a feature matching "${targetFeature}". Here are all available categories: ${getAllCategories().join(', ')}. What would you like to do?`;
  }

  if (routes.length === 1) {
    const route = routes[0];
    const instruction = AI_INSTRUCTIONS.find(i => 
      i.feature.toLowerCase().includes(route.name.toLowerCase())
    );

    let guidance = `To access **${route.name}**, navigate to **${route.path}**.\n\n`;
    guidance += `**Description**: ${route.description}\n\n`;
    guidance += `**Key Features**:\n${route.features.slice(0, 5).map(f => `- ${f}`).join('\n')}\n\n`;
    
    if (route.commonTasks && route.commonTasks.length > 0) {
      guidance += `**Common Tasks**:\n${route.commonTasks.map(t => `- ${t}`).join('\n')}\n\n`;
    }

    if (instruction) {
      guidance += `\n**How to use**:\n${instruction.steps.slice(0, 5).map(s => s).join('\n')}\n\n`;
      if (instruction.tips && instruction.tips.length > 0) {
        guidance += `**Tips**:\n${instruction.tips.slice(0, 3).map(t => `- ${t}`).join('\n')}`;
      }
    }

    return guidance;
  }

  // Multiple matches
  let guidance = `I found ${routes.length} features related to "${targetFeature}":\n\n`;
  routes.forEach(route => {
    guidance += `**${route.name}** (${route.path})\n${route.description}\n\n`;
  });
  guidance += `\nWhich one would you like to learn more about?`;
  
  return guidance;
}

/**
 * Generate site overview for AI context
 */
export function generateSiteOverview(): string {
  const categories = getAllCategories();
  let overview = '# FieldForge Platform Overview\n\n';
  overview += `FieldForge is a comprehensive construction management platform with ${SITE_ROUTES.length} features across ${categories.length} categories.\n\n`;
  
  categories.forEach(category => {
    const routes = getRoutesByCategory(category);
    overview += `## ${category}\n`;
    routes.forEach(route => {
      overview += `- **${route.name}** (${route.path}): ${route.description.substring(0, 100)}...\n`;
    });
    overview += '\n';
  });
  
  return overview;
}

