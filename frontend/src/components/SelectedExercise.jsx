import SetReps from "./SetsReps";

export default function SelectedExercise(props) {
  return (
    <div className="default-tracker tracker-part-body">
      <div className="default-tracker tracker-part-body-exercise">
        {props.exercise.name}
      </div>

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
