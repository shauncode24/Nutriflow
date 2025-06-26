import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import 'dotenv/config';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const appId = process.env.APP_ID; // Replace with your Nutritionix app ID
const appKey = process.env.APP_KEY;

const app = express();
app.use(cors());
app.use(express.json());

var foods = {}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET;

var noOfMeals = 0;

app.get('/register', (req, res) => {
    res.json({message: "Registration endpoint"}) // Fixed: users was undefined
})

//Register
app.post('/register', async (req, res) => {
    try {
        const { username, pass } = req.body;
        
        // Input validation
        if (!username || !pass) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        const hashedPassword = await bcrypt.hash(pass, 10);

        console.log(username)
        console.log(hashedPassword)

        await pool.query(
            'INSERT INTO login (username, password_hash) VALUES ($1, $2)', 
            [username, hashedPassword]
        );
        
        res.status(201).json({ message: 'User registered successfully' }); // Added success response
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Error registering user' })
    }
});

//Login
app.post('/login', async (req, res) => {
    try {
        const { username, pass } = req.body;
        
        if (!username || !pass) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        const users = await pool.query('SELECT * FROM login WHERE username = $1', [username]);

        if (users.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        const valid = await bcrypt.compare(pass, users.rows[0].password_hash);
        if (valid) {            
            const token = jwt.sign({ username: users.rows[0].id }, JWT_SECRET, { expiresIn: '1h' }); // Fixed: '1hr' to '1h'
            console.log("Token sent", token);
            await pool.query('UPDATE login SET current_tracker = $1 WHERE username = $2', [token, username]);
            res.json({ token })
        } else {
            return res.status(401).json({ error: 'Invalid password' }); // Fixed typo
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
})

app.post('/addfood', async (req, res) => {
  try {
    const { food, time, index, quantity, unit, qtychange } = req.body;

    // Input validation
    if (!food || !time || !quantity || !unit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sampleQuery = `${quantity} ${unit} ${food}`;
    console.log("sample query: ", sampleQuery);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.username;

    // Determine plan id
    let planId;
    const isEditingExistingPlan = index !== undefined && index !== null;
    
    if (isEditingExistingPlan) {
      planId = index;
    } else {
      const result = await pool.query("SELECT plans FROM login WHERE id = $1", [userId]);
      planId = result.rows[0]?.plans || 0;
    }

    // Fetch nutrition data
    const response = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      { query: sampleQuery },
      {
        headers: {
          'x-app-id': appId,
          'x-app-key': appKey
        }
      }
    );

    const nutritionData = response.data.foods[0];
    const nutritionDetails = {
      name: nutritionData.food_name,
      calories: nutritionData.nf_calories,
      fat: nutritionData.nf_total_fat,
      protein: nutritionData.nf_protein,
      carbs: nutritionData.nf_total_carbohydrate,
    };

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
      quantity_unit: unit
    };

    console.log("=== UPDATE ATTEMPT? ===");
    console.log("qtychange (food ID):", qtychange);
    console.log("planId:", planId);
    console.log("userId:", userId);

    if (qtychange !== undefined && qtychange !== null) {
      // 🔄 Update existing item
      if (isEditingExistingPlan) {
        // 🟡 Update directly in DB (no in-memory storage)
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
            userId
          ]
        );
        console.log(`🔁 Updated meal in DB with id=${qtychange}, rows affected: ${updateResult.rowCount}`);
      } else {
        // 🧠 Update draft (in-memory) - only for new plans
        if (!foods[userId]) {
          foods[userId] = [];
        }
        foods[userId] = foods[userId].map(f =>
          f.id === qtychange ? { ...indFood, id: qtychange } : f
        );
        console.log(`🧠 Updated draft meal in memory with id=${qtychange}`);
      }
    } else {
      // ➕ Add new item
      if (isEditingExistingPlan) {
        // 🟡 Save directly to DB (no in-memory storage)
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
            unit
          ]
        );
        console.log("🟡 Inserted new food directly to DB with id:", result.rows[0].id);
      } else {
        // 🧠 Add to in-memory (only for new plans)
        if (!foods[userId]) {
          foods[userId] = [];
        }
        indFood.id = Date.now(); // Assign unique ID for frontend
        foods[userId].push(indFood);
        console.log("🧠 Added new draft food to memory:", indFood);
      }
    }

    res.status(200).json({ message: 'Food added or updated successfully' });
  } catch (error) {
    console.error('Add food error:', error.message);
    res.status(500).json({ error: 'Failed to add or update food' });
  }
});


