function Quantities(props) {
  return (
    <>
      <div className="plan-default daily-summary-body-div">
        <div className="plan-default daily-summary-body-div-title">
          {props.title}
        </div>
        <div className="plan-default daily-summary-body-div-content">
          {props.subtitle}
        </div>
      </div>
    </>
  );
}

export default Quantities;