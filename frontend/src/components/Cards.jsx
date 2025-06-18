import { useEffect, useState } from "react";
import {Link} from 'react-router-dom'

function Card(props) {
    return(
        <>
            <div className = "internal-main">
                <div className = "card-image-div">
                    <img src = {props.image} alt = "image" className = {props.height}/>
                </div>
                <div className = "card-title">
                    {props.title}
                </div>
                <div className = "card-description">
                    {props.description}
                </div>
                <div className = "card-button-div">
                    <button className = "card-button"><Link to = {props.link}>{props.buttontitle}</Link></button>
                </div>
            </div>
        </>
    );
}

export default Card;