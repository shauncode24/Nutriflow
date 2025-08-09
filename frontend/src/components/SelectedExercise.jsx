import SetReps from "./SetsReps";

export default function SelectedExercise(props) {
  return (
    <div className="default-tracker tracker-part-body">
      <div className="default-tracker tracker-part-body-exercise">
        {props.exercise.name}
      </div>

      {[...Array(props.exercise.sets)].map((_, i) => (
        <SetReps
          key={i}
          day={props.day}
          muscle={props.muscle}
          exerciseId={props.exercise.id}
          targetReps={props.exercise.reps[i]}
          setNumber={i + 1}
          onLogChange={props.onLogChange}
        />
      ))}
    </div>
  );
}
