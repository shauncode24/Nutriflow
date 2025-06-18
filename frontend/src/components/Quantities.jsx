import { useEffect, useState } from "react";
import axios from "axios";

function Quantities(props) {

    return (
    <>
        <div className = "daily-summary-body-div">
            <div className = "daily-summary-body-div-title">{props.title}</div>
            <div className = "daily-summary-body-div-content">{props.subtitle}</div>
        </div>
    </>
    );

}

export default Quantities;
