import express from "express";
import {
  addMeal,
  getPlans,
  getPlan,
  deletePlan,
} from "../controllers/mealController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/addMeal", verifyToken, addMeal);
router.get("/plans", verifyToken, getPlans);
router.get("/getplan/:planId", verifyToken, getPlan);
router.delete("/deleteplan", verifyToken, deletePlan);

export default router;