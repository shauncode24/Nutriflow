export default function Exercise(props) {
  return (
    <>
      <div className="default exercise-div">
        <div className="default exercise-img-div">
          <img src={props.img} height="100px"></img>
        </div>
        <div className="default row-1">
          <div className="default exercise-heading">
            <div className="default exercise-title">{props.exercise}</div>
            <div className="default exercise-button-div">
              <button
                type="button"
                onClick={props.onAdd}
                className="default exercise-button"
              >
                Add
              </button>
            </div>
          </div>

          <div className="default exercise-body">{props.desc}</div>
        </div>
      </div>
    </>
  );
}
