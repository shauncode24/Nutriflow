import axios from "axios";

const BASE_URL = "http://localhost:5000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const addMeal = async ({ calories, proteins, carbs, fats, selectedPlanId, planName }) => {
  const res = await axios.post(
    `${BASE_URL}/addMeal`,
    { calories, proteins, carbs, fats, selectedPlanId, planName },
    { headers: authHeader() }
  );
  return res.data;
};

export const fetchPlans = async () => {
  const res = await axios.get(`${BASE_URL}/plans`, {
    headers: authHeader(),
  });
  return res.data;
};

export const fetchPlan = async (planId) => {
  const res = await axios.get(`${BASE_URL}/getplan/${planId}`, {
    headers: authHeader(),
  });
  return res.data;
};

export const deletePlan = async (index) => {
  await axios.delete(`${BASE_URL}/deleteplan`, {
    headers: authHeader(),
    data: { index },
  });
};