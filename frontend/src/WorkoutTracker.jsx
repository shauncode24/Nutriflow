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
  }, [session_id]);

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
              list={workout.wokoutListUpdated}
            />
          ))}
        </div>
      </div>
    </>
  );
}
