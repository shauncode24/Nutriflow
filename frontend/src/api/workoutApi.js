import axios from "axios";

const BASE_URL = "http://localhost:4000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchExercises = async (muscle) => {
  const res = await axios.get(`${BASE_URL}/getexercise?muscle=${muscle}`);
  return res.data;
};

export const fetchWorkouts = async () => {
  const res = await axios.get(`${BASE_URL}/getworkouts`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchWorkoutSession = async (sessionId, day = "", date = "") => {
  const res = await axios.get(
    `${BASE_URL}/getworkoutsession/${sessionId}?day=${day}&date=${date}`,
    { headers: authHeader() }
  );
  return res.data;
};

export const saveWorkout = async (payload) => {
  const res = await fetch(`${BASE_URL}/addworkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateWorkout = async (sessionId, payload) => {
  const res = await axios.put(
    `${BASE_URL}/updateworkout/${sessionId}`,
    payload,
    { headers: authHeader() }
  );
  return res.data;
};

export const deleteWorkout = async (sessionId) => {
  const res = await axios.delete(`${BASE_URL}/deletesession/${sessionId}`, {
    headers: authHeader(),
  });
  return res.data;
};

export const saveWorkoutLogs = async (payload) => {
  const res = await axios.post(`${BASE_URL}/saveworkoutlogs`, payload, {
    headers: authHeader(),
  });
  return res.data;
};