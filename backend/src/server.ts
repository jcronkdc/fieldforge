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
// TODO: Add these as we build them:
// import { createCrewRouter } from "./routes/crewRoutes.js";
// import { createQAQCRouter } from "./routes/qaqcRoutes.js";
// import { createSchedulingRouter } from "./routes/schedulingRoutes.js";
// import { createDocumentRouter } from "./routes/documentRoutes.js";
// import { createAnalyticsRouter } from "./routes/analyticsRoutes.js";
// import { createReportingRouter } from "./routes/reportingRoutes.js";

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

// Apply authentication middleware to ALL API routes (except health check)
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

// Safety Management - COMPLETE E2E PATHWAY ✅
app.use("/api/safety", createSafetyRouter());

// TODO: Implement these construction routes
// app.use("/api/crews", createCrewRouter());
// app.use("/api/qaqc", createQAQCRouter());
// app.use("/api/scheduling", createSchedulingRouter());
// app.use("/api/documents", createDocumentRouter());
// app.use("/api/analytics", createAnalyticsRouter());
// app.use("/api/reporting", createReportingRouter());

// Feedback endpoint (keep this - useful for any platform)
app.use("/api/feedback", createFeedbackRouter());

// Error handling middleware (must be last)
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all errors

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`[fieldforge-api] Construction Platform API`);
  console.log(`[fieldforge-api] listening on port ${port}`);
  console.log(`[fieldforge-api] environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[fieldforge-api] Ready for T&D/Substation field operations`);
});