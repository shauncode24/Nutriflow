import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import axios from 'axios';

// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const appId = process.env.APP_ID; // Replace with your Nutritionix app ID
const appKey = process.env.APP_KEY; // Replace with your Nutritionix app key

app.get('/', async (req, res) => {
    const food = 'sev puri'; // Default food if not provided
    const quantity = '6';
    const sampleQuery = `${quantity} ${food}`;
    try {
      console.log(sampleQuery)
        // Make the request to Nutritionix API
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

        const nutritionData = response.data.foods[0]; // Get the first food result
        const nutritionDetails = {
            name: nutritionData.food_name,
            calories: nutritionData.nf_calories,
            fat: nutritionData.nf_total_fat,
            protein: nutritionData.nf_protein,
            carbs: nutritionData.nf_total_carbohydrate,
            image: nutritionData.photo ? nutritionData.photo.thumb : null
        };

        res.json(nutritionDetails); // Send back the nutrition details
    } catch (error) {
        console.error('Nutritionix API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch nutrition data' });
    }
});

// useEffect()

// app.get('/', (req, res) => {
//     res.json({ message: 'Hello from backend!' });
//   });

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
