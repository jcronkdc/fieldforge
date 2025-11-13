"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const rateLimit_js_1 = require("./middleware/rateLimit.js");
const securityHeaders_js_1 = require("./middleware/securityHeaders.js");
const requestId_js_1 = require("./middleware/requestId.js");
const requestLogger_js_1 = require("./middleware/requestLogger.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const auth_js_1 = require("./middleware/auth.js");
const inputValidation_js_1 = require("./middleware/inputValidation.js");
const env_js_1 = require("./worker/env.js");
// Construction Platform Router Imports
const fieldOpsRoutes_js_1 = require("./routes/fieldOpsRoutes.js");
const feedbackRoutes_js_1 = require("./feedback/feedbackRoutes.js");
const projectRoutes_js_1 = require("./routes/projectRoutes.js");
const equipmentRoutes_js_1 = require("./routes/equipmentRoutes.js");
const safetyRoutes_js_1 = require("./construction/safety/safetyRoutes.js");
const analyticsRoutes_js_1 = require("./construction/analytics/analyticsRoutes.js");
const crewRoutes_js_1 = require("./construction/crews/crewRoutes.js");
const qaqcRoutes_js_1 = require("./construction/qaqc/qaqcRoutes.js");
const documentRoutes_js_1 = require("./construction/documents/documentRoutes.js");
const schedulingRoutes_js_1 = require("./construction/scheduling/schedulingRoutes.js");
const reportingRoutes_js_1 = require("./construction/reporting/reportingRoutes.js");
const inventoryRoutes_js_1 = require("./construction/inventory/inventoryRoutes.js");
const receiptRoutes_js_1 = require("./construction/receipts/receiptRoutes.js");
const operationsRoutes_js_1 = require("./construction/operations/operationsRoutes.js");
const testingRoutes_js_1 = require("./construction/testing/testingRoutes.js");
const drawingRoutes_js_1 = require("./construction/drawings/drawingRoutes.js");
const equipmentTestingRoutes_js_1 = require("./construction/equipment/equipmentTestingRoutes.js");
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
const env = (0, env_js_1.loadEnv)();
const app = (0, express_1.default)();
// Configure CORS with security best practices
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS?.split(',') || process.env.CORS_ORIGIN?.split(',') || ['https://fieldforge.vercel.app']).filter(Boolean)
        : process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || true,
    credentials: true,
    maxAge: 86400, // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Input validation middleware (apply after body parsing)
app.use(inputValidation_js_1.validateRequestBody);
app.use(inputValidation_js_1.validateQueryParams);
// Security middleware (order matters - apply early)
app.use(requestId_js_1.requestIdMiddleware); // Add request ID for tracing
app.use(securityHeaders_js_1.securityHeaders); // Set security headers
app.use(requestLogger_js_1.requestLogger); // Log all requests
// Apply rate limiting to all API routes
app.use('/api', rateLimit_js_1.apiLimiter);
// Health check endpoint (no auth required)
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "fieldforge-api",
        platform: "construction",
        timestamp: new Date().toISOString()
    });
});
// Apply authentication middleware to ALL API routes (except health check)
app.use('/api', auth_js_1.authenticateRequest);
// Apply granular rate limiting for sensitive/compute-intensive endpoints
app.use("/api/projects/reports", rateLimit_js_1.sensitiveOperationLimiter);
app.use("/api/analytics/export", rateLimit_js_1.sensitiveOperationLimiter);
app.use("/api/documents/bulk", rateLimit_js_1.sensitiveOperationLimiter);
// ============================================================================
// CONSTRUCTION PLATFORM API ROUTES
// ============================================================================
// Field Operations (Time tracking, daily reports, weather)
app.use("/api/field-ops", (0, fieldOpsRoutes_js_1.createFieldOpsRouter)());
// Project Management
app.use("/api/projects", (0, projectRoutes_js_1.createProjectRouter)());
// Equipment Management  
app.use("/api/equipment", (0, equipmentRoutes_js_1.createEquipmentRouter)());
// Equipment Testing - DIAGNOSTICS & COMPLIANCE ✅
app.use("/api/equipment/testing", (0, equipmentTestingRoutes_js_1.createEquipmentTestingRouter)());
// Safety Management - COMPLETE E2E PATHWAY ✅
app.use("/api/safety", (0, safetyRoutes_js_1.createSafetyRouter)());
// Analytics - REAL DATA, NO MORE MATH.RANDOM() ✅
app.use("/api/analytics", (0, analyticsRoutes_js_1.createAnalyticsRouter)());
// Crew Management - COMPLETE WITH CERTIFICATIONS ✅
app.use("/api/crews", (0, crewRoutes_js_1.createCrewRouter)());
// QAQC Inspection System - LIVE WITH TESTING ✅
app.use("/api/qaqc", (0, qaqcRoutes_js_1.createQAQCRouter)());
// Document Management - UPLOAD/DOWNLOAD/SHARE ✅
app.use("/api/documents", (0, documentRoutes_js_1.createDocumentRouter)());
// Drawing Viewer - CAD/PDF WITH ANNOTATIONS ✅
app.use("/api/documents/drawings", (0, drawingRoutes_js_1.createDrawingRouter)());
// Project Scheduling - GANTT CHARTS & RESOURCE MGMT ✅
app.use("/api/scheduling", (0, schedulingRoutes_js_1.createSchedulingRouter)());
// Daily Operations - FIELD REPORTS & PRODUCTIVITY ✅
app.use("/api/operations", (0, operationsRoutes_js_1.createOperationsRouter)());
// Testing Dashboard - EQUIPMENT TESTING & COMPLIANCE ✅
app.use("/api/testing", (0, testingRoutes_js_1.createTestingRouter)());
// Reporting System - PDF GENERATION & DASHBOARDS ✅
app.use("/api/reporting", (0, reportingRoutes_js_1.createReportingRouter)());
// Inventory Management - MATERIALS & STOCK TRACKING ✅
app.use("/api/inventory", (0, inventoryRoutes_js_1.createInventoryRouter)());
// Receipt Management - EXPENSE TRACKING WITH APPROVAL ✅
app.use("/api/receipts", (0, receiptRoutes_js_1.createReceiptRouter)());
// Feedback endpoint (keep this - useful for any platform)
app.use("/api/feedback", (0, feedbackRoutes_js_1.createFeedbackRouter)());
// Error handling middleware (must be last)
app.use(errorHandler_js_1.notFoundHandler); // Handle 404s
app.use(errorHandler_js_1.errorHandler); // Handle all errors
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
exports.default = app;
