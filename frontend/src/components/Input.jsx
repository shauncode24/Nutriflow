import React, { useState, useEffect } from "react";

function Input(props) {
  return (
    <>
      <div className="input-div">
        <div className="input-label">{props.inputLabel}</div>
        <div className="input-field-div">
          <input
            type={props.type}
            className="input-field"
            placeholder={props.place}
            onChange={props.functionValue}
          ></input>
        </div>
      </div>
    </>
  );
}

export default Input;
