import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import 'dotenv/config';
import axios from 'axios';

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
        console.log("sample queyr: ", sampleQuery) // Fixed: template literal syntax
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;

        let noOfMeals;

        if (index !== undefined && index != null) {
            noOfMeals = index;
            console.log("mycode")
        } else {
            const result = await pool.query("SELECT plans FROM login WHERE id = $1", [userId]);
            noOfMeals = result.rows[0]?.plans || 0; // Added null check
        }

        const response = await axios.post(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            {
                query: sampleQuery
            },
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
        console.log(nutritionDetails);

        console.log("UserID", userId);
        console.log("qtychange: ", qtychange);

        const indFood = {
            "userId": userId,
            "plan_id": noOfMeals,
            "meal_type": time,
            "food": food,
            "calories": nutritionDetails.calories,
            "fats": nutritionDetails.fat,
            "proteins": nutritionDetails.protein,
            "carbs": nutritionDetails.carbs,
            "quantity": quantity,
            "quantity_unit": unit
        }

        if (!foods[userId]) {
            foods[userId] = []
        }

        if (qtychange === null || qtychange === undefined) { // Fixed condition
            indFood.id = Date.now();
            foods[userId].push(indFood);
            console.log(foods);
        } else {
            if (index) {
  // Update DB meal row
  await pool.query(
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
      index,
      userId
    ]
  );
  console.log(`🔁 Updated meal in DB with id=${qtychange}`);
} else {
  // In-memory edit
  foods[userId] = foods[userId].map(f =>
    f.id === qtychange ? { ...indFood, id: qtychange } : f
  );
  console.log(`🧠 Updated draft meal in memory`);
}

        }

        res.status(200).json({ message: 'Food added successfully' });

    } catch (error) {
        console.error('Add food error:', error.message);
        res.status(500).json({ error: 'Failed to fetch nutrition data' });
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
        const { calories, proteins, carbs, fats, selectedPlanId } = req.body;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.username;   
             
        const plansResult = await pool.query("SELECT plans FROM login WHERE id = $1", [userId]);
        const maxMealResult = await pool.query("SELECT MAX(meal_id) FROM individualmeals WHERE user_id = $1", [userId]);
        
        let noOfMeals = (plansResult.rows[0]?.plans || 0) + 1;
        let noOfIndividualMeals = maxMealResult.rows[0]?.max || 0;

        if (selectedPlanId !== undefined && selectedPlanId !== null) {
            await pool.query('UPDATE individualmeals SET calories = $1, proteins = $2, carbs = $3, fats = $4 WHERE meal_id = $5 AND user_id = $6', 
                [calories, proteins, carbs, fats, selectedPlanId, userId]);
            console.log("userid mealid", userId, selectedPlanId);
            console.log("in the condition")
        } else {
            await pool.query('INSERT INTO individualmeals(user_id, meal_id, calories, proteins, carbs, fats) VALUES ($1, $2, $3, $4, $5, $6)', 
                [userId, noOfMeals - 1, calories, proteins, carbs, fats]);

            await pool.query('UPDATE login SET plans = $1 WHERE id = $2', [noOfMeals, userId])
        }

        if (foods[userId] && Array.isArray(foods[userId])) {
            for (const item of foods[userId]) {
                await pool.query('INSERT INTO meals(user_id, plan_id, meal_type, food, calories, fats, proteins, carbs, quantity, quantity_unit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    [
                        userId,
                        noOfMeals - 1,
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

        // 🧠 Fill foods[userId] in memory with what's in this plan
        foods[userId] = rows.map(row => ({
            id: row.id,  // use actual db ID for later edits/deletes
            userId: row.user_id,
            plan_id: row.plan_id,
            meal_type: row.meal_type,
            food: row.food,
            calories: row.calories,
            fats: row.fats,
            proteins: row.proteins,
            carbs: row.carbs,
            quantity: row.quantity,
            quantity_unit: row.quantity_unit
        }));

        console.log(`Draft foods set for user ${userId} from plan ${planId}`);
        res.status(200).json(rows);

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


app.listen(5000, () => {
    console.log('Server is listening on port 5000');
});