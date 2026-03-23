import pool from "../config/db.js";
import { foods } from "./foodController.js";

export const addMeal = async (req, res) => {
  try {
    const userId = req.userId;
    const { calories, proteins, carbs, fats, selectedPlanId, planName } =
      req.body;

    console.log("Received selectedPlanId:", selectedPlanId);

    const plansResult = await pool.query(
      "SELECT plans FROM login WHERE id = $1",
      [userId]
    );
    const maxMealResult = await pool.query(
      "SELECT MAX(meal_id) FROM individualmeals WHERE user_id = $1",
      [userId]
    );

    let noOfMeals = (plansResult.rows[0]?.plans || 0) + 1;
    let noOfIndividualMeals = maxMealResult.rows[0]?.max || 0;

    if (selectedPlanId !== undefined && selectedPlanId !== null) {
      await pool.query(
        "UPDATE individualmeals SET calories = $1, proteins = $2, carbs = $3, fats = $4, plan_name = $5 WHERE meal_id = $6 AND user_id = $7",
        [calories, proteins, carbs, fats, planName, selectedPlanId, userId]
      );
      console.log("userid mealid", userId, selectedPlanId);
      console.log("in the condition");
    } else {
      await pool.query(
        "INSERT INTO individualmeals(user_id, meal_id, calories, proteins, carbs, fats, plan_name) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [userId, noOfMeals - 1, calories, proteins, carbs, fats, planName]
      );

      await pool.query("UPDATE login SET plans = $1 WHERE id = $2", [
        noOfMeals,
        userId,
      ]);
    }

    if (foods[userId] && Array.isArray(foods[userId])) {
      const targetPlanId =
        selectedPlanId !== undefined && selectedPlanId !== null
          ? selectedPlanId
          : noOfMeals - 1;
      for (const item of foods[userId]) {
        await pool.query(
          "INSERT INTO meals(user_id, plan_id, meal_type, food, calories, fats, proteins, carbs, quantity, quantity_unit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [
            userId,
            targetPlanId,
            item.meal_type,
            item.food,
            item.calories,
            item.fats,
            item.proteins,
            item.carbs,
            item.quantity,
            item.quantity_unit,
          ]
        );
      }
    }

    foods[userId] = [];
    console.log(`In memory data deleted: ${foods[userId]}`);

    res.status(200).json({ message: "Meal added successfully" });
  } catch (err) {
    console.error("Add meal error:", err.message);
    res.status(500).json({ error: "Failed to add meal" });
  }
};

export const getPlans = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      "SELECT * FROM individualmeals WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get plans error:", err.message);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

export const getPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { planId } = req.params;

    const result = await pool.query(
      "SELECT * FROM meals WHERE plan_id = $1 AND user_id = $2",
      [planId, userId]
    );

    const rows = result.rows;

    let planName = await pool.query(
      "SELECT plan_name FROM individualmeals WHERE meal_id = $1",
      [planId]
    );
    planName = planName.rows[0].plan_name;

    // Clear any existing draft foods to avoid confusion
    if (foods[userId]) {
      delete foods[userId];
      console.log(
        `Cleared any existing draft foods for user ${userId} when loading plan ${planId}`
      );
    }

    console.log(
      `Returning existing plan ${planId} data directly from DB (not populating memory)`
    );
    res.status(200).json({ items: rows, name: planName });
  } catch (err) {
    console.error("Get plan error:", err.message);
    res.status(500).json({ error: "Failed to get plan" });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { index } = req.body;
    console.log("todelete: ", index);

    await pool.query(
      "DELETE FROM individualmeals WHERE meal_id = $1 AND user_id = $2",
      [index, userId]
    );
    await pool.query(
      "DELETE FROM meals WHERE plan_id = $1 AND user_id = $2",
      [index, userId]
    );

    res.status(200).json({ message: "Plan deleted" });
  } catch (err) {
    console.error("Delete plan error:", err.message);
    res.status(500).json({ error: "Failed to delete plan" });
  }
};