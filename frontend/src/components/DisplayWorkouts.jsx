export default function DisplayWorkouts(props) {
  return (
    <div
      className="display-workout"
      style={{ width: "300px", height: "300px", backgroundColor: "cyan" }}
    >
      <div className="display-workouts-body-title">
        {props.session.session_name}
      </div>
      <div className="display-workouts-body-desc">Desc</div>
      <div className="buttons">
        <button type="submit">Pause</button>
        <button
          type="button"
          onClick={() => props.onView(props.session.session_id)}
        >
          View
        </button>
        <button type="submit">Edit</button>
        <button
          type="button"
          onClick={() => props.onDelete(props.session.session_id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
