import axios from "axios";

const BASE_URL = "http://localhost:5000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const addFood = async ({ food, time, index, quantity, unit, qtychange }) => {
  const res = await axios.post(
    `${BASE_URL}/addfood`,
    { food, time, index, quantity, unit, qtychange },
    { headers: authHeader() }
  );
  return res.data;
};

export const getFood = async () => {
  const res = await axios.get(`${BASE_URL}/getfood`, {
    headers: authHeader(),
  });
  return res.data;
};

export const deleteFood = async ({ food, meal, id, index }) => {
  await axios.delete(`${BASE_URL}/deletefood`, {
    headers: authHeader(),
    data: { food, meal, id, ...(index !== undefined ? { index } : {}) },
  });
};

export const clearFoods = async () => {
  await axios.post(
    `${BASE_URL}/clearfoods`,
    {},
    { headers: authHeader() }
  );
};