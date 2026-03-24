import SelectedExercise from "./SelectedExercise";

export default function SelectedPart(props) {
  return (
    <div className="default-tracker tracker-part">
      <div className="default-tracker tracker-part-header">{props.part}</div>
      {props.list?.map((part, idx) => {
        if (props.part === part.target || props.part === part.part) {
          return (
            <SelectedExercise
              key={idx}
              day={props.day}
              muscle={props.part}
              exercise={part}
              list={part}
              onLogChange={props.onLogChange}
            />
          );
        }
        return null; // don't render anything if condition fails
      })}
    </div>
  );
}
