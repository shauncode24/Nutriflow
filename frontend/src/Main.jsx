import { useEffect, useState } from "react";
import {useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from "./components/Header";
import herophoto from './photos/photo-main3.jpg';
import portraitPhoto from './photos/photo-main2.jpg';
import Card from "./components/Cards";
import {Link} from 'react-router-dom'

function Main() {
    const [msg, setMsg] = useState("");
    const[isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);

    useEffect(() => {
    const handler = (e) => setIsPortrait(e.matches);
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

    const navigate = useNavigate();

    return (<>
        <div className="main-body">
            <div className="sidebar">
              <div className = "optionsdiv">
                <div className= "option">opiton1</div>
                <div className= "option">option2</div>
                <div className= "option">option3</div>
                <div className= "option">option4</div>
              </div>
            </div>

            <div className="content">
              <div className="hero-main">
                <img src = {isPortrait ? portraitPhoto : herophoto} alt = "food" width = "100%" style={{position: 'relative', top: '0', left: '0'}} />
                <div className="title-main">Hey User,<br />Let's get started!</div>
              </div>

              <div className = "container-main">
                <Card title = "Your Meals" image = "https://freesvg.org/img/mealplate.png" description = "Track your nutrition, plan healthy meals, and maintain a balanced diet with daily tracking and smarter food choices." buttontitle = "Log Meal" link = "/dietplan"></Card>
                <Card title = "Track Your Workout" image = "https://www.svgrepo.com/show/461254/dumbbell.svg" description = "Monitor your fitness progress, set workout goals, and stay motivated with detailed analytics and achievements." buttontitle = "Start Workout"></Card>
                <Card title = "Miscellaneous" image = "https://cdn-icons-png.freepik.com/256/4811/4811032.png?semt=ais_hybrid" height = "class3" description = "Comprehensive health tracking including sleep, mood, water intake, and mindfulness for complete wellness." buttontitle = "Check Wellness"></Card>
              </div>
            </div>

            <div className="footer-main">

            {/* <button onClick={() => navigate('/homepage')}>Homepage</button> */}
            <Link to = "/dietplan">Dietplan</Link>
            </div>

        </div>
    </>);
}

export default Main;
