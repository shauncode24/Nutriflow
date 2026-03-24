import axios from "axios";

const BASE_URL = "http://localhost:5000";

export const loginUser = async (username, pass) => {
  const res = await axios.post(`${BASE_URL}/login`, { username, pass });
  return res.data;
};

export const registerUser = async (username, pass) => {
  const res = await axios.post(`${BASE_URL}/register`, { username, pass });
  return res.data;
};