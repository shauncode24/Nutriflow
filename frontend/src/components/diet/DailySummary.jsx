import { Link } from "react-router-dom";
import Quantities from "../ui/Quantities";

function DailySummary(props) {
    const { cals, proteins, carbs, fats, onSave, onReset } = props;

    return (
        <div className="plan-default daily-summary-div">
            <div className="plan-default daily-summary-header">
                <div className="plan-default daily-summary-img">
                    <img
                        src="https://www.svgrepo.com/show/404501/burn-fire-flame-hot.svg"
                        height="100%"
                        width="100%"
                    />
                </div>
                <div className="plan-default daily-summary-title">Daily Summary</div>
            </div>
            <div className="plan-default daily-summary-body">
                <Quantities title={`${cals}`} subtitle="Calories" />
                <Quantities title={`${proteins}g`} subtitle="Protein" />
                <Quantities title={`${carbs}g`} subtitle="Carbs" />
                <Quantities title={`${fats}g`} subtitle="Fats" />
            </div>
            <div className="plan-default daily-summary-footer">
                <button
                    className="plan-default daily-summary-footer-btn final-submit"
                    onClick={onSave}
                >
                    Save Diet Plan
                </button>
                <button className="plan-default daily-summary-footer-btn">
                    <Link to="/custommeal">Custom</Link>
                </button>
            </div>
        </div>
    );
}

export default DailySummary;