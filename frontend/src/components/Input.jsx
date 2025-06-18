import React, { useState, useEffect } from 'react'

function Input(props) {
    return(
        <>
            <div className = "input-div">
                <div class = "input-label">{props.inputLabel}</div>
                <div class = "input-field-div">
                    <input type = {props.type} class = "input-field" placeholder = {props.place} onChange = {props.functionValue}></input>
                </div>
            </div>
        </>
    );
}

export default Input;