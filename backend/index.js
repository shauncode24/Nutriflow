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
                "INSERT INTO exercise_sets (exercise_id, user_id, no_of_reps, session_id) VALUES ($1, $2, $3, $4)",
                [exerciseId, userId, reps, sessionId]
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
    const sessionResult = await pool.query(
      "SELECT * FROM sessions WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    const session = sessionResult.rows[0];

    const daysResult = await pool.query(
      "SELECT * FROM workout_days WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    const days = daysResult.rows;

    const workoutList = {};
    const selectedMuscles = {};
    const selectedDays = [];

    for (const day of days) {
      const dayName = day.day_name;
      selectedDays.push(dayName);

      const musclesResult = await pool.query(
        "SELECT * FROM day_muscles WHERE session_id = $1 AND user_id = $2 AND day_id = $3",
        [sessionId, userId, day.day_id]
      );
      const muscles = musclesResult.rows;

      selectedMuscles[dayName] = [];
      workoutList[dayName] = [];

      for (const muscle of muscles) {
        selectedMuscles[dayName].push(muscle.muscle);

        const exercisesResult = await pool.query(
          "SELECT * FROM exercises WHERE session_id = $1 AND user_id = $2 AND day_id = $3 AND muscle_id = $4",
          [sessionId, userId, day.day_id, muscle.muscle_id]
        );
        const exercises = exercisesResult.rows;

        for (const exercise of exercises) {
          const setsResult = await pool.query(
            "SELECT * FROM exercise_sets WHERE exercise_id = $1 AND user_id = $2",
            [exercise.exercise_id, userId]
          );
          const sets = setsResult.rows;
          console.log("SETS: ", sets);

          workoutList[dayName].push({
            bodyPart: exercise.body_part,
            equipment: exercise.equipment,
            id: exercise.exercise_id,
            name: exercise.exercise_name,
            target: exercise.target,
            secondaryMuscles: exercise.secondary_muscles || [],
            instructions: exercise.instructions || [],
            description: exercise.description,
            difficulty: exercise.difficulty,
            category: exercise.category,
            sets: sets.length,
            reps: sets.map((s) => s.no_of_reps),
          });
        }
      }
    }

    res.json({
      workoutName: session.session_name,
      selectedDays,
      workoutList,
      selectedMuscles,
      exercises: {},
      workoutId: session.session_id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.put("/updateworkout/:session_id", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  const userId = decoded.username;
  const sessionId = req.params.session_id;

  const client = await pool.connect();

  const { workoutName, selectedDays, selectedMuscles, workoutList } = req.body;

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE sessions SET session_name = $1 WHERE session_id = $2 AND user_id = $3",
      [workoutName, sessionId, userId]
    );

    const existingDaysRes = await client.query(
      "SELECT * FROM workout_days WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );

    const existingDays = existingDaysRes.rows;
    const existingDayNames = existingDays.map((d) => d.day_name);
    const newDays = selectedDays;

    for (const day of existingDays) {
      await client.query(
        "DELETE FROM workout_days WHERE day_id = $1 AND user_id = $2",
        [day.day_id, userId]
      );
      await client.query(
        "DELETE FROM day_muscles WHERE day_id = $1 AND user_id = $2",
        [day.day_id, userId]
      );
      await client.query(
        "DELETE FROM exercises WHERE day_id = $1 AND user_id = $2",
        [day.day_id, userId]
      );
    }

    const dayIdMap = {};

    for (const dayName of newDays) {
      const inserted = await client.query(
        "INSERT INTO workout_days (session_id, user_id, day_name) VALUES ($1, $2, $3) RETURNING day_id",
        [sessionId, userId, dayName]
      );
      const dayId = inserted.rows[0].day_id;
      dayIdMap[dayName] = dayId;
    }

    for (const dayName of newDays) {
      const muscles = selectedMuscles[dayName];
      const exercises = workoutList[dayName];
      const dayId = dayIdMap[dayName];

      await client.query(
        "DELETE FROM day_muscles WHERE day_id = $1 AND user_id = $2",
        [dayId, userId]
      );
      await client.query(
        "DELETE FROM exercises WHERE day_id = $1 AND user_id = $2",
        [dayId, userId]
      );

      const muscleIdMap = {};
      for (const muscle of muscles) {
        const res = await client.query(
          "INSERT INTO day_muscles (session_id, user_id, day_id, muscle) VALUES ($1, $2, $3, $4) RETURNING muscle_id",
          [sessionId, userId, dayId, muscle]
        );
        muscleIdMap[muscle] = res.rows[0].muscle_id;
      }

      for (const ex of exercises) {
        const muscleId =
          muscleIdMap[ex.target] || Object.values(muscleIdMap)[0];
        const exRes = await client.query(
          `INSERT INTO exercises (
            session_id, user_id, day_id, muscle_id, exercise_name,
            exercise_desc
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING exercise_id`,
          [sessionId, userId, dayId, muscleId, ex.name, ex.description || ""]
        );
        const exerciseId = exRes.rows[0].exercise_id;

        for (const rep of ex.reps) {
          await client.query(
            "INSERT INTO exercise_sets (user_id, exercise_id, no_of_reps, session_id) VALUES ($1, $2, $3, $4)",
            [userId, exerciseId, rep, sessionId]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Workout Updated Successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating workout:", err.message);
    res.status(500).send("Server error while updating workout");
  } finally {
    client.release();
  }
});

app.delete("/deletesession/:session_id", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  const userId = decoded.username;
  const sessionId = req.params.session_id;

  try {
    await pool.query(
      "DELETE FROM sessions WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    res.status(200).json({ message: "Workout saved successfully" });
  } catch (err) {
    console.error("Error deleting session:", err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
