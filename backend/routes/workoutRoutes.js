import express from "express";
import {
  getExercise,
  addWorkout,
  getWorkouts,
  getWorkoutSession,
  updateWorkout,
  deleteSession,
  saveWorkoutLogs,
} from "../controllers/workoutController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/getexercise", getExercise);
router.post("/addworkout", verifyToken, addWorkout);
router.get("/getworkouts", verifyToken, getWorkouts);
router.get("/getworkoutsession/:session_id", verifyToken, getWorkoutSession);
router.put("/updateworkout/:session_id", verifyToken, updateWorkout);
router.delete("/deletesession/:session_id", verifyToken, deleteSession);
router.post("/saveworkoutlogs", verifyToken, saveWorkoutLogs);

export default router;