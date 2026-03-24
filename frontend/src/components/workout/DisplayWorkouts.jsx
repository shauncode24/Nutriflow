import { Link } from "react-router-dom";
import "../../styles/Workout.css";

export default function DisplayWorkouts(props) {
  return (
    <div className="default display-workout">
      <div className="default display-workouts-body-title">
        {props.session.session_name}
      </div>
      <div className="default display-workouts-body-desc">Desc</div>
      <div className="default buttons">
        <button type="submit" className="default action-btn pause">
          Pause
        </button>
        <button
          type="button"
          className="default action-btn view"
          onClick={() => props.onView(props.session.session_id)}
        >
          View
        </button>
        <Link
          to={`${props.link}/${props.session.session_id}`}
          className="default action-btn track"
        >
          Track
        </Link>
        <button
          type="button"
          onClick={() => props.onDelete(props.session.session_id)}
          className="default action-btn delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
}