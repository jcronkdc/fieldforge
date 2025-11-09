"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedbackRouter = createFeedbackRouter;
const express_1 = require("express");
const feedbackRepository = __importStar(require("./feedbackRepository.js"));
function createFeedbackRouter() {
    const router = (0, express_1.Router)();
    // Submit feedback
    router.post("/submit", async (req, res) => {
        try {
            const userId = req.headers["x-user-id"];
            const feedback = await feedbackRepository.submitFeedback({
                userId,
                username: req.body.username,
                feedbackType: req.body.feedbackType || 'suggestion',
                subject: req.body.subject,
                content: req.body.content,
                pageContext: req.body.pageContext,
                userAgent: req.headers["user-agent"]
            });
            res.json({ success: true, feedback });
        }
        catch (error) {
            console.error("Error submitting feedback:", error);
            res.status(500).json({ error: "Failed to submit feedback" });
        }
    });
    // Get user's feedback
    router.get("/user/:userId", async (req, res) => {
        try {
            const feedback = await feedbackRepository.getUserFeedback(req.params.userId);
            res.json(feedback);
        }
        catch (error) {
            console.error("Error fetching user feedback:", error);
            res.status(500).json({ error: "Failed to fetch feedback" });
        }
    });
    // Get all feedback (admin)
    router.get("/all", async (req, res) => {
        try {
            const { status, type, limit } = req.query;
            const feedback = await feedbackRepository.getAllFeedback(status, type, limit ? parseInt(limit) : 100);
            res.json(feedback);
        }
        catch (error) {
            console.error("Error fetching all feedback:", error);
            res.status(500).json({ error: "Failed to fetch feedback" });
        }
    });
    // Export feedback to text
    router.get("/export", async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const text = await feedbackRepository.exportFeedbackToText(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="mythatron-feedback-${Date.now()}.txt"`);
            res.send(text);
        }
        catch (error) {
            console.error("Error exporting feedback:", error);
            res.status(500).json({ error: "Failed to export feedback" });
        }
    });
    return router;
}
