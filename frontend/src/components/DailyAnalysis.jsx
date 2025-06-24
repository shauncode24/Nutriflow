import '../Insights.css'
import AnalysisIndividual from './AnalysisIndividual';

function DailyAnalysis() {
    return(
        <>
            <div className = "daily-analysis-div">
                <div className = "daily-analysis-header">
                    <div className = "daily-analysis-title"></div>
                </div>

                <div className = "daily-analysis-body">
                    <AnalysisIndividual />
                    <AnalysisIndividual />
                </div>

                <div className = "daily-analysis-footer-div">
                    <div className = "daily-analysis-footer"></div>
                </div>

            </div>
        </>
    );
}

export default DailyAnalysis;