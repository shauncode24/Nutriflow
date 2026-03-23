import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.get("/register", (req, res) => {
  res.json({ message: "Registration endpoint" });
});

router.post("/register", register);
router.post("/login", login);

export default router;