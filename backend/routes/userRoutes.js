import express from "express";
import { getUsername } from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/getusername", verifyToken, getUsername);

export default router;