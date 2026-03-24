export default function Features(props) {
  return (
    <>
      <div className="landing feature">
        <div className="landing img-container">
          <img src={props.img} alt="Feature Image" height="100%" width="100%" />
        </div>
        <h4>{props.feature}</h4>
        <p>{props.desc}</p>
      </div>
    </>
  );
}