import axios from "axios";

const BASE_URL = "http://localhost:5000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchUsername = async () => {
  const res = await axios.get(`${BASE_URL}/getusername`, {
    headers: authHeader(),
  });
  return res.data;
};