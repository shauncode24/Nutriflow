import "../styles/WorkoutTracker.css";
import SelectedPart from "../components/tracker/SelectedPart";
import { useParams } from "react-router-dom";
import { useWorkoutTracker } from "../hooks/useWorkoutTracker";

export default function WorkoutTracker() {
  const { session_id } = useParams();

  const {
    workout,
    dayName,
    dateString,
    goPreviousDate,
    goNextDate,
    handleLogChange,
    handleSave,
  } = useWorkoutTracker(session_id);

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
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
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
                className="bi bi-arrow-right"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
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

        <button onClick={handleSave} className="default-tracker track-button">
          Save Workout
        </button>
      </div>
    </>
  );
}