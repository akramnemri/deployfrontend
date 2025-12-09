// components/WeeklyWorkoutPlan.tsx
"use client";
import { useState } from "react";

export default function WeeklyWorkoutPlan({ user }: { user: any }) {
  const [weekPlan, setWeekPlan] = useState<any>(null);
  const [activeDay, setActiveDay] = useState(0);

  const generateWeek = async () => {
    const res = await fetch("http://localhost:5000/api/weekly-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user })
    });
    const data = await res.json();
    setWeekPlan(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your 7-Day Workout Plan</h2>
        <button
          onClick={generateWeek}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg"
        >
          Generate Full Week
        </button>
      </div>

      {weekPlan ? (
        <>
          {/* Day Tabs */}
          <div className="flex overflow-x-auto border-b mb-4">
            {weekPlan.week_plan.map((day: any, i: number) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  activeDay === i
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-gray-500"
                } ${day.focus === "Rest Day" ? "text-green-600" : ""}`}
              >
                {day.day} {day.focus === "Rest Day" ? "Rest" : ""}
              </button>
            ))}
          </div>

          {/* Active Day Details */}
          {weekPlan.week_plan[activeDay] && (
            <div>
              <h3 className="text-xl font-bold mb-2">
                {weekPlan.week_plan[activeDay].day} – {weekPlan.week_plan[activeDay].focus}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{weekPlan.week_plan[activeDay].date}</p>

              {weekPlan.week_plan[activeDay].exercises.length > 0 ? (
                weekPlan.week_plan[activeDay].exercises.map((ex: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <p className="font-semibold">{ex.name}</p>
                    <p className="text-sm text-gray-600">
                      {ex.sets} × {ex.reps} reps
                      {ex.weight_kg > 0 && ` @ ${ex.weight_kg}kg`}
                      {" • "} {ex.duration_min} min • {ex.calories_burned} cal
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-lg text-green-600">
                  {weekPlan.week_plan[activeDay].message}
                </p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p>
                  <strong>Total:</strong> {weekPlan.week_plan[activeDay].total_duration_min} min •{" "}
                  {weekPlan.week_plan[activeDay].total_calories} cal burned
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">
          Click "Generate Full Week" to see your personalized 7-day plan
        </p>
      )}
    </div>
  );
}