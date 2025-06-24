import './Insights.css';
import DailyAnalysis from './components/DailyAnalysis';

function Insights() {
    return(
        <>
            <div className='insights-body'>
                <div className = "header-div">
                    <div className = "title">NutriAnalyzer</div>
                    <div className = "subtitle">Analyze your meals</div>
                </div>

                <div className = "main-ai-insight">
                    <div className = "main-ai-insights-title"></div>
                    <div className = "main-ai-insights-body">
                        <div className = "insight"></div>
                        <div className = "insight"></div>
                        <div className = "insight"></div>
                    </div>
                </div>

                <div className = "graphs-div">
                    <div className = "graph-1"></div>
                    <div className = "graph-1"></div>
                    <div className = "graph-1"></div>
                </div>

                <div className = "meal-level-analysis">
                    <DailyAnalysis />
                    <DailyAnalysis />
                    <DailyAnalysis />
                    <DailyAnalysis />
                </div>

                <div className = "recommendations-div">
                    <div className = "recommendations-title"></div>
                    <div className = "recommendations-body"></div>
                    <div className = "recommendations-body"></div>
                    <div className = "recommendations-body"></div>
                    <div className = "recommendations-body"></div>
                </div>
            </div>
        </>
    );
}

export default Insights;