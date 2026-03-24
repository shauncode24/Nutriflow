import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import DietPlan from "./pages/DietPlan";
import Main from "./pages/Main";
import Insights from "./pages/Insights";
import Workout from "./pages/Workout";
import WorkoutTracker from "./pages/WorkoutTracker";
import LandingPage from "./pages/LandingPage";
import CustomMeal from "./pages/CustomMeal";

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
  {
    path: "/custommeal",
    element: <CustomMeal />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;