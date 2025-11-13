import express, { type Request, type Response } from "express";
import cors from "cors";
import { apiLimiter, authLimiter, sensitiveOperationLimiter } from "./middleware/rateLimit.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authenticateRequest } from "./middleware/auth.js";
import { validateRequestBody, validateQueryParams } from "./middleware/inputValidation.js";
import { loadEnv } from "./worker/env.js";

// Construction Platform Router Imports
import { createFieldOpsRouter } from "./routes/fieldOpsRoutes.js";
import { createFeedbackRouter } from "./feedback/feedbackRoutes.js";
import { createProjectRouter } from "./routes/projectRoutes.js";
import { createEquipmentRouter } from "./routes/equipmentRoutes.js";
import { createSafetyRouter } from "./construction/safety/safetyRoutes.js";
import { createAnalyticsRouter } from "./construction/analytics/analyticsRoutes.js";
import { createCrewRouter } from "./construction/crews/crewRoutes.js";
import { createQAQCRouter } from "./construction/qaqc/qaqcRoutes.js";
import { createDocumentRouter } from "./construction/documents/documentRoutes.js";
import { createSchedulingRouter } from "./construction/scheduling/schedulingRoutes.js";
import { createReportingRouter } from "./construction/reporting/reportingRoutes.js";
import { createInventoryRouter } from "./construction/inventory/inventoryRoutes.js";
import { createReceiptRouter } from "./construction/receipts/receiptRoutes.js";
import { createOperationsRouter } from "./construction/operations/operationsRoutes.js";
import { createTestingRouter } from "./construction/testing/testingRoutes.js";
import { createDrawingRouter } from "./construction/drawings/drawingRoutes.js";
import { createEquipmentTestingRouter } from "./construction/equipment/equipmentTestingRoutes.js";
import { createLeadRouter } from "./routes/leadRoutes.js";
import { createEnvironmentalRouter } from "./construction/environmental/environmentalRoutes.js";
import { createSubmittalsRouter } from "./routes/submittalsRoutes.js";
import { createOutagesRouter } from "./routes/outagesRoutes.js";

/**
 * © 2025 FieldForge. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 * 
 * FieldForge™ is a trademark of FieldForge, LLC.
 * Construction management platform for T&D and Substation projects.
 * 
 * Unauthorized copying, modification, or distribution of this code
 * is strictly prohibited and will be prosecuted to the fullest extent of the law.
 */

const env = loadEnv();
const app = express();

// Configure CORS with security best practices
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS?.split(',') || process.env.CORS_ORIGIN?.split(',') || ['https://fieldforge.vercel.app']).filter(Boolean)
    : process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || true,
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation middleware (apply after body parsing)
app.use(validateRequestBody);
app.use(validateQueryParams);

// Security middleware (order matters - apply early)
app.use(requestIdMiddleware); // Add request ID for tracing
app.use(securityHeaders); // Set security headers
app.use(requestLogger); // Log all requests

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint (no auth required)
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    service: "fieldforge-api", 
    platform: "construction",
    timestamp: new Date().toISOString() 
  });
});

// Public lead capture endpoint (no auth required)
app.use("/api/leads", createLeadRouter());

// Apply authentication middleware to ALL API routes (except health check and leads)
app.use('/api', authenticateRequest);

// Apply granular rate limiting for sensitive/compute-intensive endpoints
app.use("/api/projects/reports", sensitiveOperationLimiter);
app.use("/api/analytics/export", sensitiveOperationLimiter);
app.use("/api/documents/bulk", sensitiveOperationLimiter);

// ============================================================================
// CONSTRUCTION PLATFORM API ROUTES
// ============================================================================

// Field Operations (Time tracking, daily reports, weather)
app.use("/api/field-ops", createFieldOpsRouter());

// Project Management
app.use("/api/projects", createProjectRouter());

// Equipment Management  
app.use("/api/equipment", createEquipmentRouter());

// Equipment Testing - DIAGNOSTICS & COMPLIANCE ✅
app.use("/api/equipment/testing", createEquipmentTestingRouter());

// Safety Management - COMPLETE E2E PATHWAY ✅
app.use("/api/safety", createSafetyRouter());

// Analytics - REAL DATA, NO MORE MATH.RANDOM() ✅
app.use("/api/analytics", createAnalyticsRouter());

// Crew Management - COMPLETE WITH CERTIFICATIONS ✅
app.use("/api/crews", createCrewRouter());

// QAQC Inspection System - LIVE WITH TESTING ✅
app.use("/api/qaqc", createQAQCRouter());

// Document Management - UPLOAD/DOWNLOAD/SHARE ✅
app.use("/api/documents", createDocumentRouter());

// Drawing Viewer - CAD/PDF WITH ANNOTATIONS ✅
app.use("/api/documents/drawings", createDrawingRouter());

// Project Scheduling - GANTT CHARTS & RESOURCE MGMT ✅
app.use("/api/scheduling", createSchedulingRouter());

// Daily Operations - FIELD REPORTS & PRODUCTIVITY ✅
app.use("/api/operations", createOperationsRouter());

// Testing Dashboard - EQUIPMENT TESTING & COMPLIANCE ✅
app.use("/api/testing", createTestingRouter());

// Reporting System - PDF GENERATION & DASHBOARDS ✅
app.use("/api/reporting", createReportingRouter());

// Inventory Management - MATERIALS & STOCK TRACKING ✅
app.use("/api/inventory", createInventoryRouter());

// Receipt Management - EXPENSE TRACKING WITH APPROVAL ✅
app.use("/api/receipts", createReceiptRouter());

// Environmental Compliance - MONITORING & REGULATORY COMPLIANCE ✅
app.use("/api/environmental", createEnvironmentalRouter());

// Feedback endpoint (keep this - useful for any platform)
app.use("/api/feedback", createFeedbackRouter());

// Submittals Management - PLATFORM'S MEMORY ✅
app.use("/api/submittals", createSubmittalsRouter());

// Outage Coordination - PLATFORM'S PLANNING BRAIN ✅
app.use("/api/outages", createOutagesRouter());

// Error handling middleware (must be last)
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all errors

const port = Number(process.env.PORT ?? 4000);

// Only start the server if not running in Vercel environment
if (!process.env.VERCEL && !process.env.NOW_BUILDER) {
  app.listen(port, () => {
    console.log(`[fieldforge-api] Construction Platform API`);
    console.log(`[fieldforge-api] listening on port ${port}`);
    console.log(`[fieldforge-api] environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[fieldforge-api] Ready for T&D/Substation field operations`);
  });
}

// Export the app for Vercel
export default app;