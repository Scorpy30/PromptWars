import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UsageMetrics, CarbonBreakdown, calculateCarbonFootprint } from '../engine/carbonEngine';

interface LoggedHabit {
    id: string;
    timestamp: string;
    title: string;
    pointsEarned: number;
}

interface CarbonState {
    metrics: UsageMetrics;
    breakdown: CarbonBreakdown;
    score: number;
    streakDays: number;
    completedHabits: LoggedHabit[];
    updateMetrics: (newMetrics: Partial<UsageMetrics>) => void;
    completeHabit: (habitTitle: string, points: number) => void;
}

const DEFAULT_METRICS: UsageMetrics = {
    electricityKwh: 0,
    naturalGasTherms: 0,
    gasolineGallons: 0,
    flightsShortHaul: 0,
    flightsLongHaul: 0,
    meatConsumptionFactor: 'medium'
};

function calculateStreak(habits: LoggedHabit[]): number {
    if (habits.length === 0) return 0;

    // Normalize dates to YYYY-MM-DD local format to avoid timezone discrepancies
    const uniqueDateStrings = Array.from(new Set(
        habits.map(h => {
            const d = new Date(h.timestamp);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
    ));

    // Sort in descending order (most recent first)
    uniqueDateStrings.sort((a, b) => b.localeCompare(a));

    const todayStr = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const yesterdayStr = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const mostRecentStr = uniqueDateStrings[0];

    // If the most recent logged habit is older than yesterday, the streak is broken
    if (mostRecentStr !== todayStr && mostRecentStr !== yesterdayStr) {
        return 0;
    }

    // Traverse the dates to find the length of the consecutive streak
    let streak = 1;
    for (let i = 0; i < uniqueDateStrings.length - 1; i++) {
        const curr = new Date(uniqueDateStrings[i]);
        const prev = new Date(uniqueDateStrings[i + 1]);
        
        const diffTime = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else if (diffDays > 1) {
            break; // Gap detected, streak ends here
        }
    }

    return streak;
}

export const useCarbonStore = create<CarbonState>()(
    persist(
        (set) => ({
            metrics: DEFAULT_METRICS,
            breakdown: calculateCarbonFootprint(DEFAULT_METRICS),
            score: 0,
            streakDays: 0,
            completedHabits: [],

            updateMetrics: (newMetrics) => set((state) => {
                const mergedMetrics = { ...state.metrics, ...newMetrics };
                return {
                    metrics: mergedMetrics,
                    breakdown: calculateCarbonFootprint(mergedMetrics)
                };
            }),

            completeHabit: (title, points) => set((state) => {
                const newHabit: LoggedHabit = {
                    id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
                    timestamp: new Date().toISOString(),
                    title,
                    pointsEarned: points
                };
                const updatedHabits = [newHabit, ...state.completedHabits];
                const newStreak = calculateStreak(updatedHabits);
                
                return {
                    completedHabits: updatedHabits,
                    score: state.score + points,
                    streakDays: newStreak
                };
            })
        }),
        {
            name: 'ecotrack-enterprise-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
);