import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Card(props) {
  return (
    <>
      <div className="main-default internal-main">
        <div className="main-default card-image-div">
          <img src={props.image} alt="image" className={props.height} />
        </div>
        <div className="main-default card-title">{props.title}</div>
        <div className="main-default card-description">{props.description}</div>
        <div className="main-default card-button-div">
          <Link to={props.link} className="main-default card-button">
            {props.buttontitle}
          </Link>
        </div>
      </div>
    </>
  );
}

export default Card;
