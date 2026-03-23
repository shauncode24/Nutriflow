import express from "express";
import { getInsights } from "../controllers/insightController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/getinsights/:planId", verifyToken, getInsights);

export default router;