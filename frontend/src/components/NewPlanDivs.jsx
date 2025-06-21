import { useEffect, useState } from "react";
import axios from "axios";

function NewPlanDivs(props) {

    const [quantity, setQuantity] = useState("1");
    const [unit, setUnit] = useState('g');

    


    const commonUnits = ["g", "ml", "cups", "slices", "tablespoons", "teaspoons", "pieces"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (props.food.trim() === "") return;
        props.onSubmit(quantity, unit);
        props.setFood('');
        setQuantity("1");
        setUnit("g");
    }

    const handleEditClick = (item) => {
  setQuantity(item.quantity || "1");
  setUnit(item.unit || "g");
  props.setFood(item.food) 
  
  if(props.onEdit) props.onEdit(item.index);
  // Also show the food name back in the input
};

    // const fetchMessages = async () => {
    //     const res = await axios.get('http://localhost:5000/getfood');
    //     setFoods(res.data);
    // }

    // useEffect(() => {
    //     fetchMessages();
    // }, []);

    return (
    <>
        <form className = "plan-divisions" onSubmit={handleSubmit}>
            <div className = "plan-upper">
                <div className = "plan-divisions-image">
                    <img src = {props.image} height = "100%" width = "100%"/>
                </div>
                <div className = "plan-divisions-title">{props.title}</div>
            </div>
            <div className = "plan-divisions-search-div">
                <input type = "number" className = "quantity-input" value = {quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty"/>
                <input type = "text" className="search-foods" placeholder = "Search for foods...." onChange = {(e) => props.setFood(e.target.value)} value = {props.food}/>
                <select value = {unit} onChange={(e) => setUnit(e.target.value)} className = "unit-select">{commonUnits.map((u) => (<option key = {u} value = {u}>{u}</option>))}</select>
                <button type = 'submit' className="submit">Submit</button>
            </div>
            <div className = "plan-divisions-display-div">
                {/* <div className = "inner-text">{(props.added).length > 0 ? "" : `Add Foods to Your ${props.title}`}</div> */}

            <ul className = "food-list">
                {props.added?.map((item, index) => (
                    <div className = "food-item">

                            <li key = {index} id={`food-${item.index}`} className = "food-li">

                                {item.food}

                                        <div className = "food-name">
                                <div className="food-user-qty">({(item.quantity || '1')} {(item.unit) || 'g'})</div>
                                <button type = "button" className = "edit-btn" onClick={() => handleEditClick(item)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#2f80ed" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                                    </svg>
                                </button>
                                <button type = "button" className = "edit-btn" onClick = {() => props.onDelete(item)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                    </svg>
                                </button>
                                                    </div>
                            </li>

                        <div className = "food-qtys">
                                Calories: {item.calories} &nbsp;
                                Proteins: {item.proteins} &nbsp;
                                Fats: {item.fats} &nbsp;
                                Carbs: {item.carbs} &nbsp;
                        </div>
                    </div>
                ))}
            </ul>

                {/* {props.added[props.title]?.map((food, idx) => (
                    <div key={`${food}-${idx}`} className="added-food-item">
                        {food}
                    </div>
                ))} */}

                
            </div>
        </form>
    </>
    );

}

export default NewPlanDivs;
