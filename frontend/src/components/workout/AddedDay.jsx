import { useEffect } from "react";
import AddedExercise from "./AddedExercise";

export default function AddedDay(props) {
  useEffect(() => {
    console.log("Added day", props.exercise);
  }, []);

  return (
    <>
      <div className="default added-day-div">
        <div className="default added-day-div-title">{props.day}</div>
        <div className="default added-day-div-content">
          {props.selectedMuscle?.map((muscle, idx) => (
            <div className="default specific-div" key={idx}>
              <p>{muscle}</p>
              {props.exercises
                .filter(
                  (exercise) =>
                    exercise.target === muscle ||
                    exercise.bodyPart === muscle ||
                    exercise.part === muscle
                )
                .map((exercise, eIdx) => (
                  <AddedExercise
                    key={eIdx}
                    exercise={exercise}
                    onDelete={() => props.onDelete(props.day, exercise)}
                    onUpdate={(data) => props.onUpdate(exercise.name, data)}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}