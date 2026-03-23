import axios from "axios";
import "dotenv/config";

const appId = process.env.APP_ID;
const appKey = process.env.APP_KEY;

export const fetchNutritionData = async (quantity, unit, food) => {
  const sampleQuery = `${quantity} ${unit} ${food}`;
  console.log("sample query: ", sampleQuery);

  const response = await axios.post(
    "https://trackapi.nutritionix.com/v2/natural/nutrients",
    { query: sampleQuery },
    {
      headers: {
        "x-app-id": appId,
        "x-app-key": appKey,
      },
    }
  );

  const nutritionData = response.data.foods[0];

  return {
    name: nutritionData.food_name,
    calories: nutritionData.nf_calories,
    fat: nutritionData.nf_total_fat,
    protein: nutritionData.nf_protein,
    carbs: nutritionData.nf_total_carbohydrate,
  };
};