app.get('/getfood', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;

        if (foods[userId] && foods[userId].length > 0) {
            console.log(`Returning in-memory foods for user ${userId}:`, foods[userId]); // Fixed template literal
            return res.json(foods[userId])
        } else {
            const result = await pool.query("SELECT plans FROM login WHERE id = $1", [userId]);
            const noOfMeals = result.rows[0]?.plans || 0; // Added null check
            
            console.log("getid", decoded)
            const mealsResult = await pool.query('SELECT * FROM meals WHERE user_id = $1 AND plan_id = $2', [userId, noOfMeals]);
            console.log(mealsResult.rows)
            res.json(mealsResult.rows);
        }
    } catch (err) {
        console.error('Get food error:', err.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/addMeal', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(' ')[1];
        const { calories, proteins, carbs, fats, selectedPlanId ,planName} = req.body;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;   

        console.log("Received selectedPlanId:", selectedPlanId);
             
        const plansResult = await pool.query("SELECT plans FROM login WHERE id = $1", [userId]);
        const maxMealResult = await pool.query("SELECT MAX(meal_id) FROM individualmeals WHERE user_id = $1", [userId]);
        
        let noOfMeals = (plansResult.rows[0]?.plans || 0) + 1;
        let noOfIndividualMeals = maxMealResult.rows[0]?.max || 0;

        if (selectedPlanId !== undefined && selectedPlanId !== null) {
            await pool.query('UPDATE individualmeals SET calories = $1, proteins = $2, carbs = $3, fats = $4, plan_name = $5 WHERE meal_id = $6 AND user_id = $7', 
                [calories, proteins, carbs, fats, planName, selectedPlanId, userId]);
            console.log("userid mealid", userId, selectedPlanId);
            console.log("in the condition")
        } else {
            await pool.query('INSERT INTO individualmeals(user_id, meal_id, calories, proteins, carbs, fats, plan_name) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                [userId, noOfMeals - 1, calories, proteins, carbs, fats, planName]);

            await pool.query('UPDATE login SET plans = $1 WHERE id = $2', [noOfMeals, userId])
        }

        if (foods[userId] && Array.isArray(foods[userId])) {
            const targetPlanId = (selectedPlanId !== undefined && selectedPlanId !== null)
            ? selectedPlanId
            : noOfMeals - 1;
            for (const item of foods[userId]) {
                await pool.query('INSERT INTO meals(user_id, plan_id, meal_type, food, calories, fats, proteins, carbs, quantity, quantity_unit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
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
                        item.quantity_unit
                    ]
                );
            }
        }

        foods[userId] = []
        console.log(`In memory data deleted: ${foods[userId]}`); // Fixed template literal

        res.status(200).json({ message: 'Meal added successfully' }); // Added success response

    } catch (err) {
        console.error("Add meal error:", err.message);
        res.status(500).json({ error: 'Failed to add meal' });
    }
})

