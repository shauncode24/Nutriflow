const VALID_MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const buildChartData = (receviedFoods) => {
  const pieData = [
    { name: "Proteins", value: 0 },
    { name: "Carbs", value: 0 },
    { name: "Fats", value: 0 },
  ];

  const barCaloriesData = [];
  const barMacrosData = [];

  VALID_MEAL_TYPES.forEach((mealType) => {
    const items = receviedFoods[capitalize(mealType)];
    if (!Array.isArray(items)) return;

    let totalCalories = 0;
    let proteins = 0, carbs = 0, fats = 0;

    items.forEach((item) => {
      totalCalories += parseFloat(item.calories || 0);
      proteins += parseFloat(item.proteins || 0);
      carbs += parseFloat(item.carbs || 0);
      fats += parseFloat(item.fats || 0);
    });

    pieData[0].value += proteins;
    pieData[1].value += carbs;
    pieData[2].value += fats;

    barCaloriesData.push({
      meal_type: capitalize(mealType),
      calories: parseFloat(totalCalories.toFixed(2)),
    });

    barMacrosData.push({
      meal_type: capitalize(mealType),
      proteins: parseFloat(proteins.toFixed(2)),
      carbs: parseFloat(carbs.toFixed(2)),
      fats: parseFloat(fats.toFixed(2)),
    });
  });

  return { pieData, barCaloriesData, barMacrosData };
};

export const getColor = (rating) => {
  const value = rating.toLowerCase();
  switch (value) {
    case "red":
    case "high":
      return "red";
    case "yellow":
    case "medium":
      return "yellow";
    case "green":
    case "low":
      return "green";
    default:
      return "gray";
  }
};