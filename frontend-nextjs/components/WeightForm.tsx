// frontend/components/WeightForm.tsx
"use client";

import { useState } from "react";

interface Row {
  current_day: number;
  days_ahead: number;
  steps: number;
  calories_burned: number;
  workout_type: "Strength" | "Cardio" | "HIIT";
}

export default function WeightForm() {
  const [rows, setRows] = useState<Row[]>([
    {
      current_day: 0,
      days_ahead: 30,
      steps: 10000,
      calories_burned: 500,
      workout_type: "HIIT",
    },
  ]);
  const [results, setResults] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        current_day: 0,
        days_ahead: 30,
        steps: 10000,
        calories_burned: 500,
        workout_type: "HIIT",
      },
    ]);

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof Row, value: any) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  };

const predict = async () => {
  setLoading(true);
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict-weight`;
    const payload = rows;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errorData.error || `Server error ${res.status}`);
    }

    const data = await res.json();

    if (!data) {
      throw new Error("Empty response from server");
    }

    if ("predictions" in data) {
      setResults(data.predictions);
    } else if ("predicted_weights" in data) {
      setResults(data.predicted_weights);
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      console.error("Unexpected response:", data);
      throw new Error("Unexpected response format from server");
    }
  } catch (e) {
    console.error("Prediction error:", e);
    alert("Error: " + (e as Error).message);
  } finally {
    setLoading(false);
  }
};
  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Future Weight – Batch Prediction
      </h1>

      {/* Header */}
      <div className="grid grid-cols-7 gap-2 font-semibold text-sm mb-2">
        <div>Current Day</div>
        <div>Days Ahead</div>
        <div>Steps</div>
        <div>Cal Burned</div>
        <div>Workout</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Rows */}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-2 mb-2 items-center text-sm"
        >
          <input
            type="number"
            value={r.current_day}
            onChange={(e) => updateRow(i, "current_day", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            value={r.days_ahead}
            onChange={(e) => updateRow(i, "days_ahead", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            value={r.steps}
            onChange={(e) => updateRow(i, "steps", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            value={r.calories_burned}
            onChange={(e) => updateRow(i, "calories_burned", +e.target.value)}
            className="border rounded px-1"
          />
          <select
            value={r.workout_type}
            onChange={(e) =>
              updateRow(i, "workout_type", e.target.value as Row["workout_type"])
            }
            className="border rounded px-1"
          >
            <option>Strength</option>
            <option>Cardio</option>
            <option>HIIT</option>
          </select>

          <button
            onClick={() => removeRow(i)}
            className="text-red-600"
            disabled={rows.length === 1}
          >
            Remove
          </button>
          <div />
        </div>
      ))}

      {/* Controls */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Row
        </button>
        <button
          onClick={predict}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Predicting…" : "Predict All"}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Predicted Weights (kg)</h2>
          <table className="min-w-full border mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-1">Row #</th>
                <th className="border px-3 py-1">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((v, i) => (
                <tr key={i}>
                  <td className="border px-3 py-1 text-center">{i + 1}</td>
                  <td className="border px-3 py-1 text-center">
                    {v.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}