import { config } from 'dotenv';
config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function runGemini() {
    try {
        // Access your API key as an environment variable
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);

        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Given the following list of foods with their quantities and nutritional values, analyze the meal plan and respond in the exact JSON format below.

Respond ONLY in this JSON format:

{
  "summary": "A human-friendly paragraph summarizing the overall diet plan.",
  "tags": ["High Protein", "Low Sugar", "Balanced"],
  "nutrientInsights": "Mention which nutrients are high, which are low or missing, and any imbalances.",
  "suggestions": "Suggest better alternatives, swaps or improvements in the plan.",
  "comparison": "Compare this diet plan with a standard healthy Indian diet based on macros.",
  "macroBreakdown": {
    "Calories": number,
    "Proteins": number,
    "Carbs": number,
    "Fats": number
  }
}

Food List:
2 boiled eggs (calories: 140, protein: 12g, carbs: 1g, fats: 10g)
1 cup rice (calories: 200, protein: 4g, carbs: 45g, fats: 0.4g)
1 apple (calories: 95, protein: 0.5g, carbs: 25g, fats: 0.3g)
1 cup cooked spinach (calories: 41, protein: 5g, carbs: 6g, fats: 0.5g)
1 whole wheat roti (calories: 100, protein: 3g, carbs: 20g, fats: 1g)
1 bowl dal (calories: 180, protein: 10g, carbs: 25g, fats: 3g)
100g grilled chicken breast (calories: 165, protein: 31g, carbs: 0g, fats: 3.5g)
1 banana (calories: 105, protein: 1.3g, carbs: 27g, fats: 0.3g)
1 cup plain yogurt (calories: 150, protein: 8g, carbs: 12g, fats: 3g)
1 tablespoon peanut butter (calories: 90, protein: 4g, carbs: 3g, fats: 8g)

        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

    } catch (error) {
        console.error("Error connecting to Gemini API:", error);
    }
}

runGemini();