import SetReps from "./SetsReps";
import { useEffect, useState } from "react";

export default function SelectedExercise(props) {
  const fixedString = props.exercise.instructions
    .replace(/^{/, "[")
    .replace(/}$/, "]");
  const instructions = JSON.parse(fixedString);

  const [info, setInfo] = useState();

  const updateInfo = () => {
    setInfo(!info);
  };

  return (
    <div className="default-tracker tracker-part-body">
      <div className="default-tracker tracker-part-body-exercise">
        <div className="default-tracker tracker-part-body-exercise-left">
          <span>{props.exercise.name}</span>
          <p>{props.exercise.description}</p>
        </div>
        <div className="default-tracker tracker-part-body-exercise-right">
          <div className="default-tracker icon" onClick={updateInfo}>
            i
          </div>
        </div>
      </div>

      {info && (
        <div className="default-tracker steps">
          <span className="title">How to Perform:</span>
          {instructions.map((step, i) => (
            <p key={i} className="default-tracker">
              <span className="default-tracker counter">{i + 1}</span> {step}
            </p>
          ))}
        </div>
      )}

      {[...Array(props.exercise.sets)].map((_, i) => {
        const existingLog = props.exercise.mergedSets?.find(
          (log) => log.setNumber === i + 1
        );
        return (
          <SetReps
            key={i}
            day={props.day}
            muscle={props.muscle}
            exerciseId={props.exercise.id}
            targetReps={props.exercise.reps[i]}
            setNumber={i + 1}
            initialWeight={existingLog?.weight || ""}
            initialReps={existingLog?.reps || ""}
            onLogChange={props.onLogChange}
          />
        );
      })}
    </div>
  );
}
