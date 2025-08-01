import { useEffect, useState } from "react";
import AddedExercise from "./AddedExercise";

export default function (props) {
  useEffect(() => {
    console.log("Added day", props.exercise);
  }, []);

  return (
    <>
      <div className="default added-day-div">
        <div className="default added-day-div-title">{props.day}</div>
        <div className="default added-day-div-content">
          {props.exercises.map((exercise, idx) => (
            <AddedExercise
              key={idx}
              exercise={exercise}
              onDelete={() => props.onDelete(props.day, exercise)}
              onUpdate={(data) => props.onUpdate(exercise.name, data)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
