import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

export const getDietInsights = async (foodList) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a nutrition expert analyzing a personalized diet plan. Given the list of foods with their quantities and nutritional values (in brackets), analyze the meal plan thoroughly and return ONLY the output in the following JSON format.
Please ensure the response is grounded in nutritional science and provides clear, concise, and actionable insights.

Dont do any Markdown formatting. Only send pure the JSON response:

{
  "summary": "A paragraph summarizing the overall nutritional quality, balance, and health impact of the diet plan.",
  "insight1": "One sharp observation about the meal structure (e.g., imbalance, over-reliance on one macro).",
  "insight2": "Another focused insight that highlights a nutritional pattern or concern.",
  "insight3": "A final key observation, ideally about long-term impact or consistency.",
  "suggestion1": "One major actionable change for improvement.",
  "suggestion2": "Another smart swap or change to improve balance or nutrition.",
  "suggestion3": "A final improvement idea focused on sustainability, diversity, or health.",
  "breakfast": "Evaluate the breakfast — note macronutrient distribution, quality, and how it sets the tone for the day.",
  "lunch": "Evaluate the lunch — comment on balance, heaviness, fiber, etc.",
  "dinner": "Evaluate the dinner — nutritional completeness, heaviness, gaps, etc.",
  "snacks": "Evaluate snacks — adequacy, nutritional value, opportunity for improvement.",
  "proteins": "low/medium/high — classify based on total and source quality. Give only one of low/medium/high",
  "carbs": "low/medium/high — classify based on quantity and type (refined vs complex). Give only one of low/medium/high",
  "fats": "low/medium/high — classify and briefly explain if healthy or saturated fats dominate. Give only one of low/medium/high",
  "calories": "low/medium/high — overall energy intake level. Give only one of low/medium/high",
  "nutrientInsights": "Paragraph highlighting what nutrients are abundant, missing, or imbalanced. Mention fiber, sodium, vitamins/minerals if possible."
  "dietRating": "Red | Yellow | Green — Overall rating based on nutritional quality, balance, and long-term health suitability. Use 'Green' for balanced, nutrient-rich plans; 'Yellow' for acceptable but needing improvement; 'Red' for poor or highly imbalanced plans."
  "processedFoodScore": "A brief rating (Low/Moderate/High) indicating how much of the food plan relies on processed or packaged foods."
}
}
  
Food List: ${foodList}
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};