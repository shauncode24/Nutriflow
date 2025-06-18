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
            </div>
            <div className = "plan-divisions-display-div">
                <div className = "inner-text">Add Foods to Your {props.title}</div>

            <ul>
                {props.added?.map((item, index) => (
                    <li key = {index} id={`food-${item.index}`}>
                        {(item.quantity || '1')} {(item.unit) || 'g'}
                        {item.food}
                        cals: {item.calories}
                        proteins: {item.proteins}
                        fats: {item.fats}
                        carbs: {item.carbs}
                        <button type = "button" onClick={() => handleEditClick(item)}>✏️</button>
                        <button type = "button" className = "remove-btn" onClick = {() => props.onDelete(item)}>❌</button>
                    </li>
                ))}
            </ul>

                {/* {props.added[props.title]?.map((food, idx) => (
                    <div key={`${food}-${idx}`} className="added-food-item">
                        {food}
                    </div>
                ))} */}

                <button type = 'submit'>Submit</button>
            </div>
        </form>
    </>
    );

}

export default NewPlanDivs;
