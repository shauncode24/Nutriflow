import pool from "../config/db.js";
import { fetchNutritionData } from "../services/nutritionService.js";

// In-memory draft food store — keyed by userId
// This is intentionally module-level so it persists across requests
export const foods = {};

export const addFood = async (req, res) => {
  try {
    const { food, time, index, quantity, unit, qtychange } = req.body;

    if (!food || !time || !quantity || !unit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.userId;

    // Determine plan id
    let planId;
    const isEditingExistingPlan = index !== undefined && index !== null;

    if (isEditingExistingPlan) {
      planId = index;
    } else {
      const result = await pool.query("SELECT plans FROM login WHERE id = $1", [
        userId,
      ]);
      planId = result.rows[0]?.plans || 0;
    }

    // Fetch nutrition data
    const nutritionDetails = await fetchNutritionData(quantity, unit, food);

    console.log("UserID:", userId);
    console.log("qtychange:", qtychange);
    console.log("isEditingExistingPlan:", isEditingExistingPlan);

    const indFood = {
      userId: userId,
      plan_id: planId,
      meal_type: time,
      food: food,
      calories: nutritionDetails.calories,
      fats: nutritionDetails.fat,
      proteins: nutritionDetails.protein,
      carbs: nutritionDetails.carbs,
      quantity: quantity,
      quantity_unit: unit,
    };

    console.log("=== UPDATE ATTEMPT? ===");
    console.log("qtychange (food ID):", qtychange);
    console.log("planId:", planId);
    console.log("userId:", userId);

    if (qtychange !== undefined && qtychange !== null) {
      // Update existing item
      if (isEditingExistingPlan) {
        // Update directly in DB (no in-memory storage)
        const updateResult = await pool.query(
          `UPDATE meals 
           SET calories = $1, proteins = $2, carbs = $3, fats = $4, 
               quantity = $5, quantity_unit = $6 
           WHERE id = $7 AND plan_id = $8 AND user_id = $9`,
          [
            indFood.calories,
            indFood.proteins,
            indFood.carbs,
            indFood.fats,
            indFood.quantity,
            indFood.quantity_unit,
            qtychange,
            planId,
            userId,
          ]
        );
        console.log(
          `Updated meal in DB with id=${qtychange}, rows affected: ${updateResult.rowCount}`
        );
      } else {
        // Update draft (in-memory) - only for new plans
        if (!foods[userId]) {
          foods[userId] = [];
        }
        foods[userId] = foods[userId].map((f) =>
          f.id === qtychange ? { ...indFood, id: qtychange } : f
        );
        console.log(`Updated draft meal in memory with id=${qtychange}`);
      }
    } else {
      // Add new item
      if (isEditingExistingPlan) {
        // Save directly to DB (no in-memory storage)
        const result = await pool.query(
          `INSERT INTO meals 
           (user_id, plan_id, meal_type, food, calories, fats, proteins, carbs, quantity, quantity_unit)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            userId,
            planId,
            time,
            food,
            nutritionDetails.calories,
            nutritionDetails.fat,
            nutritionDetails.protein,
            nutritionDetails.carbs,
            quantity,
            unit,
          ]
        );
        console.log(
          "Inserted new food directly to DB with id:",
          result.rows[0].id
        );
      } else {
        // Add to in-memory (only for new plans)
        if (!foods[userId]) {
          foods[userId] = [];
        }
        indFood.id = Date.now();
        foods[userId].push(indFood);
        console.log("Added new draft food to memory:", indFood);
      }
    }

    res.status(200).json({ message: "Food added or updated successfully" });
  } catch (error) {
    console.error("Add food error details:", error);
    const errorMessage =
      error.message ||
      error.code ||
      (error.errors && error.errors[0]?.message) ||
      "Unknown error";
    res.status(500).json({
      error: "Failed to add or update food",
      details: errorMessage,
    });
  }
};

export const getFood = async (req, res) => {
  try {
    const userId = req.userId;

    if (foods[userId] && foods[userId].length > 0) {
      console.log(
        `Returning in-memory foods for user ${userId}:`,
        foods[userId]
      );
      return res.json(foods[userId]);
    } else {
      const result = await pool.query("SELECT plans FROM login WHERE id = $1", [
        userId,
      ]);
      const noOfMeals = result.rows[0]?.plans || 0;

      const mealsResult = await pool.query(
        "SELECT * FROM meals WHERE user_id = $1 AND plan_id = $2",
        [userId, noOfMeals]
      );
      console.log(mealsResult.rows);
      res.json(mealsResult.rows);
    }
  } catch (err) {
    console.error("Get food error:", err.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const userId = req.userId;
    const { id, index } = req.body;

    const foodId = parseInt(id);

    if (!index && foods[userId]) {
      foods[userId] = foods[userId].filter((f) => f.id !== foodId);
      console.log(`Deleted from in memory: ${id}`, foods[userId]);
      return res.status(200).json({ message: "Food deleted from memory" });
    }

    if (index) {
      console.log("inside deletefood");
      await pool.query(
        "DELETE FROM meals WHERE id = $1 AND plan_id = $2 AND user_id = $3",
        [id, index, userId]
      );
      console.log("id index userId", id, index, userId);
    } else {
      await pool.query("DELETE FROM meals WHERE id = $1 AND user_id = $2", [
        id,
        userId,
      ]);
    }

    res.status(200).json({ message: "Food deleted" });
  } catch (err) {
    console.error("Delete food error:", err.message);
    res.status(500).json({ error: "Failed to delete food" });
  }
};

export const clearFoods = (req, res) => {
  try {
    const userId = req.userId;
    delete foods[userId];
    console.log(`Draft foods cleared for user ${userId}`);
    res.status(200).json({ message: "Drafts cleared" });
  } catch (err) {
    console.error("Error clearing foods:", err.message);
    res.status(500).json({ error: "Could not clear drafts" });
  }
};