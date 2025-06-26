import "../Insights.css";
import AnalysisIndividual from "./AnalysisIndividual";

function DailyAnalysis(props) {
  const totalCaloriesByMeal = (props.indFoods || []).reduce((acc, item) => {
    const calories = parseFloat(item?.calories) || 0;
    return acc + calories;
  }, 0);

  console.log("by breakfast", totalCaloriesByMeal);

  return (
    <>
      <div className="daily-analysis-div">
        <div className="daily-analysis-header">
          <div className="daily-analysis-title">{props.type}</div>
          <b>{totalCaloriesByMeal.toFixed(2)} kCal</b>
        </div>

        <div className="daily-analysis-body">
          {props.indFoods &&
            props.indFoods.map((meal, index) => (
              <AnalysisIndividual key={meal.id || index} info={meal} />
            ))}
        </div>

        <div className="daily-analysis-footer-div">{props.insight}</div>
      </div>
    </>
  );
}

export default DailyAnalysis;
