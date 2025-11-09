/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 */

import { Router, Request, Response } from "express";
import * as feedbackRepository from "./feedbackRepository.js";

export function createFeedbackRouter(): Router {
  const router = Router();

  // Submit feedback
  router.post("/submit", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      
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
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Get user's feedback
  router.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const feedback = await feedbackRepository.getUserFeedback(req.params.userId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Get all feedback (admin)
  router.get("/all", async (req: Request, res: Response) => {
    try {
      const { status, type, limit } = req.query;
      const feedback = await feedbackRepository.getAllFeedback(
        status as string,
        type as string,
        limit ? parseInt(limit as string) : 100
      );
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching all feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Export feedback to text
  router.get("/export", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const text = await feedbackRepository.exportFeedbackToText(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="mythatron-feedback-${Date.now()}.txt"`);
      res.send(text);
    } catch (error) {
      console.error("Error exporting feedback:", error);
      res.status(500).json({ error: "Failed to export feedback" });
    }
  });

  return router;
}
