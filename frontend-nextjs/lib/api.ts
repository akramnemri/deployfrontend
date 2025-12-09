// lib/api.ts
export interface UserProfile {
  current_weight: number;
  target_weight: number;
  height: number;
  age: number;
  fat_percentage: number;
  avg_duration: number;
  avg_calories: number;
  goal: 'lose_weight' | 'gain_muscle' | 'maintain';
  gender: 'Male' | 'Female';
  days_ahead?: number;
}

export interface MLRecommendation {
  goal: string;
  gender: string;
  recommended_workout: string;
  confidence: number;
  duration_hours: number;
  bmi: number;
  explanation: string;
  all_workouts: string[];
  all_probas: number[];
}

export interface WeeklyPlanAPI {
  user_id: string;
  goal: string;
  ai_recommended: string;
  daily_calorie_shift: number;
  week_plan: {
    day: string;
    workout: string;
    duration: number;
  }[];
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchMLRecommendation(userData: UserProfile): Promise<MLRecommendation> {
  const response = await fetch(`${API_BASE}/recommend-ml`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`ML API error: ${response.status}`);
  }

  const data = await response.json();
  return data.recommendations[0];
}

export async function fetchWeeklyPlan(userData: UserProfile): Promise<WeeklyPlanAPI> {
  const response = await fetch(`${API_BASE}/plan-week`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Plan API error: ${response.status}`);
  }

  const data = await response.json();
  return data.plans[0];
}

export async function fetchDailyWorkout(userData: UserProfile, dayOffset: number = 0) {
  const response = await fetch(`${API_BASE}/workout/daily-workout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: userData,
      day_offset: dayOffset,
    }),
  });

  if (!response.ok) {
    throw new Error(`Workout API error: ${response.status}`);
  }

  return response.json();
}