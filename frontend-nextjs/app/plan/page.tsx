// frontend/app/plan/page.tsx
"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DayPlan {
  day: string;
  workout: string;
  duration: number;
}

interface UserPlan {
  user_id: string;
  goal: string;
  ai_recommended: string;
  daily_calorie_shift: number;
  week_plan: DayPlan[];
}

export default function WeekPlan() {
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Load from localStorage on mount ===
  useEffect(() => {
    const saved = localStorage.getItem("fitness_plans");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlans(parsed);
      setActiveTab(0);
    }
  }, []);

  // === Save to localStorage whenever plans change ===
  useEffect(() => {
    if (plans.length > 0) {
      localStorage.setItem("fitness_plans", JSON.stringify(plans));
    }
  }, [plans]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setPlans([]);

    try {
      // === Simulate batch input (replace with real data) ===
      const batchInput = [
        {
          user_id: "alice_123",
          goal: "lose_weight",
          current_weight: 82,
          target_weight: 75,
          days_ahead: 60,
          recommended_workout: "HIIT"
        },
        {
          user_id: "bob_456",
          goal: "gain_muscle",
          current_weight: 68,
          target_weight: 73,
          days_ahead: 90,
          recommended_workout: "Strength"
        },
        {
          user_id: "carol_789",
          goal: "maintain",
          current_weight: 60,
          target_weight: 60,
          days_ahead: 30,
          recommended_workout: "Yoga"
        }
      ];

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plan-week`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchInput)
      });

      const data = await res.json();

      if (data.plans && data.plans.length > 0) {
        setPlans(data.plans);
        setActiveTab(0);
      } else {
        setError("No plans returned.");
      }
    } catch (err: any) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Export to PDF ===
  const exportToPDF = (plan: UserPlan) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Weekly Plan - ${plan.user_id}`, 105, 20, { align: "center" });

  // Subtitle
  doc.setFontSize(12);
  doc.text(
    `Goal: ${plan.goal} | AI Pick: ${plan.ai_recommended}`,
    105,
    30,
    { align: "center" }
  );

  // Table data
  const tableData = plan.week_plan.map((d) => [
    d.day,
    d.workout,
    d.duration > 0 ? `${d.duration} min` : "Rest",
  ]);

  // ← Use autoTable from import
  autoTable(doc, {
    head: [["Day", "Workout", "Duration"]],
    body: tableData,
    startY: 40,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${plan.user_id}_week_plan.pdf`);
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Weekly Workout Planner</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={generate}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition"
        >
          {loading ? "Generating Plans…" : "Generate Plans for All Users"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* === TABS FOR MULTIPLE USERS === */}
      {plans.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {plans.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-3 text-sm font-medium transition ${
                    activeTab === i
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p.user_id} ({p.goal})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {plans[activeTab] && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {plans[activeTab].user_id}'s Plan
                    </p>
                    <p className="text-sm text-gray-600">
                      Goal: <strong>{plans[activeTab].goal}</strong> | AI Pick: <strong>{plans[activeTab].ai_recommended}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Daily Calorie Shift: <strong>{plans[activeTab].daily_calorie_shift > 0 ? "+" : ""}{plans[activeTab].daily_calorie_shift}</strong> kcal
                    </p>
                  </div>
                  <button
                    onClick={() => exportToPDF(plans[activeTab])}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                  >
                    Export PDF
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workout</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plans[activeTab].week_plan.map((d, i) => (
                        <tr key={i} className={d.workout === "Rest" ? "bg-gray-50" : "hover:bg-indigo-50"}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{d.day}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              d.workout === "Rest"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-indigo-100 text-indigo-800"
                            }`}>
                              {d.workout}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {d.duration > 0 ? `${d.duration} min` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && plans.length === 0 && !error && (
        <p className="text-center text-gray-500 mt-10">
          Click the button to generate personalized weekly plans for all users.
        </p>
      )}
      
    </div>
  );
  }
  // After plan
<div className="mt-4">
  <p>Did this plan help?</p>
  <button onClick={() => sendFeedback("yes")}>Yes</button>
  <button onClick={() => sendFeedback("no")}>No</button>
</div>

function sendFeedback(arg0: string): void {
    throw new Error("Function not implemented.");
}