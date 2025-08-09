import { useState } from "react";

export default function SetReps(props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const handleChange = (newWeight, newReps) => {
    props.onLogChange(
      props.day,
      props.muscle,
      props.exerciseId,
      props.setNumber,
      newWeight,
      newReps
    );
  };

  return (
    <div className="default-tracker tracker-part-body-info">
      <div className="default-tracker number-div">
        <div className="default-tracker number">{props.setNumber}</div>
      </div>
      <div className="default-tracker set-rep-div">
        <input
          type="number"
          value={weight}
          onChange={(e) => {
            const newWeight = e.target.value;
            setWeight(newWeight);
            handleChange(newWeight, reps); // pass new weight + existing reps
          }}
        />
        &nbsp; kg &nbsp; &nbsp; &nbsp;
        <input
          type="number"
          value={reps}
          onChange={(e) => {
            const newReps = e.target.value;
            setReps(newReps);
            handleChange(weight, newReps); // pass existing weight + new reps
          }}
        />
        &nbsp; reps
      </div>
      <div className="default-tracker tick-div">
        target: {props.targetReps}
        <div className="default-tracker tick"></div>
      </div>
    </div>
  );
}
