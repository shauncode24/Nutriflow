import "./Workout.css";
import SelectMuscle from "./components/SelectMuscle";
import Exercise from "./components/Exercise";
import AddedDay from "./components/AddedDay";
import DisplayWorkouts from "./components/DisplayWorkouts";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Workout() {
  const [workoutList, setWorkoutList] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedMuscles, setselectedMuscles] = useState({});
  const [exercises, setExercises] = useState({});
  const [fetchedExercises, setFetchedExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedSession, setSelectedSession] = useState(false);
  const [sessionId, setSessionId] = useState(0);

  const [selectedExerciseDay, setSelectedExerciseDay] = useState("");
  const [selectedExerciseMuscle, setSelectedExerciseMuscle] = useState("");

  const targetToApiMuscle = {
    biceps: "upper arms",
    triceps: "upper arms",
    forearms: "lower arms",
    core: "waist",
    chest: "chest",
    back: "back",
    shoulders: "shoulders",
    "upper legs": "upper legs",
    "lower legs": "lower legs",
    cardio: "cardio",
    neck: "neck",
  };

  const handleAddMuscle = (day, muscle) => {
    const { bodyPart, target } = muscle;

    setselectedMuscles((prev) => {
      const existing = prev[day] || [];
      if (!muscle || existing.includes(muscle)) return prev;
      return {
        ...prev,
        [day]: [...existing, muscle],
      };
    });
  };

  const handleRemoveMuscle = (day, muscle) => {
    setselectedMuscles((prev) => {
      return {
        ...prev,
        [day]: prev[day].filter((m) => m != muscle),
      };
    });
  };

  const handleAddExercise = (day, exercise) => {
    setWorkoutList((prev) => {
      const updated = { ...prev };

      const newExercise = {
        ...exercise,
        sets: 0,
        reps: [],
      };

      updated[day] = [...(updated[day] || []), newExercise];
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

      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const handleDeleteExercise = (day, exerciseToRemove) => {
    setWorkoutList((prev) => {
      const newList = { ...prev };
      newList[day] = newList[day].filter((ex) => ex !== exerciseToRemove);
      return newList;
    });
  };

  useEffect(() => {
    console.log({
      workoutList,
      selectedDays,
      workoutName,
      selectedMuscles,
      exercises,
    });
  }, [workoutList, selectedDays, workoutName, selectedMuscles, exercises]);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!selectedExerciseMuscle) return;

      const apiMuscle = targetToApiMuscle[selectedExerciseMuscle];
      console.log("INPUT MUSCLE: ", selectedExerciseMuscle);

      try {
        const response = await axios.get(
          `http://localhost:4000/getexercise?muscle=${apiMuscle}`
        );

        if (
          selectedExerciseMuscle.toLowerCase() === "biceps" ||
          selectedExerciseMuscle.toLowerCase() === "triceps"
        ) {
          console.log("IN THE FILTER");
          console.log(
            "All targets:",
            response.data.map((ex) => ex.target)
          );
          console.log("Selected target:", selectedExerciseMuscle);

          const filteredExercises = [];
          response.data.forEach((exercise) => {
            if (exercise.target === selectedExerciseMuscle) {
              filteredExercises.push(exercise);
              console.log("YESSSS");
              console.log(filteredExercises);
            }
          });

          // const filteredExercise = response.data.filter(
          //   (exercise) =>
          //     exercise.target.toLowerCase().trim() ===
          //     selectedExerciseMuscle.toLowerCase().trim()
          // );

          setFetchedExercises(filteredExercises);
        } else {
          setFetchedExercises(response.data);
        }

        console.log("FETCHED", fetchedExercises);
      } catch (err) {
        console.log("Error fetching api data");
      }
    };

    fetchExercises();
  }, [selectedExerciseMuscle]);

  const handleViewWorkout = async (sessionId) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/getworkoutsession/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const workoutData = res.data.workoutList;
      setWorkoutList(res.data.workoutList);
      setWorkoutName(res.data.workoutName);
      setSelectedDays(res.data.selectedDays);
      setselectedMuscles(res.data.selectedMuscles);
      setSessionId(res.data.workoutId);
      console.log("Fetched Session Records: ", res.data);
      console.log("Muscles Fetched: ", selectedMuscles);

      setSelectedSession(true);
      setWorkoutList(workoutData);
    } catch (err) {
      console.error("Error fetching workout details: ", err);
    }
  };

  const handleSaveWorkout = async () => {
    try {
      const payload = {
        workoutName,
        selectedDays,
        selectedMuscles,
        workoutList,
      };

      const res = await fetch("http://localhost:4000/addworkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("sent to back", JSON.stringify(payload));
      const data = await res.json();
      console.log("Saved workout: ", data);
      fetchWorkouts();
    } catch (err) {
      console.log("Error while saving data: ", err);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/getworkouts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setWorkoutPlans(res.data);
      console.log("sessions from backend: ", res.data);
      console.log("Refetched workouts after saving");
    } catch (err) {
      console.error("Error fetching workout plans: ", err);
    }
  };

  const handleUpdateWorkout = async (sessionId) => {
    try {
      const payload = {
        workoutName,
        selectedDays,
        selectedMuscles,
        workoutList,
      };

      const res = await axios.put(
        `http://localhost:4000/updateworkout/${sessionId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({}),
        }
      );

      // const data = await res.json();

      if (res.ok) {
        console.log("Workout updated successfully");
      } else {
        console.log("Error updating workout");
      }
    } catch (err) {
      console.error("Error updating workout plans: ", err);
    }
  };

  const handleDeleteWorkout = async (sessionId) => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/deletesession/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      await fetchWorkouts();
    } catch (err) {
      console.error("Error deleting workout plans: ", err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <>
      <div className="default workout-body">
        <div className="display-workouts-div">
          <div className="display-workours-header">
            <div className="display-workouts-title"></div>
            <div className="display-workouts-button-div">
              <button type="submit">Add A New Plan</button>
            </div>
          </div>

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
        </div>

        <div className="default workout-main">
          <div className="default header-div">
            <div className="default header">Workout Planner</div>
            <div className="default subheading">
              Create you personalized workout plan
            </div>
          </div>

          <div className="default name-div">
            <div className="default name">Workout Name</div>
            <div className="default input-name-div">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              ></input>
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
                  className={`default day ${
                    selectedDays.includes(day) ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedDays((prev) =>
                      prev.includes(day)
                        ? prev.filter((d) => d !== day)
                        : [...prev, day]
                    );
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="default muscles-div">
            <div className="default muscles-div-title">Assign Body Parts</div>
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
                {(selectedMuscles[selectedExerciseDay] || []).map((muscle) => (
                  <option key={muscle} value={muscle}>
                    {muscle}
                  </option>
                ))}
              </select>
            </div>
            <div className="default exercises-subtitle">Chest Workout</div>
            <div className="default exercises-body">
              <div className="default exercises-body">
                {fetchedExercises.map((ex, idx) => (
                  <Exercise
                    key={idx}
                    exercise={ex.name}
                    desc={ex.description}
                    img={ex.gifUrl}
                    onAdd={() => handleAddExercise(selectedExerciseDay, ex)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="default output-div">
            <div className="default output-title">Your Workout Plan</div>
            <div className="default output-body">
              {selectedDays.map((day, idx) => (
                <AddedDay
                  key={idx}
                  day={day}
                  exercises={workoutList[day] || []}
                  onDelete={handleDeleteExercise}
                  onUpdate={(exerciseName, updatedData) =>
                    handleUpdatedExercise(day, exerciseName, updatedData)
                  }
                />
              ))}
            </div>
          </div>

          <div className="default footer-div">
            <button type="button" onClick={handleSaveWorkout}>
              Add
            </button>
            <button
              type="button"
              onClick={() => handleUpdateWorkout(sessionId)}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Workout;
