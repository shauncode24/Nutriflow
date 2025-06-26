import '../Insights.css'

function AnalysisIndividual(props) {
    return(
        <>
            <div className = "row">
                <div className = "left-row">{props.info.food}</div>
                <div className = "right-row">{props.info.calories} cals | {props.info.proteins} proteins</div>
            </div>
        </>
    );
}

export default AnalysisIndividual;