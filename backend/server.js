import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(userRoutes);
app.use(foodRoutes);
app.use(mealRoutes);
app.use(insightRoutes);

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});