app.get('/plans', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;

        const result = await pool.query('SELECT * FROM individualmeals WHERE user_id = $1', [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Get plans error:', err.message);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

app.delete('/deletefood', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(' ')[1];
        const { id, index } = req.body;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;

        const foodId = parseInt(id);

        if (!index && foods[userId]) {
            foods[userId] = foods[userId].filter(f => f.id !== foodId)
            console.log(`Deleted from in memory: ${id}`, foods[userId]); // Fixed template literal
            return res.status(200).json({ message: "Food deleted from memory" })
        }

        if (index) {
            console.log("inside deletefood")
            await pool.query(
                'DELETE FROM meals WHERE id = $1 AND plan_id = $2 AND user_id = $3',
                [id, index, userId]
            );
            console.log("id index userId", id, index, userId);
        } else {
            await pool.query(
                'DELETE FROM meals WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
        }

        res.status(200).json({ message: "Food deleted" })
    } catch (err) {
        console.error('Delete food error:', err.message);
        res.status(500).json({ error: 'Failed to delete food' });
    }
})

app.delete('/deleteplan', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(' ')[1];
        const { index } = req.body;
        console.log("todelete: ", index);
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;

        await pool.query(
            'DELETE FROM individualmeals WHERE meal_id = $1 AND user_id = $2',
            [index, userId]
        );
        await pool.query(
            'DELETE FROM meals WHERE plan_id = $1 AND user_id = $2',
            [index, userId]
        );
        res.status(200).json({ message: "Plan deleted" })
    } catch (err) {
        console.error('Delete plan error:', err.message);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
})

app.get('/getplan/:planId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        const { planId } = req.params;

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;

        const result = await pool.query(
            'SELECT * FROM meals WHERE plan_id = $1 AND user_id = $2',
            [planId, userId]
        );

        const rows = result.rows;
        
        let planName = await pool.query("SELECT plan_name FROM individualmeals WHERE meal_id = $1", [planId]);
        planName = planName.rows[0].plan_name;

        // ❌ DON'T populate in-memory storage when editing existing plans
        // This was causing duplicates because these foods were being re-inserted
        
        // 🧠 Only clear any existing draft foods to avoid confusion
        if (foods[userId]) {
            delete foods[userId];
            console.log(`Cleared any existing draft foods for user ${userId} when loading plan ${planId}`);
        }

        console.log(`Returning existing plan ${planId} data directly from DB (not populating memory)`);
        res.status(200).json({items: rows, name: planName});

    } catch (err) {
        console.error('Get plan error:', err.message);
        res.status(500).json({ error: 'Failed to get plan' });
    }
});


app.post('/clearfoods', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.username;

    delete foods[userId]; // Clear only this user's in-memory draft
    console.log(`Draft foods cleared for user ${userId}`);
    res.status(200).json({ message: "Drafts cleared" });

  } catch (err) {
    console.error("Error clearing foods:", err.message);
    res.status(500).json({ error: "Could not clear drafts" });
  }
});

app.get('/getusername', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" })
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.username;

    var username = await pool.query('SELECT username FROM login WHERE id = $1', [userId]);
    username = username.rows[0].username;

    res.json( {name: username} );
})

app.get('/getinsights/:planId', async (req, res) => {
    const {planId} = req.params;
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.username;

    console.log("AI Request Received From ", userId, "for PlanID ", planId);

    const planDetails = await pool.query('SELECT * FROM individualmeals WHERE meal_id = $1', [planId]);
    const foodDetails = await pool.query('SELECT * FROM meals WHERE plan_id = $1', [planId]);

    const foods = foodDetails.rows;

        const grouped = foods.reduce((acc, item) => {
            const type = item.meal_type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
        }, {});

        // console.log(allFoods);
    const foodList = foods.map(item => 
      `${item.meal_type} ${item.quantity} ${item.quantity_unit} ${item.food} (calories: ${item.calories}, protein: ${item.proteins}g, carbs: ${item.carbs}g, fats: ${item.fats}g)`
    ).join("\n");

    const plan = planDetails.rows[0];
    console.log("PLANSSSS", plan)

    console.log("returned foods ", grouped);

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({model : "gemini-1.5-flash"});
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
  "proteins": "low/medium/high — classify based on total and source quality.",
  "carbs": "low/medium/high — classify based on quantity and type (refined vs complex).",
  "fats": "low/medium/high — classify and briefly explain if healthy or saturated fats dominate.",
  "calories": "low/medium/high — overall energy intake level.",
  "nutrientInsights": "Paragraph highlighting what nutrients are abundant, missing, or imbalanced. Mention fiber, sodium, vitamins/minerals if possible."
  "dietRating": "Red | Yellow | Green — Overall rating based on nutritional quality, balance, and long-term health suitability. Use 'Green' for balanced, nutrient-rich plans; 'Yellow' for acceptable but needing improvement; 'Red' for poor or highly imbalanced plans."
  "processedFoodScore": "A brief rating (Low/Moderate/High) indicating how much of the food plan relies on processed or packaged foods."
}
}
  
Food List: ${foodList}
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
        aiResponse: text,
        planFoods: grouped,
        planDets: plan
    })
})


app.listen(5000, () => {
    console.log('Server is listening on port 5000');
});