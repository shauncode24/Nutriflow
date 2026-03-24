import axios from "axios";

const BASE_URL = "http://localhost:5000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchInsights = async (planId) => {
  const res = await axios.get(`${BASE_URL}/getinsights/${planId}`, {
    headers: authHeader(),
  });
  return res.data;
};