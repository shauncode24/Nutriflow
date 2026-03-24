import { useState, useEffect } from "react";
import {
  fetchExercises,
  fetchWorkouts,
  fetchWorkoutSession,
  saveWorkout,
  updateWorkout,
  deleteWorkout,
} from "../api/workoutApi";

const TARGET_TO_API_MUSCLE = {
  biceps: "upper arms",
  triceps: "upper arms",
  forearms: "lower arms",
  abs: "waist",
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  "upper legs": "upper legs",
  "lower legs": "lower legs",
  cardio: "cardio",
  neck: "neck",
};

export const useWorkout = () => {
  const [workoutList, setWorkoutList] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState({});
  const [exercises, setExercises] = useState({});
  const [fetchedExercises, setFetchedExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedSession, setSelectedSession] = useState(false);
  const [sessionId, setSessionId] = useState(0);
  const [status, setStatus] = useState(0);
  const [selectedExerciseDay, setSelectedExerciseDay] = useState("");
  const [selectedExerciseMuscle, setSelectedExerciseMuscle] = useState("");

  const loadWorkouts = async () => {
    try {
      const data = await fetchWorkouts();
      setWorkoutPlans(data);
      console.log("sessions from backend: ", data);
    } catch (err) {
      console.error("Error fetching workout plans: ", err);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    console.log({ workoutList, selectedDays, workoutName, selectedMuscles, exercises });
  }, [workoutList, selectedDays, workoutName, selectedMuscles, exercises]);

  useEffect(() => {
    const loadExercises = async () => {
      if (!selectedExerciseMuscle) return;

      const apiMuscle = TARGET_TO_API_MUSCLE[selectedExerciseMuscle];
      console.log("INPUT MUSCLE: ", selectedExerciseMuscle);

      try {
        const data = await fetchExercises(apiMuscle);

        if (
          selectedExerciseMuscle.toLowerCase() === "biceps" ||
          selectedExerciseMuscle.toLowerCase() === "triceps"
        ) {
          console.log("IN THE FILTER");
          console.log("All targets:", data.map((ex) => ex.target));
          console.log("Selected target:", selectedExerciseMuscle);

          const filteredExercises = [];
          data.forEach((exercise) => {
            if (exercise.target === selectedExerciseMuscle) {
              filteredExercises.push(exercise);
            }
          });

          setFetchedExercises(filteredExercises);
        } else {
          setFetchedExercises(data);
        }

        console.log("FETCHED", fetchedExercises);
      } catch (err) {
        console.log("Error fetching api data");
      }
    };

    loadExercises();
  }, [selectedExerciseMuscle]);

  const handleAddMuscle = (day, muscle) => {
    setSelectedMuscles((prev) => {
      const existing = prev[day] || [];
      if (!muscle || existing.includes(muscle)) return prev;
      return { ...prev, [day]: [...existing, muscle] };
    });
  };

  const handleRemoveMuscle = (day, muscle) => {
    setSelectedMuscles((prev) => ({
      ...prev,
      [day]: prev[day].filter((m) => m !== muscle),
    }));
  };

  const handleAddExercise = (day, exercise) => {
    setWorkoutList((prev) => {
      const updated = { ...prev };
      const newExercise = { ...exercise, sets: 0, reps: [] };
      const workoutsForDay = updated[day] || [];
      const alreadyExists = workoutsForDay.some((w) => w.id === exercise.id);
      if (alreadyExists) {
        console.log("Already exists");
        return prev;
      }
      updated[day] = [...workoutsForDay, newExercise];
      return updated;
    });
  };

  const handleUpdatedExercise = (day, exerciseName, updatedData) => {
    setWorkoutList((prev) => {
      const updatedDay = (prev[day] || []).map((exercise) =>
        exercise.name === exerciseName
          ? { ...exercise, ...updatedData }
          : exercise
      );
      return { ...prev, [day]: updatedDay };
    });
  };

  const handleDeleteExercise = (day, exerciseToRemove) => {
    setWorkoutList((prev) => {
      const newList = { ...prev };
      newList[day] = newList[day].filter((ex) => ex !== exerciseToRemove);
      if (newList[day].length === 0) delete newList[day];
      return newList;
    });
  };

  const handleViewWorkout = async (sessionId) => {
    try {
      const data = await fetchWorkoutSession(sessionId);
      setWorkoutList(data.workoutList);
      setWorkoutName(data.workoutName);
      setSelectedDays(data.selectedDays);
      setSelectedMuscles(data.selectedMuscles);
      setSessionId(data.workoutId);
      console.log("Fetched Session Records: ", data);
      setSelectedSession(true);
      setStatus(1);
    } catch (err) {
      console.error("Error fetching workout details: ", err);
    }
  };

  const handleSaveWorkout = async () => {
    try {
      const payload = { workoutName, selectedDays, selectedMuscles, workoutList };
      const data = await saveWorkout(payload);
      console.log("Saved workout: ", data);
      await loadWorkouts();
      setSelectedSession(false);
      setWorkoutList({});
      setExercises({});
      setSelectedDays([]);
      setSelectedMuscles({});
      setWorkoutName("");
    } catch (err) {
      console.log("Error while saving data: ", err);
    }
  };

  const handleUpdateWorkout = async (sessionId) => {
    try {
      const payload = { workoutName, selectedDays, selectedMuscles, workoutList };
      const res = await updateWorkout(sessionId, payload);
      console.log("Workout updated successfully");
      setSelectedSession(false);
      await loadWorkouts();
      setStatus(0);
    } catch (err) {
      console.error("Error updating workout plans: ", err);
    }
  };

  const handleDeleteWorkout = async (sessionId) => {
    try {
      await deleteWorkout(sessionId);
      await loadWorkouts();
    } catch (err) {
      console.error("Error deleting workout plans: ", err);
    }
  };

  const makePlannerVisible = () => {
    if (selectedSession) {
      setWorkoutList({});
      setExercises({});
      setSelectedDays([]);
      setSelectedMuscles({});
      setWorkoutName("");
      setStatus(0);
    }
    setSelectedSession(!selectedSession);
  };

  const handleDayToggle = (day) => {
    setSelectedDays((prevDays) => {
      if (prevDays.includes(day)) {
        setSelectedMuscles((prevMuscles) => {
          const updated = { ...prevMuscles };
          delete updated[day];
          return updated;
        });
        setWorkoutList((prevWorkout) => {
          const updated = { ...prevWorkout };
          delete updated[day];
          return updated;
        });
        return prevDays.filter((d) => d !== day);
      } else {
        return [...prevDays, day];
      }
    });
  };

  return {
    workoutList,
    selectedDays,
    workoutName, setWorkoutName,
    selectedMuscles,
    exercises,
    fetchedExercises,
    workoutPlans,
    selectedSession,
    sessionId,
    status,
    selectedExerciseDay, setSelectedExerciseDay,
    selectedExerciseMuscle, setSelectedExerciseMuscle,
    handleAddMuscle,
    handleRemoveMuscle,
    handleAddExercise,
    handleUpdatedExercise,
    handleDeleteExercise,
    handleViewWorkout,
    handleSaveWorkout,
    handleUpdateWorkout,
    handleDeleteWorkout,
    makePlannerVisible,
    handleDayToggle,
  };
};