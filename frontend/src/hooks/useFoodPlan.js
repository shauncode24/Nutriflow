import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addFood,
  getFood,
  deleteFood,
  clearFoods,
} from "../api/foodApi";
import {
  addMeal,
  fetchPlans,
  fetchPlan,
  deletePlan,
} from "../api/mealApi";
import { fetchInsights } from "../api/insightApi";

const EMPTY_FOOD = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snack: [],
};

const groupFoodItems = (foods) => {
  const grouped = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: [],
  };

  let totalCals = 0,
    totalProt = 0,
    totalCarb = 0,
    totalFat = 0;

  for (const item of foods) {
    const pairItem = {
      food: item.food,
      index: item.id,
      calories: Number(item.calories) || 0,
      proteins: Number(item.proteins) || 0,
      carbs: Number(item.carbs) || 0,
      fats: Number(item.fats) || 0,
      quantity: item.quantity || "1",
      unit: item.quantity_unit || item.unit || "g",
    };

    if (grouped[item.meal_type]) {
      grouped[item.meal_type].push(pairItem);
    }

    totalCals += pairItem.calories;
    totalProt += pairItem.proteins;
    totalCarb += pairItem.carbs;
    totalFat += pairItem.fats;
  }

  return {
    grouped,
    totals: {
      cals: Math.round(totalCals),
      proteins: Math.round(totalProt),
      carbs: Math.round(totalCarb),
      fats: Math.round(totalFat),
    },
  };
};

export const useFoodPlan = () => {
  const navigate = useNavigate();

  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snack, setSnack] = useState("");

  const [cals, setCals] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);

  const [showNewPlan, setShowNewPlan] = useState(false);
  const [plans, setPlans] = useState([]);
  const [addedFood, setAddedFood] = useState({ ...EMPTY_FOOD });
  const [planSelected, setPlanSelected] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planName, setPlanName] = useState("");
  const [aiRes, setAiRes] = useState("");
  const [qtyChanged, setQtyChange] = useState(null);

  const applyTotals = (totals) => {
    setCals(totals.cals);
    setProteins(totals.proteins);
    setCarbs(totals.carbs);
    setFats(totals.fats);
  };

  const recalculateFromAddedFood = (foodData) => {
    let totalCals = 0,
      totalProt = 0,
      totalCarb = 0,
      totalFat = 0;

    Object.keys(foodData).forEach((mealType) => {
      foodData[mealType].forEach((item) => {
        totalCals += Number(item.calories) || 0;
        totalProt += Number(item.proteins) || 0;
        totalCarb += Number(item.carbs) || 0;
        totalFat += Number(item.fats) || 0;
      });
    });

    setCals(Math.round(totalCals));
    setProteins(Math.round(totalProt));
    setCarbs(Math.round(totalCarb));
    setFats(Math.round(totalFat));
  };

  const loadPlans = async () => {
    try {
      const data = await fetchPlans();
      setPlans(data);
      console.log("incoming plans data: " + JSON.stringify(data));
    } catch (err) {
      console.error("Error fetching plans: ", err);
    }
  };

  const refreshAddedFoodAndTotals = async () => {
    try {
      let foods;

      if (planSelected) {
        const res = await fetchPlan(selectedPlanId);
        foods = res.items;
      } else {
        foods = await getFood();
      }

      console.log("returned foods: ", foods);

      const { grouped, totals } = groupFoodItems(foods);
      setAddedFood(grouped);
      applyTotals(totals);
    } catch (err) {
      console.error("Cannot fetch foods: ", err);
    }
  };

  const handleSubmit = async (meal, food, quantity, unit) => {
    try {
      const res = await addFood({
        time: meal,
        food,
        index: selectedPlanId,
        quantity,
        unit,
        qtychange: qtyChanged,
      });

      console.log("frontend handlesubmit12345: ", qtyChanged);
      await refreshAddedFoodAndTotals();
    } catch (err) {
      console.error("Error adding food: ", err);
    }
  };

  const handleDelete = async (meal, item) => {
    try {
      await deleteFood({
        food: item.food,
        meal,
        id: item.index,
        ...(planSelected ? { index: selectedPlanId } : {}),
      });

      const updatedAddedFood = {
        ...addedFood,
        [meal]: addedFood[meal].filter((f) => f.index !== item.index),
      };

      setAddedFood(updatedAddedFood);
      recalculateFromAddedFood(updatedAddedFood);
    } catch (err) {
      console.error("error deleting foods", err);
    }
  };

  const handlePlanDelete = async (index) => {
    try {
      await deletePlan(index);
      loadPlans();
    } catch (err) {
      console.error("error deleting plan", err);
    }
  };

  const handlePlanClick = async (planId) => {
    setSelectedPlanId(planId);
    setPlanSelected(1);

    try {
      const res = await fetchPlan(planId);
      console.log("handleplanclick id: ", planId);

      const foods = res.items;
      setPlanName(res.name);

      if (!foods || foods.length === 0) {
        setAddedFood({ ...EMPTY_FOOD });
        setCals(0);
        setProteins(0);
        setCarbs(0);
        setFats(0);
        return;
      }

      const { grouped, totals } = groupFoodItems(foods);
      setAddedFood(grouped);
      applyTotals(totals);
    } catch (err) {
      console.error("Error loading foods for plan", err);
    }
  };

  const sendNutritionValues = async (calories, proteins, carbs, fats) => {
    if (calories === 0 && proteins === 0 && carbs === 0 && fats === 0) return;
    try {
      await addMeal({ calories, proteins, carbs, fats, selectedPlanId, planName });
      await loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const getInsights = async (planId) => {
    try {
      console.log("plan id", planId);
      const data = await fetchInsights(planId);
      console.log("AI Diet Insight:", data);
      navigate("/insights", {
        state: {
          insights: data.aiResponse,
          foods: data.planFoods,
          planDetails: data.planDets,
        },
      });
      setAiRes(data);
    } catch (err) {
      console.log("Cannot fetch insights: ", err);
    }
  };

  const resetNewPlan = () => {
    setShowNewPlan(false);
    setPlanSelected(0);
    setSelectedPlanId(null);
    setCals(0);
    setProteins(0);
    setCarbs(0);
    setFats(0);
    setAddedFood({ ...EMPTY_FOOD });
    setPlanName("");
  };

  useEffect(() => {
    clearFoods()
      .then(() => console.log("Draft foods cleared on page refresh"))
      .catch((err) => console.error("Failed to clear drafts on refresh", err));
  }, []);

  useEffect(() => {
    loadPlans();
  }, []);

  return {
    // food input state
    breakfast, setBreakfast,
    lunch, setLunch,
    dinner, setDinner,
    snack, setSnack,
    // totals
    cals, proteins, carbs, fats,
    // plan state
    showNewPlan, setShowNewPlan,
    plans,
    addedFood,
    planSelected,
    selectedPlanId,
    planName, setPlanName,
    aiRes,
    qtyChanged, setQtyChange,
    // handlers
    handleSubmit,
    handleDelete,
    handlePlanDelete,
    handlePlanClick,
    sendNutritionValues,
    getInsights,
    resetNewPlan,
  };
};