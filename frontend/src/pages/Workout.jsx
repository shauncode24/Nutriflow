import "../styles/Workout.css";
import SelectMuscle from "../components/workout/SelectMuscle";
import Exercise from "../components/workout/Exercise";
import AddedDay from "../components/workout/AddedDay";
import DisplayWorkouts from "../components/workout/DisplayWorkouts";
import { Link } from "react-router-dom";
import { useWorkout } from "../hooks/useWorkout";

function Workout() {
  const {
    workoutList,
    selectedDays,
    workoutName, setWorkoutName,
    selectedMuscles,
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
  } = useWorkout();

  return (
    <>
      <div className="default workout-body">
        <div className="default page-header"></div>

        <div className="default workout-header">
          <div className="default workout-header-top">
            Workout Plans
            <br />
            <p>Manage and track your personalized workout routines</p>
          </div>
          <div className="default workout-header-bottom">
            <div className="default workout-header-bottom-left">
              My Workout Plans
            </div>
            <div className="default workout-header-bottom-right">
              <button type="submit" onClick={() => makePlannerVisible()}>
                {!selectedSession ? "Add A New Plan" : "Close Planner"}
              </button>
            </div>
          </div>
        </div>

        {!selectedSession && (
          <div className="default display-workouts-body">
            {workoutPlans.map((session) => (
              <DisplayWorkouts
                session={session}
                key={session.session_id}
                onView={handleViewWorkout}
                onDelete={handleDeleteWorkout}
                link="/track"
              />
            ))}
          </div>
        )}

        {selectedSession && (
          <div className="default workout-main">
            <div className="default header-div">
              <div className="default header">Workout Planner</div>
              <div className="default subheading">
                Create your personalized workout plan
              </div>
            </div>

            <div className="default name-div">
              <div className="default name">Workout Name</div>
              <div className="default input-name-div">
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                />
              </div>
            </div>

            <div className="default days-div">
              <div className="default days-div-title">Select Days</div>
              <div className="default days">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className={`default day ${selectedDays.includes(day) ? "selected" : ""
                      }`}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {selectedDays.length > 0 && (
              <div className="default muscles-div">
                <div className="default muscles-div-title">
                  Assign Body Parts
                </div>
                <div className="default muscles-body">
                  {selectedDays.map((day, idx) => (
                    <SelectMuscle
                      day={day}
                      key={idx}
                      muscle={selectedMuscles[day] || ""}
                      onAddMuscle={handleAddMuscle}
                      onRemoveMuscle={handleRemoveMuscle}
                    />
                  ))}
                </div>
              </div>
            )}

            {Object.values(selectedMuscles).some((arr) => arr.length > 0) && (
              <div className="default exercises-div">
                <div className="default exercises-title">Select Workout</div>
                <div className="default exercises-options-div">
                  <select
                    id="day"
                    name="day"
                    className="exercises-dropdown"
                    value={selectedExerciseDay}
                    onChange={(e) => {
                      setSelectedExerciseDay(e.target.value);
                      setSelectedExerciseMuscle("");
                    }}
                  >
                    <option value="" disabled selected>
                      Select Day
                    </option>
                    {selectedDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>

                  <select
                    id="muscle"
                    name="muscle"
                    className="exercises-dropdown"
                    value={selectedExerciseMuscle}
                    onChange={(e) => setSelectedExerciseMuscle(e.target.value)}
                    disabled={!selectedExerciseDay}
                  >
                    <option value="" disabled selected>
                      Select an option
                    </option>
                    {(selectedMuscles[selectedExerciseDay] || []).map(
                      (muscle) => (
                        <option key={muscle} value={muscle}>
                          {muscle}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="default exercises-subtitle">
                  {selectedExerciseMuscle} Workouts
                </div>
                <div className="default exercises-body">
                  {fetchedExercises.map((ex, idx) => (
                    <Exercise
                      key={idx}
                      exercise={ex.name}
                      desc={ex.description}
                      img={
                        ex.gifUrl ||
                        "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                      }
                      onAdd={() => handleAddExercise(selectedExerciseDay, ex)}
                    />
                  ))}
                </div>
              </div>
            )}

            {Object.values(workoutList).some(
              (dayArray) => dayArray.length > 0
            ) && (
                <div className="default output-div">
                  <div className="default output-title">Your Workout Plan</div>
                  <div className="default output-body">
                    {selectedDays.map((day, idx) => (
                      <AddedDay
                        key={idx}
                        day={day}
                        selectedMuscle={selectedMuscles[day] || []}
                        exercises={workoutList[day] || []}
                        onDelete={handleDeleteExercise}
                        onUpdate={(exerciseName, updatedData) =>
                          handleUpdatedExercise(day, exerciseName, updatedData)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

            <div className="default footer-div">
              {!status ? (
                <button
                  className={
                    Object.values(workoutList).some((day) =>
                      day.some((exercise) => exercise.sets > 0)
                    ) && workoutName
                      ? "footer-button has-sets"
                      : "footer-button no-workouts"
                  }
                  type="button"
                  onClick={handleSaveWorkout}
                >
                  Add
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateWorkout(sessionId)}
                  className={
                    Object.values(workoutList).some((day) =>
                      day.some((exercise) => exercise.sets > 0)
                    ) && workoutName
                      ? "footer-button has-sets"
                      : "footer-button no-workouts"
                  }
                >
                  Update
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Workout;