import { useEffect, useState } from "react";
import {
  createRoutesFromElements,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import herophoto from "../photos/photo-main3.jpg";
import portraitPhoto from "../photos/photo-main2.jpg";
import Card from "../components/Cards";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Main.css";

function Main() {
  const [msg, setMsg] = useState("");
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia("(orientation: portrait)").matches
  );
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );
  const [username, setUsername] = useState("");

  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [text3, setText3] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await axios.get("http://localhost:5000/getusername", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsername(res.data.name); // ✅ Access `name` from the response
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    const handler = (e) => setIsPortrait(e.matches);
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const handleOrientationChange = (e) => setIsPortrait(e.matches);
    const handleMobileChange = (e) => setIsMobile(e.matches);

    const orientationMQ = window.matchMedia("(orientation: portrait)");
    const mobileMQ = window.matchMedia("(max-width: 767px)");

    orientationMQ.addEventListener("change", handleOrientationChange);
    mobileMQ.addEventListener("change", handleMobileChange);

    return () => {
      orientationMQ.removeEventListener("change", handleOrientationChange);
      mobileMQ.removeEventListener("change", handleMobileChange);
    };
  }, []);

  const morningGreetings = (username) => [
    `Good morning, ${username}! A fresh day, a fresh chance.`,
    `Rise and grind, ${username} — momentum starts now.`,
    `Fuel your morning right, ${username}. Small steps, big wins.`,
    `The sun’s up — let’s make today brighter, ${username}.`,
  ];

  const afternoonGreetings = (username) => [
    `Keep it moving, ${username} — the day’s yours to own.`,
    `Midday check: progress now = pride later, ${username}.`,
    `Strong afternoons build stronger results, ${username}.`,
    `Halfway through — finish stronger than you started, ${username}.`,
  ];

  const eveningGreetings = (username) => [
    `Evening hustle, ${username} — end the day with fire.`,
    `Good evening! Choices now shape tomorrow, ${username}.`,
    `Day’s nearly done — make this part count, ${username}.`,
    `Strong finishes beat strong starts — push through, ${username}.`,
  ];

  const lateNightGreetings = (username) => [
    `Burning the midnight oil, ${username}? That’s discipline.`,
    `Late nights, big gains — keep going, ${username}.`,
    `Your midnight grind is tomorrow’s edge, ${username}.`,
    `Quiet nights, powerful results — stay on it, ${username}.`,
  ];

  const motivationalHeadlines = [
    "Turn today into your strongest day yet!",
    "Every healthy choice is a win!",
    "Build the habits that build you!",
    "Progress, not perfection!",
    "Make your health your priority!",
    "Small steps, big transformations!",
    "Fuel your body, fuel your dreams!",
    "Consistency beats intensity — show up today!",
    "Every rep, every step, every choice matters.",
    "One step closer every day.",
    "Progress is quiet, but it shows.",
    "Balance your plate, balance your progress.",
    "Every rep, every bite, moves you forward.",
    "Fuel your body, build your strength.",
  ];

  const goalMessages = [
    "Stay consistent — small steps build big results.",
    "Fuel your body with the right choices today.",
    "Strong workouts start with smart nutrition.",
    "Progress comes from discipline, not perfection.",
    "Every rep and every meal gets you closer.",
    "Build strength, inside and out.",
    "Healthy habits create lasting change.",
    "Push harder today, recover smarter tomorrow.",
    "Your next milestone starts with this choice.",
    "Train with purpose, eat with balance.",
    "Wellness is a lifestyle, not a finish line.",
    "One workout, one meal, one day at a time.",
  ];
  useEffect(() => {
    setText2(
      motivationalHeadlines[
        Math.floor(Math.random() * motivationalHeadlines.length)
      ]
    );
  }, []);

  useEffect(() => {
    let timeoutId;
    let currentMessageIndex = 0;

    const typeWriter = (text, index = 0) => {
      if (index < text.length) {
        setText3(text.substring(0, index + 1));
        timeoutId = setTimeout(
          () => typeWriter(text, index + 1),
          isMobile ? 40 : 50
        );
      } else {
        timeoutId = setTimeout(() => eraseText(text), isMobile ? 2000 : 3000);
      }
    };

    const eraseText = (text, index = text.length) => {
      if (index > 0) {
        setText3(text.substring(0, index - 1));
        timeoutId = setTimeout(() => eraseText(text, index - 1), 25);
      } else {
        timeoutId = setTimeout(() => {
          currentMessageIndex = (currentMessageIndex + 1) % goalMessages.length;
          const nextMessage = goalMessages[currentMessageIndex];
          typeWriter(nextMessage);
        }, 500);
      }
    };

    const startTyping = () => {
      const initialMessage =
        goalMessages[Math.floor(Math.random() * goalMessages.length)];
      currentMessageIndex = goalMessages.findIndex(
        (msg) => msg === initialMessage
      );
      typeWriter(initialMessage);
    };

    startTyping();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!username) return;

    const getTimeBasedGreeting = () => {
      const currentTime = new Date().getHours();

      if (currentTime < 12) {
        setText1(
          morningGreetings(username)[
            Math.floor(Math.random() * morningGreetings(username).length)
          ]
        );
      } else if (currentTime < 17) {
        setText1(
          afternoonGreetings(username)[
            Math.floor(Math.random() * afternoonGreetings(username).length)
          ]
        );
      } else if (currentTime < 21) {
        setText1(
          eveningGreetings(username)[
            Math.floor(Math.random() * eveningGreetings(username).length)
          ]
        );
      } else {
        setText1(
          lateNightGreetings(username)[
            Math.floor(Math.random() * lateNightGreetings(username).length)
          ]
        );
      }
    };

    getTimeBasedGreeting();
  }, [username]);

  return (
    <>
      <div className="main-default main-body">
        <Sidebar user={username} />

        <div className="main-default content">
          <div className="main-default hero-main">
            <div className="main-default text">
              <p className="main-default text1">{text1}</p>
              <p className="main-default text2">{text2}</p>
              <p className="main-default text3">{text3}</p>
            </div>

            {!isMobile && (
              <div className="main-default floating-div">
                <div className="main-default floating">
                  <div className="main-default floats float-1"></div>
                  <div className="main-default floats float-2"></div>
                  <div className="main-default floats float-3"></div>
                </div>
              </div>
            )}
          </div>

          <div className="main-default container-main">
            <Card
              title="Your Meals"
              image="https://freesvg.org/img/mealplate.png"
              description="Track your nutrition, plan healthy meals, and maintain a balanced diet with daily tracking and smarter food choices."
              buttontitle="Log Meal"
              link="/dietplan"
            ></Card>
            <Card
              title="Track Your Workout"
              image="https://www.svgrepo.com/show/461254/dumbbell.svg"
              description="Monitor your fitness progress, set workout goals, and stay motivated with detailed analytics and achievements."
              buttontitle="Start Workout"
              link="/workout"
            ></Card>
            <Card
              title="Miscellaneous"
              image="https://cdn-icons-png.freepik.com/256/4811/4811032.png?semt=ais_hybrid"
              height="class3"
              description="Comprehensive health tracking including sleep, mood, water intake, and mindfulness for complete wellness."
              buttontitle="Check Wellness"
            ></Card>
          </div>
        </div>

        {/* <div className="main-default footer-main">

          <Link to="/dietplan">Dietplan</Link>
        </div> */}
      </div>
    </>
  );
}

export default Main;
