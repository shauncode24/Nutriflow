import SelectedMuscle from "./SelectedMuscle";

export default function SelectMuscle(props) {
  const muscles = props.muscle || [];

  const handleChange = (e) => {
    props.onAddMuscle(props.day, e.target.value);
    e.target.selectedIndex = 0;
  };

  return (
    <>
      <div className="default select-div">
        <div className="default select-day">{props.day}</div>
        <div className="default select-muscle">
          <div className="default selected-muscle">
            {muscles.map((muscle, idx) => (
              <SelectedMuscle
                key={idx}
                muscle={muscle}
                onDelete={() => props.onRemoveMuscle(props.day, muscle)}
              />
            ))}
          </div>
          <select id="muscle" name="muscle" onChange={handleChange}>
            <option value="" disabled selected>
              Select an option
            </option>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="shoulders">Shoulders</option>
            <option value="biceps">Biceps</option>
            <option value="triceps">Triceps</option>
            <option value="forearms">Forearms</option>
            <option value="upper legs">Upper Legs</option>
            <option value="lower legs">Lower Legs</option>
            <option value="abs">Abs</option>
            <option value="cardio">Cardio</option>
            <option value="neck">Neck</option>
          </select>
        </div>
      </div>
    </>
  );
}