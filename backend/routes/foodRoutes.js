import express from "express";
import {
  addFood,
  getFood,
  deleteFood,
  clearFoods,
} from "../controllers/foodController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/addfood", verifyToken, addFood);
router.get("/getfood", verifyToken, getFood);
router.delete("/deletefood", verifyToken, deleteFood);
router.post("/clearfoods", verifyToken, clearFoods);

export default router;