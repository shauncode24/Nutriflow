import { useState, useEffect } from "react";

export default function AddedExercise(props) {
  const [sets, setSets] = useState(props.exercise.sets || 0);
  const [reps, setReps] = useState(props.exercise.reps || []);

  useEffect(() => {
    const newReps = Array(sets)
      .fill(0)
      .map((_, i) => reps[i] || 0);
    setReps(newReps);
    props.onUpdate({ sets, reps: newReps });
  }, [sets]);

  useEffect(() => {
    props.onUpdate({ sets, reps });
  }, [reps]);

  // Update parent when rep values change
  const handleRepChange = (idx, value) => {
    const updatedReps = [...reps];
    updatedReps[idx] = parseInt(value) || 0;
    setReps(updatedReps);
    props.onUpdate({ sets, reps: updatedReps });
  };

  return (
    <>
      <div className="default exercise-added-div">
        <div className="default exercise-added-title">
          {props.exercise.name}
        </div>
        <div className="default exercise-added-sets">
          <input
            type="number"
            className="sets-input"
            placeholder="Sets"
            min="0"
            value={sets}
            onChange={(e) => setSets(parseInt(e.target.value))}
          />
        </div>
        <div className="default exercise-added-reps">
          {reps.map((rep, idx) => (
            <input
              key={idx}
              type="number"
              className="reps-input"
              placeholder={`Rep ${idx + 1}`}
              min="0"
              value={rep}
              onChange={(e) => handleRepChange(idx, e.target.value)}
            />
          ))}
        </div>
        <div className="default delete-icon" onClick={props.onDelete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            class="bi bi-x"
            viewBox="0 0 16 16"
          >
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </div>
      </div>
    </>
  );
}
