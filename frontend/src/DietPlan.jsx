import React from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import NewPlanDivs from "./components/NewPlanDivs";
import Quantities from "./components/Quantities";
import Plans from "./components/Plans";
import { Link } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function DietPlan() {
    const [breakfast, setBreakfast] = React.useState('');
    const [lunch, setLunch] = React.useState('');
    const [dinner, setDinner] = React.useState('');
    const [snack, setSnack] = React.useState('');
    const [cals, setCals] = React.useState(0);
    const [proteins, setProteins] = React.useState(0);
    const [carbs, setCarbs] = React.useState(0);
    const [fats, setFats] = React.useState(0);
    const [showNewPlan, setShowNewPlan] = React.useState(false);
    const [plans, setPlans] = React.useState([]);
    const [addedFood, setAddedFood] = React.useState({
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snack: []
    });
    const [planSelected, setPlanSelected] = React.useState(0);
    const [selectedPlanId, setSelectedPlanId] = React.useState(null);
    const [planName, setPlanName] = React.useState('')

    // Quantity and Unit States for each meal
    const [qtyChanged, setQtyChange] = React.useState(null);

    React.useEffect(() => {
  const token = localStorage.getItem('token');
  axios.post('http://localhost:5000/clearfoods', {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(() => {
    console.log("Draft foods cleared on page refresh");
  }).catch(err => {
    console.error("Failed to clear drafts on refresh", err);
  });
}, []);

    const fetchPlans = async () => {
        try {
            const res = await axios.get('http://localhost:5000/plans', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPlans(res.data)
            console.log("incoming plans data: " + JSON.stringify(res.data))
        }catch (err) {
            console.error("Error fetching plans: ", err);
        }
    };

    const fetchTotals = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:5000/getfood', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const foods = res.data;

            // Group foods by meal_type WITH nutrition data
            const groupedFoods = {
                Breakfast: [],
                Lunch: [],
                Dinner: [],
                Snack: []
            };

            let totalCals = 0, totalProt = 0, totalCarb = 0, totalFat = 0;
            console.log("Received", foods)
            
            for(const item of foods) {
                const pairItem = {
                    food: item.food,
                    index: item.id,
                    calories: Number(item.calories) || 0,
                    proteins: Number(item.proteins) || 0,
                    carbs: Number(item.carbs) || 0,
                    fats: Number(item.fats) || 0,
                    quantity: item.quantity || '1',
                    unit: item.unit || 'g',
                };
                
                if (groupedFoods[item.meal_type]) {
                    groupedFoods[item.meal_type].push(pairItem);
                }

                totalCals += pairItem.calories;
                totalProt += pairItem.proteins;
                totalCarb += pairItem.carbs;
                totalFat += pairItem.fats;
            }

            setAddedFood(groupedFoods);
            setCals(Math.round(totalCals));
            setProteins(Math.round(totalProt));
            setCarbs(Math.round(totalCarb));
            setFats(Math.round(totalFat));
        } catch (err) {
            console.error("Failed to fetch food data: ", err);
        }
    };

    const recalculateFromAddedFood = (foodData) => {
        let totalCals = 0, totalProt = 0, totalCarb = 0, totalFat = 0;

        Object.keys(foodData).forEach(mealType => {
            foodData[mealType].forEach(item => {
                totalCals += Number(item.calories) || 0;
                totalProt += Number(item.proteins) || 0;
                totalCarb += Number(item.carbs) || 0;
                totalFat += Number(item.fats) || 0;
            });
        });

        setCals(Math.round(totalCals));
        setProteins(Math.round(totalProt));
        setCarbs(Math.round(totalCarb));
        setFats(Math.round(totalFat));
        
        console.log("Recalculated totals:", {
            calories: Math.round(totalCals),
            proteins: Math.round(totalProt),
            carbs: Math.round(totalCarb),
            fats: Math.round(totalFat)
        });
    };

    const sendNutritionValues = async (calories, proteins, carbs, fats) => {
    if (calories === 0 && proteins === 0 && carbs === 0 && fats === 0) return;
    try {
        await axios.post('http://localhost:5000/addMeal',
            { calories, proteins, carbs, fats, selectedPlanId, planName },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        // Optional: clear meal plan list in backend
        // await axios.delete('http://localhost:5000/clearfood', {
        //     headers: {
        //         Authorization: `Bearer ${localStorage.getItem('token')}`
        //     }
        // });

        // Refresh UI
        await fetchPlans();
        // await fetchTotals(); // now returns 0 values

    } catch (err) {
        console.error(err);
    }
    };

const refreshAddedFoodAndTotals = async () => {
    try {
        const res1 = planSelected
            ? await axios.get(`http://localhost:5000/getplan/${selectedPlanId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            : await axios.get('http://localhost:5000/getfood', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

        const foods = res1.data;
        console.log(foods);

        const groupedFoods = {
            Breakfast: [],
            Lunch: [],
            Dinner: [],
            Snack: []
        };


        let totalCals = 0, totalProt = 0, totalCarb = 0, totalFat = 0;
console.log("foods length:", foods.length);
        for (const item of foods.items) {
            const pairItem = {
                food: item.food,
                index: item.id,
                calories: Number(item.calories) || 0,
                proteins: Number(item.proteins) || 0,
                carbs: Number(item.carbs) || 0,
                fats: Number(item.fats) || 0,
                quantity: item.quantity || '1',
                unit: item.quantity_unit || 'g'
            };

            if (groupedFoods[item.meal_type]) {
                groupedFoods[item.meal_type].push(pairItem);
            }

            totalCals += pairItem.calories;
            totalProt += pairItem.proteins;
            totalCarb += pairItem.carbs;
            totalFat += pairItem.fats;

            console.log("recevied plan", pairItem);
        }

        // ✅ Only use these once, not fetchTotals()
        setAddedFood(groupedFoods);
        setCals(Math.round(totalCals));
        setProteins(Math.round(totalProt));
        setCarbs(Math.round(totalCarb));
        setFats(Math.round(totalFat));

    } catch (err) {
        console.error("Cannot fetch foods: ", err);
    }
};


const handleSubmit = async (meal, food, quantity, unit) => {
    try {
        const res = await axios.post('http://localhost:5000/addfood', 
            {
                time: meal,
                food: food,
                index: selectedPlanId,   // plan_id
                quantity: quantity,
                unit: unit,
                qtychange: qtyChanged  // 🔧 Make sure it's undefined if not set
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );


        console.log("frontend handlesubmit12345: ", qtyChanged)

        if (res.status === 200) {
            console.log(`${meal} added: ${food}`);
            await refreshAddedFoodAndTotals();
        }
        } catch (err) {
            console.error("Error adding food: ", err);
        }
    };

    const handleDelete = async (meal, item) => {
        try {
            await axios.delete('http://localhost:5000/deletefood', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    food: item.food,
                    meal: meal,
                    id: item.index,
                    ...(planSelected ? { index: selectedPlanId }: {})
                }
            });

            const updatedAddedFood = {
                ...addedFood,
                [meal]: addedFood[meal].filter((f) => f.index !== item.index)
            };
            
            setAddedFood(updatedAddedFood);
            recalculateFromAddedFood(updatedAddedFood);
            
            console.log("added foods handledelete deletefood: ", updatedAddedFood);
        } catch (err) {
            console.error("error deleting foods", err);
        }
    };

    const handlePlanDelete = async (index) => {
        try {
            await axios.delete('http://localhost:5000/deleteplan', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                data: {
                    index: index
                }
            })

            fetchPlans();
        } catch (err) {
            console.error("error deleting plan", err);
        }
    };

    const handlePlanClick = async (planId) => {
    // 🟢 Set up edit mode
    setSelectedPlanId(planId);
    setPlanSelected(1);

    try {
        // 🔵 Fetch the full plan
        const res = await axios.get(`http://localhost:5000/getplan/${planId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log("handleplanclick id: ", planId);

        // 🟣 Group food items by meal type
        const grouped = {
            Breakfast: [],
            Lunch: [],
            Dinner: [],
            Snack: []
        };

        const foods = res.data.items;
        setPlanName(res.data.name);

        // ✅ Defensive: If no foods, reset state to empty
        if (!foods || foods.length === 0) {
            setAddedFood(grouped);
            setCals(0);
            setProteins(0);
            setCarbs(0);
            setFats(0);
            return;
        }

        // 🟠 Accumulate nutrient totals and build grouped food structure
        let totalCals = 0, totalProt = 0, totalCarb = 0, totalFat = 0;

        for (const item of foods) {
            const pairItem = { 
                food: item.food, 
                index: item.id,
                calories: Number(item.calories) || 0,
                proteins: Number(item.proteins) || 0,
                carbs: Number(item.carbs) || 0,
                fats: Number(item.fats) || 0,
                quantity: item.quantity || 1,
                unit: item.quantity_unit || 'g',
            };

            if (grouped[item.meal_type]) {
                grouped[item.meal_type].push(pairItem);
            }

            totalCals += pairItem.calories;
            totalProt += pairItem.proteins;
            totalCarb += pairItem.carbs;
            totalFat += pairItem.fats;
        }

        // 🟡 Update full state
        setAddedFood(grouped);
        setCals(Math.round(totalCals));
        setProteins(Math.round(totalProt));
        setCarbs(Math.round(totalCarb));
        setFats(Math.round(totalFat));
        // setQtyChange(null)

        console.log("added foods handleplanclick getfoods: ", grouped);

    } catch (err) {
        console.error("Error loading foods for plan", err);
    }
    };

    React.useEffect(() => {
        fetchPlans();
    }, []);

    return(
        <>
            <div className="plan-body">
                <Sidebar />
                <div className = "plan-header">
                    <div className="plan-header-title">Create Your Personal Diet Plan</div>
                    <div className="plan-header-subtitle">Design a customized meal plan that fits your lifestyle and goals</div>
                </div>

                {(!showNewPlan && !selectedPlanId) && (

                <div className = "plan-main-section">
                    <div className = "plan-main-section-header">
                        <div className = "plan-main-section-title">Your Meals Plans</div>
                        <div className = "plan-main-section-button-div">
                            <button className="plan-main-section-button" onClick={() => {
                                setShowNewPlan(!showNewPlan);
                                setPlanSelected(0);                     // ✅ Exit edit mode
                                setSelectedPlanId(null);                // ✅ Clear selected plan
                                setCals(0);
                                setProteins(0);
                                setCarbs(0);
                                setFats(0);
                                setAddedFood({
                                    Breakfast: [],
                                    Lunch: [],
                                    Dinner: [],
                                    Snack: []
                                });
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" className="bi bi-plus-lg" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                            </svg>
                            Add a New Plan
                            </button>
                        </div>
                    </div>

                    <div className = "plan-main-section-body">
                        {plans.map((plan) => (
                            <Plans key = {plan.meal_id} calories = {plan.calories} proteins = {plan.proteins} created = {plan.created_at} planId = {plan.meal_id} planName = { plan.plan_name } deletePlan = {(planId) => handlePlanDelete(planId)} onClick = {() => handlePlanClick(plan.meal_id)}/>
                        ))}
                    </div>
                </div>
                )}

                {(showNewPlan || selectedPlanId) && (
                <div className = "new-plan-div">
                    <div className = "new-plan-title">Weekly Diet Planner
                          <input 
    type="text" 
    value={planName} 
    onChange={(e) => setPlanName(e.target.value)} 
    placeholder="Enter plan name"
  />

                    </div>
                    {/* <div className = "new-plan-days-div">
                        <div className = "new-plan-day-div">Monday</div>
                        <div className = "new-plan-day-div">Tuesday</div>
                        <div className = "new-plan-day-div">Wednesday</div>
                        <div className = "new-plan-day-div">Thursday</div>
                        <div className = "new-plan-day-div">Friday</div>
                        <div className = "new-plan-day-div">Saturday</div>
                        <div className = "new-plan-day-div">Sunday</div>
                    </div> */}
                    <div className = "new-plan-divisions">
                        <NewPlanDivs title = "Breakfast" image = "https://www.svgrepo.com/show/1877/fried-egg.svg" food = {breakfast} setFood = {setBreakfast} onSubmit = {(qty, unit) => {handleSubmit("Breakfast", breakfast, qty, unit); setQtyChange(null)}} added = {addedFood.Breakfast} onDelete = {(item) => handleDelete("Breakfast", item)} onEdit = {(id) => setQtyChange(id)}/>
                        <NewPlanDivs title = "Lunch" image = "https://www.svgrepo.com/show/503649/lunch.svg" food = {lunch} setFood = {setLunch} onSubmit = {(qty, unit) => {handleSubmit("Lunch", lunch, qty, unit); setQtyChange(null)}} added = {addedFood.Lunch} onDelete = {(item) => handleDelete("Lunch", item)} onEdit = {(id) => setQtyChange(id)}/>
                        <NewPlanDivs title = "Dinner" image = "https://cdn.iconscout.com/icon/free/png-256/free-dinner-icon-download-in-svg-png-gif-file-formats--delicious-logo-food-restaurant-barbeque-pack-drink-icons-6131407.png?f=webp&w=256" food = {dinner} setFood = {setDinner} onSubmit = {(qty, unit) => {handleSubmit("Dinner", dinner, qty, unit); setQtyChange(null)}} added = {addedFood.Dinner} onDelete = {(item) => handleDelete("Dinner", item)} onEdit = {(id) => setQtyChange(id)}/>
                        <NewPlanDivs title = "Snacks" image = "https://cdn.iconscout.com/icon/free/png-256/free-snacks-icon-download-in-svg-png-gif-file-formats--burger-coldrink-fast-food-cinema-pack-entertainment-icons-1489357.png?f=webp&w=256" food = {snack} setFood = {setSnack} onSubmit = {(qty, unit) => {handleSubmit("Snack", snack, qty, unit); setQtyChange(null)}} added = {addedFood.Snack} onDelete = {(item) => handleDelete("Snack", item)} onEdit = {(id) => setQtyChange(id)}/>
                    </div>
                </div>
                )}
                
                {(showNewPlan || selectedPlanId) && (
                <div className = "daily-summary-div">
                    <div className = "daily-summary-header">
                        <div className = "daily-summary-img">
                            <img src = "https://www.svgrepo.com/show/404501/burn-fire-flame-hot.svg" height = "100%" width = "100%" />
                        </div>
                        <div className = "daily-summary-title">Daily Summary</div>
                    </div>
                    <div className = "daily-summary-body">
                        <Quantities title = {`${cals}`} subtitle = "Calories" />
                        <Quantities title = {`${proteins}`} subtitle = "Protein" />
                        <Quantities title = {`${carbs}`} subtitle = "Carbs" />
                        <Quantities title = {`${fats}`} subtitle = "Fats" />                  
                    </div>
                    <div className = "daily-summary-footer">
                        <button  className="daily-summary-footer-btn" onClick={() => {
                            sendNutritionValues(cals, proteins, carbs, fats);
                            setShowNewPlan(false);
                            setCals(0);
                            setProteins(0);
                            setCarbs(0);
                            setFats(0);
                            fetchPlans();setPlanSelected(0); 
                            setSelectedPlanId(null);
                        }}>
                        Save Diet Plan
                        </button>
                        <button className = "daily-summary-footer-btn">Export to PDF</button>
                    </div>
                </div>
                )}

                <Link to = "/">Home</Link>
            </div>
        </>
    );
}

export default DietPlan;