// frontend/components/RecommendationForm.tsx
"use client";

import { useState } from "react";

interface User {
  current_weight: number;
  target_weight: number;
  days_ahead: number;
  goal: "lose_weight" | "gain_muscle" | "maintain";
}

export default function RecommendationForm() {
  const [users, setUsers] = useState<User[]>([
    { current_weight: 75, target_weight: 70, days_ahead: 60, goal: "lose_weight" }
  ]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addUser = () => setUsers(prev => [...prev, { current_weight: 70, target_weight: 70, days_ahead: 30, goal: "maintain" }]);
  const removeUser = (i: number) => setUsers(prev => prev.filter((_, idx) => idx !== i));

  const update = (i: number, field: keyof User, value: any) => {
    setUsers(prev => prev.map((u, idx) => idx === i ? { ...u, [field]: value } : u));
  };

  const recommend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(users.map(u => ({
          current_weight: u.current_weight,
          target_weight: u.target_weight,
          days_ahead: u.days_ahead,
          goal: u.goal
        })))
      });
      const data = await res.json();
      if (data.recommendations) setResults(data.recommendations);
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Workout Recommendation Engine</h1>

      <div className="grid grid-cols-6 gap-2 font-semibold text-sm mb-2">
        <div>Current (kg)</div>
        <div>Target (kg)</div>
        <div>Days</div>
        <div>Goal</div>
        <div className="col-span-2">Actions</div>
      </div>

      {users.map((u, i) => (
        <div key={i} className="grid grid-cols-6 gap-2 mb-2 items-center text-sm">
          <input type="number" step="0.1" value={u.current_weight}
                 onChange={e => update(i, "current_weight", +e.target.value)}
                 className="border rounded px-1" />
          <input type="number" step="0.1" value={u.target_weight}
                 onChange={e => update(i, "target_weight", +e.target.value)}
                 className="border rounded px-1" />
          <input type="number" value={u.days_ahead}
                 onChange={e => update(i, "days_ahead", +e.target.value)}
                 className="border rounded px-1" />
          <select value={u.goal} onChange={e => update(i, "goal", e.target.value as any)}
                  className="border rounded px-1">
            <option value="lose_weight">Lose Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
            <option value="maintain">Maintain</option>
          </select>
          <button onClick={() => removeUser(i)} className="text-red-600"
                  disabled={users.length === 1}>Remove</button>
          <div />
        </div>
      ))}

      <div className="mt-4 flex gap-3">
        <button onClick={addUser} className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add User
        </button>
        <button onClick={recommend} disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded">
          {loading ? "Thinking…" : "Get Recommendations"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Your Personalized Plans</h2>
          {results.map((r, i) => (
            <div key={i} className="border rounded p-4 mb-3 bg-gradient-to-r from-indigo-50 to-purple-50">
              <p><strong>Goal:</strong> {r.goal}</p>
              <p><strong>Workout:</strong> {r.recommended_workout} – {r.duration_hours}h/session</p>
              <p><strong>Intensity:</strong> {r.intensity} | <strong>Frequency:</strong> {r.frequency_per_week}x/week</p>
              <p className="text-sm text-gray-600 mt-1">{r.tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}