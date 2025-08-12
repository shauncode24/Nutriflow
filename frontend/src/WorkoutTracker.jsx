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
  const [currentDate, seetCurrentDate] = useState(new Date());

  // const today = new Date();
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"
  const dateString = currentDate.toISOString().split("T")[0];

  const goPreviousDate = () => {
    seetCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
    setTrackerData({});
  };

  const goNextDate = () => {
    seetCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
    setTrackerData({});
  };

  useEffect(() => {
    const fetchWorkoutSession = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/getworkoutsession/${session_id}?day=${dayName}&date=${dateString}`,
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
  }, [session_id, dayName, dateString]);

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
          date: currentDate.toISOString().split("T")[0],
          logs: trackerData[dayName] || {},
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
        <div className="default-tracker tracker-header">
          <div className="default-tracker tracker-header-left">
            Workout Tracker
            <p>{workout?.workoutName}</p>
          </div>
          <div className="default-tracker tracker-header-right">
            <button onClick={goPreviousDate} className="default-tracker">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
            </button>
            {dateString} ({dayName})
            <button onClick={goNextDate} className="default-tracker">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-arrow-right"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                />
              </svg>
            </button>
          </div>
        </div>
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
