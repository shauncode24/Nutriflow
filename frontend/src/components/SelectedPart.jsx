import SelectedExercise from "./SelectedExercise";

export default function SelectedPart(props) {
  return (
    <div className="default-tracker tracker-part">
      <div className="default-tracker tracker-part-header">{props.part}</div>

      <SelectedExercise />
      <SelectedExercise />
    </div>
  );
}
