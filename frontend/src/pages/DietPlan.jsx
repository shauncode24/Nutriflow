import React from "react";
import { Link } from "react-router-dom";
import NewPlanDivs from "../components/diet/NewPlanDivs";
import Plans from "../components/diet/Plans";
import DailySummary from "../components/diet/DailySummary";
import Sidebar from "../components/ui/Sidebar";
import { useFoodPlan } from "../hooks/useFoodPlan";
import { useUsername } from "../hooks/useUsername";
import "../styles/DietPlan.css";

function DietPlan() {
  const username = useUsername();

  const {
    breakfast, setBreakfast,
    lunch, setLunch,
    dinner, setDinner,
    snack, setSnack,
    cals, proteins, carbs, fats,
    showNewPlan, setShowNewPlan,
    plans,
    addedFood,
    planSelected,
    selectedPlanId,
    planName, setPlanName,
    aiRes,
    qtyChanged, setQtyChange,
    handleSubmit,
    handleDelete,
    handlePlanDelete,
    handlePlanClick,
    sendNutritionValues,
    getInsights,
    resetNewPlan,
  } = useFoodPlan();

  return (
    <>
      <div className="plan-default plan-body">
        <Sidebar user={username} />
        <div className="plan-default plan-header">
          <div className="plan-default plan-header-title">
            Create Your Personal Diet Plan
          </div>
          <div className="plan-default plan-header-subtitle">
            Design a customized meal plan that fits your lifestyle and goals
          </div>
        </div>

        {!showNewPlan && !selectedPlanId && (
          <div className="plan-default plan-main-section">
            <div className="plan-default plan-main-section-header">
              <div className="plan-default plan-main-section-title">
                Your Meals Plans
              </div>
              <div className="plan-default plan-main-section-button-div">
                <button
                  className="plan-default plan-main-section-button"
                  onClick={() => {
                    setShowNewPlan(!showNewPlan);
                    resetNewPlan();
                    setShowNewPlan(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    fill="white"
                    className="plan-default bi bi-plus-lg"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                    />
                  </svg>
                  Add a New Plan
                </button>
              </div>
            </div>

            <div className="plan-default plan-main-section-body">
              {plans && plans.length > 0 ? (
                plans.map((plan) => (
                  <Plans
                    key={plan.meal_id}
                    calories={plan.calories}
                    proteins={plan.proteins}
                    carbs={plan.carbs}
                    created={plan.created_at}
                    planId={plan.meal_id}
                    planName={plan.plan_name}
                    deletePlan={(planId) => handlePlanDelete(planId)}
                    onClick={() => handlePlanClick(plan.meal_id)}
                    onView={() => getInsights(plan.meal_id)}
                    aiResponse={aiRes}
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    fontSize: "1.2rem",
                    width: "100%",
                    fontFamily: "Outfit",
                  }}
                >
                  No meal plans found.
                </div>
              )}
            </div>
          </div>
        )}

        {(showNewPlan || selectedPlanId) && (
          <div className="plan-default new-plan-div">
            <div className="plan-default new-plan-title">
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
                className="plan-default plan-name"
              />
            </div>
            <div className="plan-default new-plan-divisions">
              <NewPlanDivs
                title="Breakfast"
                image="https://www.svgrepo.com/show/1877/fried-egg.svg"
                food={breakfast}
                setFood={setBreakfast}
                onSubmit={(qty, unit) => {
                  handleSubmit("Breakfast", breakfast, qty, unit);
                  setQtyChange(null);
                }}
                added={addedFood.Breakfast}
                onDelete={(item) => handleDelete("Breakfast", item)}
                onEdit={(id) => setQtyChange(id)}
              />
              <NewPlanDivs
                title="Lunch"
                image="https://www.svgrepo.com/show/503649/lunch.svg"
                food={lunch}
                setFood={setLunch}
                onSubmit={(qty, unit) => {
                  handleSubmit("Lunch", lunch, qty, unit);
                  setQtyChange(null);
                }}
                added={addedFood.Lunch}
                onDelete={(item) => handleDelete("Lunch", item)}
                onEdit={(id) => setQtyChange(id)}
              />
              <NewPlanDivs
                title="Dinner"
                image="https://cdn.iconscout.com/icon/free/png-256/free-dinner-icon-download-in-svg-png-gif-file-formats--delicious-logo-food-restaurant-barbeque-pack-drink-icons-6131407.png?f=webp&w=256"
                food={dinner}
                setFood={setDinner}
                onSubmit={(qty, unit) => {
                  handleSubmit("Dinner", dinner, qty, unit);
                  setQtyChange(null);
                }}
                added={addedFood.Dinner}
                onDelete={(item) => handleDelete("Dinner", item)}
                onEdit={(id) => setQtyChange(id)}
              />
              <NewPlanDivs
                title="Snacks"
                image="https://cdn.iconscout.com/icon/free/png-256/free-snacks-icon-download-in-svg-png-gif-file-formats--burger-coldrink-fast-food-cinema-pack-entertainment-icons-1489357.png?f=webp&w=256"
                food={snack}
                setFood={setSnack}
                onSubmit={(qty, unit) => {
                  handleSubmit("Snack", snack, qty, unit);
                  setQtyChange(null);
                }}
                added={addedFood.Snack}
                onDelete={(item) => handleDelete("Snack", item)}
                onEdit={(id) => setQtyChange(id)}
              />
            </div>
          </div>
        )}

        {(showNewPlan || selectedPlanId) && (
          <DailySummary
            cals={cals}
            proteins={proteins}
            carbs={carbs}
            fats={fats}
            onSave={() => {
              sendNutritionValues(cals, proteins, carbs, fats);
              resetNewPlan();
            }}
          />
        )}
      </div>
    </>
  );
}

export default DietPlan;