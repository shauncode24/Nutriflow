import { useState, useEffect } from "react";

export default function SetReps(props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  useEffect(() => {
    setWeight(props.initialWeight || "");
    setReps(props.initialReps || "");
  }, [props.initialWeight, props.initialReps]);

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
          min="0"
          onChange={(e) => {
            const newWeight = e.target.value;
            setWeight(newWeight);
            handleChange(newWeight, reps);
          }}
        />
        &nbsp; kg &nbsp; &nbsp; &nbsp;
        <input
          type="number"
          value={reps}
          min="0"
          onChange={(e) => {
            const newReps = e.target.value;
            setReps(newReps);
            handleChange(weight, newReps);
          }}
        />
        &nbsp; reps
      </div>
      <div className="default-tracker tick-div">
        <p>Target Reps: {props.targetReps}</p>
        <div className="default-tracker tick"></div>
      </div>
    </div>
  );
}