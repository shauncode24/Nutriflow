import pool from "../config/db.js";
import { getDietInsights } from "../services/geminiService.js";

export const getInsights = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.userId;

    console.log("AI Request Received From ", userId, "for PlanID ", planId);

    const planDetails = await pool.query(
      "SELECT * FROM individualmeals WHERE meal_id = $1",
      [planId]
    );
    const foodDetails = await pool.query(
      "SELECT * FROM meals WHERE plan_id = $1",
      [planId]
    );

    const foodsData = foodDetails.rows;

    const grouped = foodsData.reduce((acc, item) => {
      const type = item.meal_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});

    const foodList = foodsData
      .map(
        (item) =>
          `${item.meal_type} ${item.quantity} ${item.quantity_unit} ${item.food} (calories: ${item.calories}, protein: ${item.proteins}g, carbs: ${item.carbs}g, fats: ${item.fats}g)`
      )
      .join("\n");

    const plan = planDetails.rows[0];
    console.log("PLANSSSS", plan);
    console.log("returned foods ", grouped);

    const aiResponse = await getDietInsights(foodList);

    res.json({
      aiResponse: aiResponse,
      planFoods: grouped,
      planDets: plan,
    });
  } catch (err) {
    console.error("Get insights error:", err.message);
    res.status(500).json({ error: "Failed to get insights" });
  }
};