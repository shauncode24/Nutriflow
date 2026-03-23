import pool from "../config/db.js";
import { fetchExercisesByMuscle } from "../services/exerciseService.js";

export const getExercise = async (req, res) => {
  const { muscle } = req.query;
  console.log("PARAMETER: ", muscle);

  if (!muscle) {
    return res.status(400).json({ error: "Missing muscle parameter" });
  }

  try {
    const data = await fetchExercisesByMuscle(muscle);
    res.json(data);
  } catch (error) {
    console.error("Error fetching exercise data:", error);
    res.status(500).json({ error: "Unable to fetch exercise data" });
  }
};

export const addWorkout = async (req, res) => {
  const { workoutName, selectedDays, selectedMuscles, workoutList } = req.body;
  const userId = req.userId;

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
              "INSERT INTO exercises (session_id, day_id, muscle_id, user_id, exercise_name, exercise_desc, sets, part, target, instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING exercise_id",
              [
                sessionId,
                dayId,
                muscleId,
                userId,
                exercise.name,
                exercise.description,
                exercise.sets,
                exercise.bodyPart,
                exercise.target,
                exercise.instructions,
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
};

export const getWorkouts = async (req, res) => {
  const userId = req.userId;

  try {
    const workoutRes = await pool.query(
      "SELECT * FROM sessions where user_id = $1",
      [userId]
    );
    res.json(workoutRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
};

export const getWorkoutSession = async (req, res) => {
  const userId = req.userId;
  const sessionId = req.params.session_id;
  const dayFilter = req.query.day || "";
  const logDate = req.query.date || new Date().toISOString().split("T")[0];

  let workoutListFiltered = {};

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

          const logsResult = await pool.query(
            `SELECT set_number, weight, reps FROM workout_logs WHERE exercise_id = $1 AND user_id = $2 AND log_date = $3 ORDER BY set_number ASC`,
            [exercise.exercise_id, userId, logDate]
          );
          const loggedSets = logsResult.rows;

          const mergedSets = sets.map((set, idx) => {
            const log = loggedSets.find((l) => l.set_number === idx + 1);
            return {
              setNumber: idx + 1,
              targetReps: set.no_of_reps,
              weight: log ? log.weight : "",
              reps: log ? log.reps : "",
            };
          });

          workoutList[dayName].push({
            bodyPart: exercise.body_part,
            equipment: exercise.equipment,
            id: exercise.exercise_id,
            name: exercise.exercise_name,
            target: exercise.target,
            part: exercise.part,
            secondaryMuscles: exercise.secondary_muscles || [],
            instructions: exercise.instructions || [],
            description: exercise.exercise_desc,
            difficulty: exercise.difficulty,
            category: exercise.category,
            sets: sets.length,
            reps: sets.map((s) => s.no_of_reps),
            mergedSets,
          });
        }
      }
    }

    if (dayFilter) {
      workoutListFiltered = workoutList[dayFilter];
      console.log("Filtered list", workoutListFiltered);
    }

    res.json({
      workoutName: session.session_name,
      selectedDays,
      workoutList,
      workoutListFiltered,
      selectedMuscles,
      exercises: {},
      workoutId: session.session_id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const updateWorkout = async (req, res) => {
  const userId = req.userId;
  const sessionId = req.params.session_id;
  const { workoutName, selectedDays, selectedMuscles, workoutList } = req.body;

  const client = await pool.connect();

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

    for (const dayName of selectedDays) {
      const inserted = await client.query(
        "INSERT INTO workout_days (session_id, user_id, day_name) VALUES ($1, $2, $3) RETURNING day_id",
        [sessionId, userId, dayName]
      );
      const dayId = inserted.rows[0].day_id;
      dayIdMap[dayName] = dayId;
    }

    for (const dayName of selectedDays) {
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
            exercise_desc, part, target, sets
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING exercise_id`,
          [
            sessionId,
            userId,
            dayId,
            muscleId,
            ex.name,
            ex.description || ex.exercise_desc,
            ex.part || ex.bodyPart,
            ex.target,
            ex.sets || "",
          ]
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
};

export const deleteSession = async (req, res) => {
  const userId = req.userId;
  const sessionId = req.params.session_id;

  try {
    await pool.query(
      "DELETE FROM sessions WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    await pool.query(
      "DELETE FROM workout_logs WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );
    res.status(200).json({ message: "Workout saved successfully" });
  } catch (err) {
    console.error("Error deleting session:", err.message);
    res.status(500).json({ error: "Failed to delete session" });
  }
};

export const saveWorkoutLogs = async (req, res) => {
  const { session_id, date, logs, dayName } = req.body;
  const userId = req.userId;

  const logDate = date || new Date().toISOString().split("T")[0];

  console.log("PAYLOAD", logs);

  try {
    // logs structure: { muscle: { exerciseId: { setNumber: { weight, reps } } } }
    for (const muscle in logs) {
      console.log("PAYLOAD MUSCLE", muscle);
      for (const exerciseId in logs[muscle]) {
        console.log("PAYLOAD EXERCISE ID", exerciseId);
        for (const setNumber in logs[muscle][exerciseId]) {
          console.log("PAYLOAD SETNUMBER", setNumber);

          const setData = logs[muscle][exerciseId][setNumber];
          console.log("PAYLOAD SET DATA", setData);

          const weight = setData.weight ? parseInt(setData.weight, 10) : null;
          const reps = setData.reps ? parseInt(setData.reps, 10) : null;

          console.log("WEIGHT:", weight, "REPS:", reps);

          await pool.query(
            `INSERT INTO workout_logs
              (session_id, user_id, workout_date, day_name, muscle, exercise_id, set_number, weight, reps, log_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (session_id, log_date, exercise_id, set_number)
             DO UPDATE SET weight = EXCLUDED.weight, reps = EXCLUDED.reps`,
            [
              session_id,
              userId,
              date,
              dayName,
              muscle,
              parseInt(exerciseId, 10),
              parseInt(setNumber, 10),
              weight,
              reps,
              logDate,
            ]
          );
        }
      }
    }

    res.status(200).json({ message: "Workout logs saved successfully" });
  } catch (err) {
    console.error("Error saving workout logs", err);
    res.status(500).json({ error: "Failed to save workout logs" });
  }
};