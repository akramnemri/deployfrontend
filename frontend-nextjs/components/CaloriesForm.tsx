// frontend/components/CaloriesForm.tsx
"use client";

import { useState } from "react";

interface Row {
  Avg_BPM: number;
  Max_BPM: number;
  duration: number;
  weight: number;
  height: number;
  bmi: number;
  fat: number;
  workout_type: "Cardio" | "Strength" | "HIIT" | "Yoga";
}

export default function CaloriesForm() {
  const [rows, setRows] = useState<Row[]>([
    {
      Avg_BPM: 140,
      Max_BPM: 180,
      duration: 1.0,
      weight: 70,
      height: 1.75,
      bmi: 22.86,
      fat: 20,
      workout_type: "Cardio",
    },
  ]);
  const [results, setResults] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        Avg_BPM: 140,
        Max_BPM: 180,
        duration: 1.0,
        weight: 70,
        height: 1.75,
        bmi: 22.86,
        fat: 20,
        workout_type: "Cardio",
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
    const payload = rows.map(r => ({
      Avg_BPM: Number(r.Avg_BPM),
      Max_BPM: Number(r.Max_BPM),
      "Session_Duration (hours)": Number(r.duration),
      "Weight (kg)": Number(r.weight),
      "Height (m)": Number(r.height),
      BMI: Number(r.bmi),
      Fat_Percentage: Number(r.fat),
      Workout_Type: String(r.workout_type),
    }));

    console.log("🚀 SENDING:", payload); // DEBUG
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Check response status first
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errorData.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    console.log("📤 RESPONSE:", data); // DEBUG
    
    if (data.predictions) {
      setResults(data.predictions);
    } else if (data.error) {
      alert("Prediction failed: " + data.error);
    } else {
      console.error("Unexpected response:", data);
      alert("Unexpected response from server");
    }
  } catch (e) {
    console.error("❌ ERROR:", e);
    alert("Error: " + (e as Error).message);
  } finally {
    setLoading(false);
  }

};


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Calories Burned – Batch Prediction
      </h1>

      {/* ---- Table Header ---- */}
      <div className="grid grid-cols-10 gap-2 font-semibold text-sm mb-2">
        <div>Avg BPM</div>
        <div>Max BPM</div>
        <div>Duration (h)</div>
        <div>Weight (kg)</div>
        <div>Height (m)</div>
        <div>BMI</div>
        <div>Fat %</div>
        <div>Workout</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* ---- Dynamic Rows ---- */}
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-10 gap-2 mb-2 items-center text-sm"
        >
          <input
            type="number"
            value={r.Avg_BPM}
            onChange={(e) => updateRow(i, "Avg_BPM", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            value={r.Max_BPM}
            onChange={(e) => updateRow(i, "Max_BPM", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            step="0.1"
            value={r.duration}
            onChange={(e) => updateRow(i, "duration", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            step="0.1"
            value={r.weight}
            onChange={(e) => updateRow(i, "weight", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            step="0.01"
            value={r.height}
            onChange={(e) => updateRow(i, "height", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            step="0.01"
            value={r.bmi}
            onChange={(e) => updateRow(i, "bmi", +e.target.value)}
            className="border rounded px-1"
          />
          <input
            type="number"
            step="0.1"
            value={r.fat}
            onChange={(e) => updateRow(i, "fat", +e.target.value)}
            className="border rounded px-1"
          />
          <select
            value={r.workout_type}
            onChange={(e) =>
              updateRow(i, "workout_type", e.target.value as Row["workout_type"])
            }
            className="border rounded px-1"
          >
            <option>Cardio</option>
            <option>Strength</option>
            <option>HIIT</option>
            <option>Yoga</option>
          </select>

          <button
            onClick={() => removeRow(i)}
            className="col-span-1 text-red-600"
            disabled={rows.length === 1}
          >
            Remove
          </button>
          <div />
        </div>
      ))}

      {/* ---- Controls ---- */}
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

      {/* ---- Results Table ---- */}
      {results && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Predictions</h2>
          <table className="min-w-full border mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-1">Row #</th>
                <th className="border px-3 py-1">Calories Burned</th>
              </tr>
            </thead>
            <tbody>
              {results.map((v, i) => (
                <tr key={i}>
                  <td className="border px-3 py-1 text-center">{i + 1}</td>
                  <td className="border px-3 py-1 text-center">
                    {v.toFixed(0)}
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