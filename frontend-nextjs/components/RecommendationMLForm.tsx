// frontend/components/RecommendationMLForm.tsx
"use client";

import { useState } from "react";

interface User {
  current_weight: number;
  height: number;
  age: number;
  fat_percentage: number;
  avg_duration: number;
  avg_calories: number;
  goal: "lose_weight" | "gain_muscle" | "maintain";
  gender: "Male" | "Female";
}

export default function RecommendationMLForm() {
  const [users, setUsers] = useState<User[]>([
    {
      current_weight: 78,
      height: 1.75,
      age: 32,
      fat_percentage: 22,
      avg_duration: 1.0,
      avg_calories: 520,
      goal: "lose_weight",
      gender: "Male"
    }
  ]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addUser = () => setUsers(prev => [...prev, {
    current_weight: 70, height: 1.70, age: 28, fat_percentage: 20,
    avg_duration: 1.0, avg_calories: 500, goal: "maintain", gender: "Male"
  }]);

  const removeUser = (i: number) => setUsers(prev => prev.filter((_, idx) => idx !== i));

  const update = (i: number, field: keyof User, value: any) => {
    setUsers(prev => prev.map((u, idx) => idx === i ? { ...u, [field]: value } : u));
  };

  const recommend = async () => {
  setLoading(true);
  try {
    const payload = users.map(u => ({
      current_weight: u.current_weight,
      height: u.height,
      age: u.age,
      fat_percentage: u.fat_percentage,
      avg_duration: u.avg_duration,
      avg_calories: u.avg_calories,
      goal: u.goal,  // ← must be "lose_weight", "gain_muscle", or "maintain"
      gender: u.gender
    }));

    console.log("Sending payload:", payload); // ← DEBUG

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommend-ml`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("API Response:", data); // ← DEBUG

    if (data.recommendations) {
      setResults(data.recommendations);
    } else {
      alert("Error: " + (data.error || "Unknown"));
    }
  } catch (e: any) {
    console.error(e);
    alert("Network error: " + e.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ML Workout Recommender</h1>

      <div className="grid grid-cols-9 gap-2 font-semibold text-sm mb-2">
  <div>Weight</div>
  <div>Height</div>
  <div>Age</div>
  <div>Fat %</div>
  <div>Dur (h)</div>
  <div>Cal</div>
  <div>Goal</div>
  <div>Gender</div>   {/* ← NEW */}
  <div>Actions</div>
</div>

{users.map((u, i) => (
  <div key={i} className="grid grid-cols-9 gap-2 mb-2 items-center text-sm">
    <input type="number" step="0.1" value={u.current_weight}
           onChange={e => update(i, "current_weight", +e.target.value)}
           className="border rounded px-1" />
    <input type="number" step="0.01" value={u.height}
           onChange={e => update(i, "height", +e.target.value)}
           className="border rounded px-1" />
    <input type="number" value={u.age}
           onChange={e => update(i, "age", +e.target.value)}
           className="border rounded px-1" />
    <input type="number" step="0.1" value={u.fat_percentage}
           onChange={e => update(i, "fat_percentage", +e.target.value)}
           className="border rounded px-1" />
    <input type="number" step="0.1" value={u.avg_duration}
           onChange={e => update(i, "avg_duration", +e.target.value)}
           className="border rounded px-1" />
    <input type="number" value={u.avg_calories}
           onChange={e => update(i, "avg_calories", +e.target.value)}
           className="border rounded px-1" />
    <select value={u.goal} onChange={e => update(i, "goal", e.target.value as any)}
            className="border rounded px-1">
      <option value="lose_weight">Lose Weight</option>
      <option value="gain_muscle">Gain Muscle</option>
      <option value="maintain">Maintain</option>
    </select>
    <select value={u.gender} onChange={e => update(i, "gender", e.target.value as any)}
            className="border rounded px-1">
      <option>Male</option>
      <option>Female</option>
    </select>
    <button onClick={() => removeUser(i)} className="text-red-600"
            disabled={users.length === 1}>X</button>
  </div>
))}
      <div className="mt-4 flex gap-3">
        <button onClick={addUser} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add User
        </button>
        <button onClick={recommend} disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded">
          {loading ? "AI Thinking…" : "Recommend with ML"}
        </button>
      </div>

{results.length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-3">AI Recommendations</h2>
    {results.map((r, i) => {
      // Extract top 2 from probabilities
      const probas = r.all_probas || []; // ← we'll send this from backend
      const top2 = probas
        .map((p: number, idx: number) => ({
          workout: r.all_workouts[idx],
          prob: p
        }))
        .sort((a: { workout: string; prob: number }, b: { workout: string; prob: number }) => b.prob - a.prob)
        .slice(0, 2);

      return (
        <div key={i} className="border rounded p-5 mb-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <p><strong>Goal:</strong> {r.goal} | <strong>Gender:</strong> {r.gender}</p>
          <p><strong>#1 Recommended:</strong> <span className="font-bold text-purple-700">{top2[0].workout}</span> ({(top2[0].prob * 100).toFixed(1)}%)</p>
          {top2[1] && (
            <p className="text-sm text-blue-700">
              <strong>Also great:</strong> {top2[1].workout} ({(top2[1].prob * 100).toFixed(1)}%)
            </p>
          )}
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-indigo-600">Why {top2[0].workout}?</summary>
            <p className="mt-1 text-gray-700">{r.explanation}</p>
          </details>
        </div>
      );
    })}
  </div>
)}
    </div>
  );
}