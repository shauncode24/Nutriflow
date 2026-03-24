import { useState, useEffect } from "react";
import { fetchWorkoutSession, saveWorkoutLogs } from "../api/workoutApi";

export const useWorkoutTracker = (sessionId) => {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(null);
  const [trackerData, setTrackerData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const dateString = currentDate.toISOString().split("T")[0];

  const goPreviousDate = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
    setTrackerData({});
  };

  const goNextDate = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
    setTrackerData({});
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkoutSession(sessionId, dayName, dateString);
        setWorkout(data);
        console.log("Secondary Fetch", data);
      } catch (err) {
        console.error("Error fetching session", err);
      }
    };

    load();
  }, [sessionId, dayName, dateString]);

  const handleLogChange = (day, muscle, exerciseId, setNumber, weight, reps) => {
    setTrackerData((prev) => {
      const newData = { ...prev };
      if (!newData[day]) newData[day] = {};
      if (!newData[day][muscle]) newData[day][muscle] = {};
      if (!newData[day][muscle][exerciseId]) newData[day][muscle][exerciseId] = {};
      newData[day][muscle][exerciseId][setNumber] = { weight, reps };
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      await saveWorkoutLogs({
        session_id: sessionId,
        date: currentDate.toISOString().split("T")[0],
        logs: trackerData[dayName] || {},
        dayName,
      });
      alert("Workout logged successfully!");
    } catch (err) {
      console.error("Error saving workout logs", err);
    }
  };

  useEffect(() => {
    console.log("Tracker", trackerData);
  }, [trackerData]);

  return {
    workout,
    loading,
    trackerData,
    dayName,
    dateString,
    goPreviousDate,
    goNextDate,
    handleLogChange,
    handleSave,
  };
};