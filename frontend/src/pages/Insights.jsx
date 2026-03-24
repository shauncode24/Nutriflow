import "../styles/Insights.css";
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
} from "recharts";
import { ResponsiveContainer } from "recharts";
import DailyAnalysis from "../components/insights/DailyAnalysis";
import { useLocation } from "react-router-dom";
import { buildChartData, getColor } from "../hooks/useInsights";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

function Insights() {
  const location = useLocation();
  const insights = location.state?.insights;
  const receviedFoods = location.state?.foods;
  const planDetails = location.state?.planDetails;

  if (!insights) {
    console.log("NO");
    return <div>Loading...</div>;
  }

  const insightsObject = JSON.parse(insights);
  console.log("this is what insights has", insightsObject);
  console.log("this is plans foods: ", receviedFoods);
  console.log("plan details: ", planDetails.plan_name);

  const { pieData, barCaloriesData, barMacrosData } = buildChartData(receviedFoods);
  console.log("Pie Data: ", pieData);

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
                  const total = pieData.reduce((acc, item) => acc + item.value, 0);
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
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                {[
                  { label: "Proteins", color: "#82ca9d" },
                  { label: "Carbs", color: "#ffc658" },
                  { label: "Fats", color: "#ff8042" },
                ].map(({ label, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", marginRight: 15 }}>
                    <div style={{ width: 12, height: 12, backgroundColor: color, marginRight: 6 }}></div>
                    <span style={{ fontSize: "14px" }}>{label}</span>
                  </div>
                ))}
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
          <div className="recommendations-body">{insightsObject.suggestion1}</div>
          <div className="recommendations-body">{insightsObject.suggestion2}</div>
          <div className="recommendations-body">{insightsObject.suggestion3}</div>
        </div>

        <div className="nutrients-div">
          <div className="nutrient-title">Nutrients Insight</div>
          <div className="nutrient-body">
            <div className="nutrients-insight">
              {insightsObject.nutrientInsights}
            </div>
            <div className="nutrients-left">
              {[
                { label: "Proteins", key: "proteins" },
                { label: "Carbohydrates", key: "carbs" },
                { label: "Fats", key: "fats" },
                { label: "Calories", key: "calories" },
              ].map(({ label, key }, i) => (
                <div
                  key={label}
                  className="nutrient"
                  style={i === 3 ? { border: "none" } : {}}
                >
                  <div className="nutrient-title-in">{label}</div>
                  <div
                    className="nutrient-status"
                    style={{ backgroundColor: getColor(insightsObject[key]) }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Insights;