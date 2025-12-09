'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchMLRecommendation,
  fetchWeeklyPlan,
  fetchDailyWorkout,
  type UserProfile,
  type MLRecommendation,
} from '../lib/api';

interface Exercise {
  id: string;
  name: string;
  duration: number;
  sets?: number;
  reps?: number;
  completed?: boolean;
}

interface DayPlan {
  id: string;
  day: string;
  date: Date;
  exercises: Exercise[];
  status: 'pending' | 'completed' | 'missed' | 'unavailable';
  isRestDay: boolean;
}

interface WeeklyPlan {
  id: string;
  userId: string;
  weekStart: Date;
  days: DayPlan[];
  totalPlannedWorkouts: number;
  completedWorkouts: number;
}

const DynamicWeeklyPlan: React.FC = () => {
  // State management
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showReconfigureModal, setShowReconfigureModal] = useState(false);
  const [dayToReconfigure, setDayToReconfigure] = useState<string | null>(null);
  const [overrideDate, setOverrideDate] = useState<string>('');
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [exerciseToReplace, setExerciseToReplace] = useState<{ dayId: string; exerciseId: string } | null>(null);
  const [showCantTrainModal, setShowCantTrainModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // User profile state
  const [userProfile] = useState<UserProfile>({
    current_weight: 75,
    target_weight: 70,
    height: 1.75,
    age: 30,
    fat_percentage: 20,
    avg_duration: 1.0,
    avg_calories: 500,
    goal: 'lose_weight',
    gender: 'Male',
    days_ahead: 30,
  });

  // Available exercises for replacement
  const availableExercises: Exercise[] = [
    { id: 'new-1', name: 'Push-ups', duration: 15, sets: 3, reps: 15 },
    { id: 'new-2', name: 'Lunges', duration: 20, sets: 3, reps: 12 },
    { id: 'new-3', name: 'Yoga', duration: 30 },
    { id: 'new-4', name: 'Cycling', duration: 40 },
    { id: 'new-5', name: 'Dumbbell Curls', duration: 25, sets: 3, reps: 10 },
  ];

  // ==================== HELPER FUNCTIONS ====================

  const getCurrentDate = (): Date => {
    return overrideDate ? new Date(overrideDate) : new Date();
  };

  const isCurrentDay = (dayDate: Date): boolean => {
    const today = getCurrentDate();
    return dayDate.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'missed':
        return '❌';
      case 'unavailable':
        return '🚫';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getDayMessage = (day: DayPlan): string => {
    if (day.isRestDay) return 'Rest Day';
    if (!isCurrentDay(day.date)) return 'Actions available on this day only';
    if (day.status === 'completed') return 'Great job!';
    if (day.status === 'missed') return 'Day missed. Reconfigure?';
    if (day.status === 'unavailable') return 'Day marked unavailable';
    return 'Mark complete when done';
  };

  // ==================== API TRANSFORMATION ====================

  const transformAPIToPlan = async (apiPlan: any): Promise<WeeklyPlan> => {
    const today = getCurrentDate();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const days: DayPlan[] = await Promise.all(
      apiPlan.week_plan.map(async (day: any, index: number) => {
        const dayDate = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);

        const workoutDetails = await fetchDailyWorkout(userProfile, index);

        const exercises: Exercise[] = workoutDetails.exercises.map((ex: any, exIndex: number) => ({
          id: `ex-${index}-${exIndex}`,
          name: ex.name,
          duration: ex.duration_min,
          sets: ex.sets,
          reps: ex.reps,
          completed: false,
        }));

        const status: DayPlan['status'] = dayDate < today ? 'missed' : dayDate > today ? 'pending' : 'pending';

        return {
          id: `day-${index}`,
          day: day.day,
          date: dayDate,
          exercises,
          status,
          isRestDay: day.workout === 'Rest' || day.duration === 0,
        };
      })
    );

    return {
      id: 'week-1',
      userId: 'user-1',
      weekStart,
      days,
      totalPlannedWorkouts: days.filter((d) => !d.isRestDay).length,
      completedWorkouts: 0,
    };
  };

  // ==================== LIFECYCLE EFFECTS ====================

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      try {
        const apiPlan = await fetchWeeklyPlan(userProfile);
        const transformed = await transformAPIToPlan(apiPlan);
        setWeeklyPlan(transformed);
      } catch (error) {
        console.error('Failed to load plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [userProfile, overrideDate]);

  useEffect(() => {
    const checkAndMarkMissed = () => {
      const now = getCurrentDate();
      setWeeklyPlan((prev) => {
        if (!prev) return prev;

        let changed = false;
        const updatedDays = prev.days.map((day) => {
          const dayEnd = new Date(day.date);
          dayEnd.setHours(23, 59, 59, 999);

          if (now > dayEnd && day.status === 'pending' && !day.isRestDay) {
            changed = true;
            return { ...day, status: 'missed' as const };
          }
          return day;
        });

        if (changed) {
          const missedDay = updatedDays.find((d) => d.status === 'missed' && isCurrentDay(d.date));
          if (missedDay) {
            setTimeout(() => handleReconfigure(missedDay.id), 500);
          }
        }

        return changed ? { ...prev, days: updatedDays } : prev;
      });
    };

    checkAndMarkMissed();
    const interval = setInterval(checkAndMarkMissed, 60000);
    return () => clearInterval(interval);
  }, [overrideDate]);

  // ==================== ACTION HANDLERS ====================

  const markDayCompleted = (dayId: string) => {
    setWeeklyPlan((prev) => {
      if (!prev) return prev;

      const updatedDays = prev.days.map((day) => {
        if (day.id === dayId) {
          const updatedExercises = day.exercises.map((ex) => ({ ...ex, completed: true }));
          return {
            ...day,
            status: 'completed' as const,
            exercises: updatedExercises,
          };
        }
        return day;
      });

      const completedCount = updatedDays.filter((d) => d.status === 'completed').length;
      return { ...prev, days: updatedDays, completedWorkouts: completedCount };
    });
  };

  const markDayMissed = (dayId: string) => {
    setWeeklyPlan((prev) => {
      if (!prev) return prev;

      const updatedDays = prev.days.map((day) => {
        if (day.id === dayId) {
          return { ...day, status: 'missed' as const };
        }
        return day;
      });

      return { ...prev, days: updatedDays };
    });
  };

  const markDayUnavailable = (dayId: string) => {
    setWeeklyPlan((prev) => {
      if (!prev) return prev;

      const updatedDays = prev.days.map((day) => {
        if (day.id === dayId) {
          return { ...day, status: 'unavailable' as const, exercises: [] };
        }
        return day;
      });

      return redistributeWorkouts({ ...prev, days: updatedDays });
    });
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    setWeeklyPlan((prev) => {
      if (!prev) return prev;

      const updatedDays = prev.days.map((day) => {
        if (day.id === dayId) {
          const updatedExercises = day.exercises.filter((ex) => ex.id !== exerciseId);
          return { ...day, exercises: updatedExercises };
        }
        return day;
      });

      return { ...prev, days: updatedDays };
    });
  };

  const handleReplaceExercise = (dayId: string, exerciseId: string) => {
    setExerciseToReplace({ dayId, exerciseId });
    setShowReplaceModal(true);
  };

  const confirmReplaceExercise = (newExercise: Exercise) => {
    if (!exerciseToReplace) return;

    setWeeklyPlan((prev) => {
      if (!prev) return prev;

      const updatedDays = prev.days.map((day) => {
        if (day.id === exerciseToReplace.dayId) {
          const updatedExercises = day.exercises.map((ex) =>
            ex.id === exerciseToReplace.exerciseId ? { ...newExercise, completed: false } : ex
          );
          return { ...day, exercises: updatedExercises };
        }
        return day;
      });

      return { ...prev, days: updatedDays };
    });

    setShowReplaceModal(false);
    setExerciseToReplace(null);
  };

  const handleCantTrain = (dayId: string) => {
    setDayToReconfigure(dayId);
    setShowCantTrainModal(true);
  };

  const confirmMarkMissed = () => {
    if (dayToReconfigure) {
      markDayMissed(dayToReconfigure);
    }
    setShowCantTrainModal(false);
    setDayToReconfigure(null);
  };

  const confirmReconfigure = async (useML: boolean = true) => {
    if (!dayToReconfigure) return;

    if (useML) {
      await reconfigureWithML(dayToReconfigure);
    } else {
      markDayUnavailable(dayToReconfigure);
    }

    setShowCantTrainModal(false);
    setShowReconfigureModal(false);
    setDayToReconfigure(null);
  };

  const reconfigureWithML = async (dayId: string) => {
    if (!weeklyPlan) return;

    setLoading(true);
    try {
      const unavailableDay = weeklyPlan.days.find((d) => d.id === dayId);
      if (!unavailableDay) return;

      const updatedDays = weeklyPlan.days.map((day) => {
        if (day.id === dayId) {
          return { ...day, status: 'unavailable' as const, exercises: [] };
        }
        return day;
      });

      const availableDays = updatedDays.filter(
        (d) => d.status === 'pending' && !d.isRestDay && d.date >= getCurrentDate()
      );

      const exercisesToRedistribute = unavailableDay.exercises;
      for (const exercise of exercisesToRedistribute) {
        if (availableDays.length === 0) break;

        const targetDay = availableDays.shift()!;
        const dayIndex = updatedDays.findIndex((d) => d.id === targetDay.id);

        const rec = await fetchMLRecommendation({
          ...userProfile,
          avg_duration: exercise.duration / 60,
        });

        updatedDays[dayIndex].exercises.push({
          id: `redist-${Date.now()}-${Math.random()}`,
          name: rec.recommended_workout,
          duration: Math.round(rec.duration_hours * 60),
          sets: exercise.sets,
          reps: exercise.reps,
          completed: false,
        });
      }

      setWeeklyPlan({ ...weeklyPlan, days: updatedDays });
    } catch (error) {
      console.error('Reconfiguration failed:', error);
      alert('Failed to reconfigure plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redistributeWorkouts = (plan: WeeklyPlan): WeeklyPlan => {
    const unavailableDays = plan.days.filter((d) => d.status === 'unavailable');
    const availableDays = plan.days.filter(
      (d) => d.status === 'pending' && !d.isRestDay && d.date >= getCurrentDate()
    );

    if (unavailableDays.length === 0 || availableDays.length === 0) {
      return plan;
    }

    const exercisesToRedistribute = unavailableDays.flatMap((d) => d.exercises);

    let exerciseIndex = 0;
    const updatedDays = plan.days.map((day) => {
      if (day.status === 'pending' && !day.isRestDay && exerciseIndex < exercisesToRedistribute.length) {
        return {
          ...day,
          exercises: [...day.exercises, exercisesToRedistribute[exerciseIndex++]],
        };
      }
      return day;
    });

    return { ...plan, days: updatedDays };
  };

  const handleReconfigure = (dayId: string) => {
    setDayToReconfigure(dayId);
    setShowReconfigureModal(true);
  };

  // ==================== RENDER ====================

  if (loading || !weeklyPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Loading your AI-powered plan...' : 'Generating your plan...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DEBUG PANEL */}
        <div className="mb-6 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300">
          <h3 className="font-semibold text-yellow-800 mb-3">🛠️ Debug Panel - Simulate Any Day</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              onClick={() => setOverrideDate('')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Reset to Today
            </button>
          </div>
          <p className="text-xs text-yellow-700 mt-2">
            Current simulated date: {getCurrentDate().toLocaleDateString()}
          </p>
        </div>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your AI-Powered Weekly Fitness Plan</h1>
          <p className="text-xl text-gray-600">Week of {weeklyPlan.weekStart.toLocaleDateString()}</p>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {weeklyPlan.completedWorkouts} / {weeklyPlan.totalPlannedWorkouts} workouts
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(weeklyPlan.completedWorkouts / weeklyPlan.totalPlannedWorkouts) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* WEEKLY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          {weeklyPlan.days.map((day) => (
            <div
              key={day.id}
              className={`bg-white rounded-lg shadow-lg p-4 border-2 transition-all duration-200 cursor-pointer ${
                selectedDay === day.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent hover:shadow-xl'
              }`}
              onClick={() => setSelectedDay(day.id)}
            >
              {/* Day Header */}
              <div className="text-center mb-3">
                <h3 className="font-semibold text-gray-900">{day.day}</h3>
                <p className="text-sm text-gray-500">{day.date.getDate()}</p>
                {isCurrentDay(day.date) && <p className="text-xs text-blue-600 font-semibold mt-1">📍 TODAY</p>}
                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(day.status)}`}>
                  <span className="mr-1">{getStatusIcon(day.status)}</span>
                  {day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">{getDayMessage(day)}</p>
              </div>

              {/* Exercise List */}
              <div className="space-y-2">
                {day.isRestDay ? (
                  <p className="text-center text-gray-500 text-sm py-4">🛌 Rest Day</p>
                ) : day.exercises.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">No exercises</p>
                ) : (
                  day.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`p-2 rounded text-xs ${
                        exercise.completed
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-gray-600">
                        {exercise.duration}min
                        {exercise.sets && exercise.reps && ` • ${exercise.sets}x${exercise.reps}`}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 space-y-2">
                {day.status === 'pending' && !day.isRestDay && isCurrentDay(day.date) && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markDayCompleted(day.id);
                      }}
                      className="w-full bg-green-500 text-white text-xs py-2 rounded hover:bg-green-600 transition-colors font-medium"
                    >
                      ✅ Mark Complete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCantTrain(day.id);
                      }}
                      className="w-full bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 transition-colors font-medium"
                    >
                      ❌ Can't Train
                    </button>
                  </>
                )}

                {day.status === 'missed' && isCurrentDay(day.date) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReconfigure(day.id);
                    }}
                    className="w-full bg-orange-500 text-white text-xs py-2 rounded hover:bg-orange-600 transition-colors font-medium"
                  >
                    🔄 Reconfigure Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SELECTED DAY DETAILS */}
        {selectedDay && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {weeklyPlan.days.find((d) => d.id === selectedDay)?.day} Details
            </h3>

            {(() => {
              const day = weeklyPlan.days.find((d) => d.id === selectedDay);
              if (!day || day.isRestDay) return null;

              return (
                <div className="space-y-4">
                  {day.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <p className="text-sm text-gray-600">
                          {exercise.duration} minutes
                          {exercise.sets && exercise.reps && ` • ${exercise.sets} sets × ${exercise.reps} reps`}
                        </p>
                        {exercise.completed && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                            ✅ Completed
                          </span>
                        )}
                      </div>

                      {!exercise.completed && isCurrentDay(day.date) && (
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => removeExercise(day.id, exercise.id)}
                            className="flex-1 sm:flex-none px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => handleReplaceExercise(day.id, exercise.id)}
                            className="flex-1 sm:flex-none px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Replace
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* CAN'T TRAIN CHOICE MODAL */}
      {showCantTrainModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">❌ Can't Train Today?</h3>
            <p className="text-gray-600 mb-6">How would you like to handle today's workout?</p>

            <div className="space-y-3">
              <button
                onClick={confirmMarkMissed}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded hover:bg-orange-600 transition-colors font-medium"
              >
                Mark as Missed
                <span className="block text-xs opacity-90">Day becomes missed, no changes to plan</span>
              </button>

              <button
                onClick={() => confirmReconfigure(true)}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition-colors font-medium"
              >
                Reconfigure Plan
                <span className="block text-xs opacity-90">
                  Use AI to redistribute workouts and make this a rest day
                </span>
              </button>

              <button
                onClick={() => setShowCantTrainModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECONFIGURE MISSED DAY MODAL */}
      {showReconfigureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Reconfigure Your Plan</h3>
            <p className="text-gray-600 mb-6">
              You missed a workout day. Would you like to automatically redistribute the missed exercises to other
              available days to stay on track?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => confirmReconfigure(true)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors font-medium"
              >
                ✅ Yes, Redistribute
              </button>
              <button
                onClick={() => setShowReconfigureModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors font-medium"
              >
                ❌ No, Keep Rest Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLACE EXERCISE MODAL */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏋️ Select Replacement Exercise</h3>
            <p className="text-sm text-gray-600 mb-4">Choose an exercise to replace the selected one:</p>
            <div className="grid grid-cols-1 gap-3 mb-6 max-h-96 overflow-y-auto">
              {availableExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => confirmReplaceExercise(ex)}
                  className="p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <p className="font-medium text-gray-900">{ex.name}</p>
                  <p className="text-sm text-gray-600">
                    {ex.duration} minutes
                    {ex.sets && ex.reps && ` • ${ex.sets}x${ex.reps}`}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReplaceModal(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicWeeklyPlan;