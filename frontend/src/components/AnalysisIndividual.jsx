import '../Insights.css'

function AnalysisIndividual(props) {
    return(
        <>
            <div className = "row">
                <div className = "left-row">{props.info.food} <div> &nbsp;&nbsp;({props.info.quantity} {props.info.quantity_unit})</div></div>
                <div className = "right-row">{props.info.calories} kCal &nbsp;&nbsp;|&nbsp;&nbsp; {props.info.proteins} g protein</div>
            </div>
        </>
    );
}

export default AnalysisIndividual;