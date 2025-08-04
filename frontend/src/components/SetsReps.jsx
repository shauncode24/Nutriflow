export default function SetReps(props) {
  return (
    <div className="default-tracker tracker-part-body-info">
      <div className="default-tracker number-div">
        <div className="default-tracker number">1</div>
      </div>
      <div className="default-tracker set-rep-div">
        <input type="number" /> &nbsp; kg &nbsp; &nbsp; &nbsp;
        <input type="number" />
        &nbsp; reps
      </div>
      <div className="default-tracker tick-div">
        <div className="default-tracker tick"></div>
      </div>
    </div>
  );
}
