import axios from "axios";
import "dotenv/config";

const appId = process.env.APP_ID;
const appKey = process.env.APP_KEY;

export const fetchNutritionData = async (quantity, unit, food) => {
  const sampleQuery = `${quantity} ${unit} ${food}`;
  console.log("sample query: ", sampleQuery);

  try {
    const response = await axios.post(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      { query: sampleQuery },
      {
        headers: {
          "x-app-id": appId,
          "x-app-key": appKey,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response.data.foods || response.data.foods.length === 0) {
      throw new Error(`No nutrition data found for "${food}"`);
    }

    const nutritionData = response.data.foods[0];

    return {
      name: nutritionData.food_name,
      calories: nutritionData.nf_calories,
      fat: nutritionData.nf_total_fat,
      protein: nutritionData.nf_protein,
      carbs: nutritionData.nf_total_carbohydrate,
    };
  } catch (error) {
    if (error.code === "ETIMEDOUT" || error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error(
        "Could not connect to Nutritionix API. Please check your internet connection or firewall settings."
      );
    }
    if (error.response) {
      console.error("Nutritionix API error response:", error.response.data);
      throw new Error(
        `Nutritionix API error: ${
          error.response.data.message || error.response.statusText
        }`
      );
    }
    throw error;
  }
};