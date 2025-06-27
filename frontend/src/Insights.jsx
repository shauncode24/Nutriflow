import "./Insights.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { ResponsiveContainer } from "recharts";
import DailyAnalysis from "./components/DailyAnalysis";
import { useLocation } from "react-router-dom";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

function Insights(props) {
  const location = useLocation();
  const insights = location.state?.insights;
  const receviedFoods = location.state?.foods;
  const planDetails = location.state?.planDetails;
  let insightsObject;
  //   let foodsObject;

  if (!insights) {
    console.log("NO");
    return <div>Loading...</div>;
  } else {
    insightsObject = JSON.parse(insights);
    // foodsObject = JSON.parse(receviedFoods);
    console.log("this is waht insights has", insightsObject);
    console.log("this is plans foods: ", receviedFoods);
    console.log("plan deatilas: ", planDetails.plan_name);

    const pieData = [
      { name: "Proteins", value: 0 },
      { name: "Carbs", value: 0 },
      { name: "Fats", value: 0 },
    ];
    console.log("Pie Data: ", pieData);
    const barCaloriesData = [];
    const barMacrosData = [];

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];

    validMealTypes.forEach((mealType) => {
      const items = receviedFoods[capitalize(mealType)];
      console.log(`Processing ${mealType}:`, items);

      if (!Array.isArray(items)) return;

      let totalCalories = 0;
      let proteins = 0,
        carbs = 0,
        fats = 0;

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

    const getColor = (rating) => {
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
          return "gray"; // fallback
      }
    };

    return (
      <>
        <div className="insights-body">
          <div className="header-div">
            <div className="title">NutriAnalyzer</div>
            <div className="subtitle">Analyze your meals</div>
          </div>

          <div className="plan-details">
            <div className="plan-name">{planDetails.plan_name}</div>
            <div className="plan-status">
              <div
                className="colordiv"
                style={{ backgroundColor: getColor(insightsObject.dietRating) }}
              ></div>
            </div>
          </div>

          <div className="main-ai-insight">
            <div className="main-ai-insights-title">AI Diet Analysis</div>
            <div className="main-ai-insights-body">
              <div className="insight">{insightsObject.insight1}</div>
              <div className="insight">{insightsObject.insight2}</div>
              <div className="insight">{insightsObject.insight3}</div>
            </div>
          </div>

          <div className="graphs-div">
            <div className="graph-1">
              <p>Macronutrient Distribution</p>
              <div className="graph-body">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginTop: "12px",
                  }}
                >
                  {["Protein", "Carbohydrates", "Fats"].map((label, i) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "clamp(0.8rem, 1vw + 0.2rem, 1rem)",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: COLORS[i],
                          borderRadius: "2px",
                        }}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Percent Values */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginTop: "20px",
                  }}
                >
                  {pieData.map((entry, index) => {
                    const total = pieData.reduce(
                      (acc, item) => acc + item.value,
                      0
                    );
                    const percentage = total
                      ? ((entry.value / total) * 100).toFixed(0)
                      : 0;
                    const color = COLORS[index % COLORS.length];
                    return (
                      <div
                        key={entry.name}
                        style={{
                          backgroundColor: "#f9f9f9",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          textAlign: "center",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          minWidth: "80px",
                          flex: "1 1 90px",
                          maxWidth: "150px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                            color,
                          }}
                        >
                          {entry.value.toFixed(0)}g
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
                            color: "#555",
                          }}
                        >
                          {entry.name} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="graph-1">
              <p>Calories per Meal</p>
              <div className="graph-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    width={400}
                    height={400}
                    data={barCaloriesData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meal_type" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="calories" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="graph-1">
              <p>Meal Macronutrient Breakdown</p>
              <div className="graph-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    width={400}
                    height={400}
                    data={barMacrosData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meal_type" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="proteins" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="carbs" stackId="a" fill="#ffc658" />
                    <Bar dataKey="fats" stackId="a" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: 15,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#82ca9d",
                        marginRight: 6,
                      }}
                    ></div>
                    <span style={{ fontSize: "14px" }}>Proteins</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: 15,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#ffc658",
                        marginRight: 6,
                      }}
                    ></div>
                    <span style={{ fontSize: "14px" }}>Carbs</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#ff8042",
                        marginRight: 6,
                      }}
                    ></div>
                    <span style={{ fontSize: "14px" }}>Fats</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="meal-level-analysis">
            <p>Detailed Meal Breakdown</p>
            <DailyAnalysis
              indFoods={receviedFoods.Breakfast}
              insight={insightsObject.breakfast}
              type="Breakfast"
            />
            <DailyAnalysis
              indFoods={receviedFoods.Lunch}
              insight={insightsObject.lunch}
              type="Lunch"
            />
            <DailyAnalysis
              indFoods={receviedFoods.Dinner}
              insight={insightsObject.dinner}
              type="Dinner"
            />
            <DailyAnalysis
              indFoods={receviedFoods.Snack}
              insight={insightsObject.snacks}
              type="Snack"
            />
          </div>

          <div className="recommendations-div">
            <div className="recommendations-title">Recommendations</div>
            <div className="recommendations-body">
              {insightsObject.suggestion1}
            </div>
            <div className="recommendations-body">
              {insightsObject.suggestion2}
            </div>
            <div className="recommendations-body">
              {insightsObject.suggestion3}
            </div>
            {/* <div className = "recommendations-body"></div> */}
          </div>

          <div className="nutrients-div">
            <div className="nutrient-title">Nutrients Insight</div>
            <div className="nutrient-body">
              <div className="nutrients-insight">
                {insightsObject.nutrientInsights}
              </div>
              <div className="nutrients-left">
                <div className="nutrient">
                  <div className="nutrient-title-in">Proteins</div>
                  <div
                    className="nutrient-status"
                    style={{
                      backgroundColor: getColor(insightsObject.proteins),
                    }}
                  ></div>
                </div>
                <div className="nutrient">
                  <div className="nutrient-title-in">Carbohydrates</div>
                  <div
                    className="nutrient-status"
                    style={{
                      backgroundColor: getColor(insightsObject.carbs),
                    }}
                  ></div>
                </div>
                <div className="nutrient">
                  <div className="nutrient-title-in">Fats</div>
                  <div
                    className="nutrient-status"
                    style={{
                      backgroundColor: getColor(insightsObject.fats),
                    }}
                  ></div>
                </div>
                <div className="nutrient" style={{ border: "none" }}>
                  <div className="nutrient-title-in">Calories</div>
                  <div
                    className="nutrient-status"
                    style={{
                      backgroundColor: getColor(insightsObject.calories),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Insights;
