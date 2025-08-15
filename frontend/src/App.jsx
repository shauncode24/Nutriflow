import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import HomePage from "./Homepage";
import DietPlan from "./DietPlan";
import Main from "./Main";
import Insights from "./Insights";
import Workout from "./Workout";
import DisplayWorkouts from "./components/DisplayWorkouts";
import WorkoutTracker from "./WorkoutTracker";
import LandingPage from "./LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/main",
    element: <Main />,
  },
  {
    path: "/dietplan",
    element: <DietPlan />,
  },
  {
    path: "/insights",
    element: <Insights />,
  },
  {
    path: "/workout",
    element: <Workout />,
  },
  {
    path: "/track/:session_id",
    element: <WorkoutTracker />,
  },
]);

function App() {
  return (
    // <Routes>
    //   <Route path="/" element={<Login />} />
    //   <Route path="/homepage" element={<HomePage />} />
    //   <Route path="/dietplan" element={<DietPlan />} />
    //   <Route path="/main" element={<Main />} />
    // </Routes>

    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
