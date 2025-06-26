import './Insights.css';
import DailyAnalysis from './components/DailyAnalysis';
import { useLocation } from 'react-router-dom';


  function Insights(props) {
    const location = useLocation();
  const insights = location.state?.insights;
  const receviedFoods = location.state?.foods;
  const planDetails = location.state?.planDetails;
  let insightsObject;
//   let foodsObject;

  if (!insights) {
    console.log("NO")
  }
  else {

insightsObject = JSON.parse(insights);
// foodsObject = JSON.parse(receviedFoods);
console.log("this is waht insights has", insightsObject)
console.log("this is plans foods: ", receviedFoods.Breakfast)
console.log("plan deatilas: ", planDetails)
  
  return(        
        <>
            <div className='insights-body'>
                <div className = "header-div">
                    <div className = "title">NutriAnalyzder</div>
                    <div className = "subtitle">Analyze your meals</div>
                </div>

                <div className = "main-ai-insight">
                    <div className = "main-ai-insights-title"></div>
                    <div className = "main-ai-insights-body">
                        <div className = "insight">{insightsObject.insight1}</div>
                        <div className = "insight">{insightsObject.insight2}</div>
                        <div className = "insight">{insightsObject.insight3}</div>
                    </div>
                </div>

                <div className = "graphs-div">
                    <div className = "graph-1"></div>
                    <div className = "graph-1"></div>
                    <div className = "graph-1"></div>
                </div>

                <div className = "meal-level-analysis">
                    <DailyAnalysis indFoods = {receviedFoods.Breakfast} insight = {insightsObject.breakfast} type = "Breakfast"/>
                    <DailyAnalysis indFoods = {receviedFoods.Lunch} insight = {insightsObject.lunch} type = "Lunch"/>
                    <DailyAnalysis indFoods = {receviedFoods.Dinner} insight = {insightsObject.dinner} type = "Dinner"/>
                    <DailyAnalysis indFoods = {receviedFoods.Snack} insight = {insightsObject.snacks} type = "Snack"/>
                </div>

                <div className = "recommendations-div">
                    <div className = "recommendations-title"></div>
                    <div className = "recommendations-body">{insightsObject.suggestion1}</div>
                    <div className = "recommendations-body">{insightsObject.suggestion2}</div>
                    <div className = "recommendations-body">{insightsObject.suggestion3}</div>
                    <div className = "recommendations-body"></div>
                </div>
            </div>
        </>
    );
}
}

export default Insights;