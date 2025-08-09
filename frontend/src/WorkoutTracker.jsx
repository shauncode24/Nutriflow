import { Link } from "react-router-dom";
import "./WorkoutTracker.css";
import SelectedExercise from "./components/SelectedExercise";
import SelectedPart from "./components/SelectedPart";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import SelectedMuscle from "./components/SelectedMuscle";

export default function WorkoutTracker(props) {
  const { session_id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(null);
  const [trackerData, setTrackerData] = useState({});

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"
  const dateString = today.toISOString().split("T")[0];

  useEffect(() => {
    const fetchWorkoutSession = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/getworkoutsession/${session_id}?day=${dayName}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setWorkout(res.data);
        console.log("Secondary Fetch", res.data);
      } catch (err) {
        console.error("Error fetching session", err);
      }
    };

    fetchWorkoutSession();
  }, [session_id, dayName]);

  const handleLogChange = (
    day,
    muscle,
    exerciseId,
    setNumber,
    weight,
    reps
  ) => {
    setTrackerData((prev) => {
      const newData = { ...prev };
      if (!newData[day]) newData[day] = {};
      if (!newData[day][muscle]) newData[day][muscle] = {};
      if (!newData[day][muscle][exerciseId])
        newData[day][muscle][exerciseId] = {};
      newData[day][muscle][exerciseId][setNumber] = { weight, reps };
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      await axios.post(
        "http://localhost:4000/saveworkoutlogs",
        {
          session_id,
          date: today.toISOString().split("T")[0],
          logs: trackerData,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Workout logged successfully!");
    } catch (err) {
      console.error("Error saving workout logs", err);
    }
  };

  useEffect(() => {
    console.log("Tracker", trackerData);
  }, [trackerData]);

  return (
    <>
      <div className="default-tracker tracker-body">
        <div className="default-tracker tracker-header">Workout Tracker</div>
        <div className="default-tracker tracker-main">
          {workout?.selectedMuscles[dayName]?.map((muscle, idx) => (
            <SelectedPart
              key={idx}
              day={dayName}
              part={muscle}
              list={workout.workoutListFiltered}
              onLogChange={handleLogChange}
            />
          ))}
        </div>
        <button onClick={handleSave}>Save Workout</button>
      </div>
    </>
  );
}
