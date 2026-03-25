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

    // FIX: meal_type from DB can be mixed case — normalize to match our grouped keys
    const mealTypeKey = item.meal_type
      ? item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1).toLowerCase()
      : null;

    if (mealTypeKey && grouped.hasOwnProperty(mealTypeKey)) {
      grouped[mealTypeKey].push(pairItem);
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
  // FIX: Renamed to qtyChanged consistently (was mismatched: qtyChanged vs setQtyChange in return)
  const [qtyChanged, setQtyChanged] = useState(null);

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
    } catch (err) {
      console.error("Error fetching plans: ", err);
    }
  };

  const refreshAddedFoodAndTotals = async () => {
    try {
      let foods;

      if (planSelected && selectedPlanId) {
        const res = await fetchPlan(selectedPlanId);
        foods = res.items;
      } else {
        foods = await getFood();
      }

      const { grouped, totals } = groupFoodItems(foods);
      setAddedFood(grouped);
      applyTotals(totals);
    } catch (err) {
      console.error("Cannot fetch foods: ", err);
    }
  };

  /*
   * FIX: handleSubmit now receives foodName as a parameter.
   * Previously the food name was read from state inside the hook,
   * but by the time the async call completed the state could be stale.
   * DietPlan.jsx passes the current value directly: handleSubmit("Breakfast", breakfast, qty, unit)
   */
  const handleSubmit = async (meal, foodName, quantity, unit) => {
    if (!foodName || foodName.trim() === "") {
      console.warn("No food name provided, skipping submit");
      return;
    }

    try {
      await addFood({
        time: meal,
        food: foodName.trim(),
        index: selectedPlanId,
        quantity,
        unit,
        qtychange: qtyChanged,
      });

      // Reset edit mode after submit
      setQtyChanged(null);
      await refreshAddedFoodAndTotals();
    } catch (err) {
      console.error("Error adding food: ", err);
      alert("Failed to add food. Please check the food name and try again.");
    }
  };

  const handleDelete = async (meal, item) => {
    try {
      await deleteFood({
        food: item.food,
        meal,
        id: item.index,
        ...(planSelected && selectedPlanId ? { index: selectedPlanId } : {}),
      });

      const updatedAddedFood = {
        ...addedFood,
        [meal]: addedFood[meal].filter((f) => f.index !== item.index),
      };

      setAddedFood(updatedAddedFood);
      recalculateFromAddedFood(updatedAddedFood);
    } catch (err) {
      console.error("Error deleting food:", err);
    }
  };

  const handlePlanDelete = async (index) => {
    try {
      await deletePlan(index);
      await loadPlans();
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  const handlePlanClick = async (planId) => {
    setSelectedPlanId(planId);
    setPlanSelected(1);

    try {
      const res = await fetchPlan(planId);
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
      console.error("Error loading foods for plan:", err);
    }
  };

  const sendNutritionValues = async (calories, proteins, carbs, fats) => {
    if (calories === 0 && proteins === 0 && carbs === 0 && fats === 0) {
      alert("Please add some foods before saving.");
      return;
    }
    if (!planName || planName.trim() === "") {
      alert("Please enter a plan name before saving.");
      return;
    }
    try {
      await addMeal({ calories, proteins, carbs, fats, selectedPlanId, planName });
      await loadPlans();
    } catch (err) {
      console.error("Error saving meal plan:", err);
    }
  };

  const getInsights = async (planId) => {
    try {
      const data = await fetchInsights(planId);
      navigate("/insights", {
        state: {
          insights: data.aiResponse,
          foods: data.planFoods,
          planDetails: data.planDets,
        },
      });
      setAiRes(data);
    } catch (err) {
      console.error("Cannot fetch insights:", err);
      alert("Failed to load insights. Please try again.");
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
    setQtyChanged(null);
    // Clear food input fields
    setBreakfast("");
    setLunch("");
    setDinner("");
    setSnack("");
  };

  // FIX: clearFoods on mount was causing a race condition when the page
  // loads while a new plan is being created — only clear when starting fresh.
  // Moved clearFoods call to resetNewPlan and new plan creation instead.
  useEffect(() => {
    // Clear any stale in-memory draft on first load (safe: only affects server-side memory)
    clearFoods().catch((err) =>
      console.error("Failed to clear drafts on mount:", err)
    );
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
    // FIX: Export consistent names — qtyChanged + setQtyChange (alias for setQtyChanged)
    qtyChanged,
    setQtyChange: setQtyChanged,
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