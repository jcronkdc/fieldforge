import express from "express";
import { fetchMythacoinSummary, fetchMythacoinTransactions, recordMythacoinTransaction } from "./mythacoinRepository.js";

export function createMythacoinRouter() {
  const router = express.Router();

  router.get("/summary", async (req, res) => {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    try {
      const summary = await fetchMythacoinSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("[mythacoin] summary error", error);
      res.status(500).json({ error: "Failed to load MythaCoin summary" });
    }
  });

  router.get("/transactions", async (req, res) => {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const offsetParam = typeof req.query.offset === "string" ? Number(req.query.offset) : undefined;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    try {
      const transactions = await fetchMythacoinTransactions(
        userId,
        Number.isFinite(limitParam) ? limitParam! : 25,
        Number.isFinite(offsetParam) ? offsetParam! : 0
      );
      res.json({ items: transactions });
    } catch (error) {
      console.error("[mythacoin] transactions error", error);
      res.status(500).json({ error: "Failed to load transactions" });
    }
  });

  router.post("/reward", async (req, res) => {
    const { userId, amount, transactionType, description, metadata } = req.body ?? {};
    if (!userId || typeof amount !== "number" || !transactionType) {
      return res.status(400).json({ error: "userId, amount, and transactionType are required" });
    }
    try {
      const transaction = await recordMythacoinTransaction({
        userId,
        amount,
        transactionType,
        description,
        metadata,
      });
      res.status(201).json({ transaction });
    } catch (error) {
      console.error("[mythacoin] reward error", error);
      res.status(500).json({ error: (error as Error).message ?? "Failed to record transaction" });
    }
  });

  return router;
}


