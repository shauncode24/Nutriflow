import express from "express";
import axios from "axios";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { use } from "react";

const app = express();
const PORT = 4000;
app.use(express.json());

app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET;

// Replace with your actual RapidAPI key
const RAPIDAPI_KEY = "1b16ff4402msh6ad6e98234bec62p197cf6jsn0c2f4718c1d8";

app.get("/getexercise", async (req, res) => {
  const { muscle } = req.query;
  console.log("PARAMETER: ", muscle);

  if (!muscle) {
    return res.status(400).json({ error: "Missing muscle parameter" });
  }

  try {
    const response = await axios.get(
      `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${muscle}?limit=10`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching exercise data:", error);
    res.status(500).json({ error: "Unable to fetch exercise data" });
  }
});

app.post("/addworkout", async (req, res) => {
  const { workoutName, selectedDays, selectedMuscles, workoutList } = req.body;

  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.username;
  // console.log("got from frontend: ", workoutList);

  try {
    const sessionRes = await pool.query(
      "INSERT INTO sessions (user_id, session_name) VALUES ($1, $2) RETURNING session_id",
      [userId, workoutName]
    );

    const sessionId = sessionRes.rows[0].session_id;

    for (const day of selectedDays) {
      console.log("day", day);
      const dayRes = await pool.query(
        "INSERT INTO workout_days (session_id, user_id, day_name) VALUES ($1, $2, $3) RETURNING day_id",
        [sessionId, userId, day]
      );
      const dayId = dayRes.rows[0].day_id;
      console.log("DAY: ", day);

      for (const muscle of selectedMuscles[day]) {
        const muscleRes = await pool.query(
          "INSERT INTO day_muscles (session_id, day_id, user_id, muscle) VALUES ($1, $2, $3, $4) RETURNING muscle_id",
          [sessionId, dayId, userId, muscle]
        );
        const muscleId = muscleRes.rows[0].muscle_id;
        console.log("MUSCLE: ", muscle);

        for (const exercise of workoutList[day]) {
          if (exercise.bodyPart === muscle || exercise.target === muscle) {
            const exerciseRes = await pool.query(
              "INSERT INTO exercises (session_id, day_id, muscle_id, user_id, exercise_name, exercise_desc, sets) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING exercise_id",
              [
                sessionId,
                dayId,
                muscleId,
                userId,
                exercise.name,
                exercise.description,
                exercise.sets,
              ]
            );
            console.log("WORKOUT: ", exercise.name);
            const exerciseId = exerciseRes.rows[0].exercise_id;
            for (const reps of exercise.reps) {
              await pool.query(
                "INSERT INTO exercise_sets (exercise_id, user_id, no_of_reps) VALUES ($1, $2, $3)",
                [exerciseId, userId, reps]
              );
            }
          }
        }
      }
    }
    res.status(200).json({ message: "Workout saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save workout" });
  }

  // for (const day in workoutList) {
  //   console.log("Day Wise", day);
  //   for (const exercise in workoutList[day]) {
  //     console.log("Exercise Wise: ", workoutList[day][exercise].name);
  //   }
  // }
});

app.get("/getworkouts", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.username;

  try {
    const workoutRes = await pool.query(
      "SELECT * FROM sessions where user_id = $1",
      [userId]
    );
    res.json(workoutRes.rows);
  } catch (err) {
    console.error(err);
  }
});

app.get("/getworkoutsession/:session_id", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  const userId = decoded.username;
  const sessionId = req.params.session_id;

  try {
    const session = await pool.query(
      "SELECT * FROM sessions WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );

    const days = await pool.query(
      "SELECT * FROM workout_days WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    const sessionDays = [];

    for (const day of days.rows) {
      const muscles = await pool.query(
        "SELECT * FROM day_muscles WHERE session_id = $1 AND user_id = $2 AND day_id = $3",
        [sessionId, userId, day.day_id]
      );
      const sessionMuscles = [];

      for (const muscle of muscles.rows) {
        const exercises = await pool.query(
          "SELECT * FROM exercises WHERE session_id = $1 AND user_id = $2 AND day_id = $3 AND muscle_id = $4",
          [sessionId, userId, day.day_id, muscle.muscle_id]
        );
        const sessionExercises = [];

        for (const exercise of exercises.rows) {
          const sets = await pool.query(
            "SELECT * FROM exercise_sets WHERE exercise_id = $1 AND user_id = $2",
            [exercise.exercise_id, userId]
          );

          sessionExercises.push({ ...exercise, sets: sets.rows });
        }
        sessionMuscles.push({ ...muscle, exercises: sessionExercises });
      }
      sessionDays.push({ ...day, muscles: sessionMuscles });
    }

    // console.log("Fetched Session Details: ", sessionDays);

    res.json({
      session: session.rows[0],
      days: sessionDays,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
