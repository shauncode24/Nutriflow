import express from "express";
import cors from "cors";
import "dotenv/config";

import workoutRoutes from "./routes/workoutRoutes.js";

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.use(workoutRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});