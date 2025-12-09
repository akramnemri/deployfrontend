// components/DailyWorkout.tsx
"use client";
import { useState } from "react";

export default function DailyWorkout({ user }: { user: any }) {
  const [workout, setWorkout] = useState<any>(null);
  const [dayOffset, setDayOffset] = useState(0);

  const generate = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/daily-workout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, day_offset: dayOffset })
    });
    const data = await res.json();
    setWorkout(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {workout?.day || "Today"}'s Workout
        </h2>
        <button
          onClick={generate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Generate
        </button>
      </div>

      {workout?.focus === "Rest Day" ? (
        <p className="text-xl text-green-600">{workout.message}</p>
      ) : workout ? (
        <div>
          <p className="text-lg font-semibold mb-3">{workout.focus}</p>
          {workout.exercises.map((ex: any, i: number) => (
            <div key={i} className="bg-gray-50 p-4 rounded mb-3">
              <p className="font-bold">{ex.name}</p>
              <p className="text-sm text-gray-600">
                {ex.sets} sets × {ex.reps} reps
                {ex.weight_kg > 0 && ` @ ${ex.weight_kg}kg`}
                {" • "} {ex.duration_min} min • {ex.calories_burned} cal
              </p>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t">
            <p>Total: <strong>{workout.total_duration_min} min</strong> • <strong>{workout.total_calories} cal burned</strong></p>
          </div>
        </div>
      ) : (
        <p>Click Generate to see your personalized workout</p>
      )}
    </div>
  );
}