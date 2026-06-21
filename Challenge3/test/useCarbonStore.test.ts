import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCarbonStore } from '../core/store/useCarbonStore';

describe('Carbon Platform Zustand Store Integration tests', () => {
    beforeEach(() => {
        // Reset the store state before each test
        useCarbonStore.setState({
            metrics: {
                electricityKwh: 0,
                naturalGasTherms: 0,
                gasolineGallons: 0,
                flightsShortHaul: 0,
                flightsLongHaul: 0,
                meatConsumptionFactor: 'medium'
            },
            breakdown: {
                housingEmissions: 90, // Baseline for diet medium is 160, wait, DEFAULT_METRICS: 160 lifestyle + 0 others = 160 total
                transportEmissions: 0,
                lifestyleEmissions: 160,
                totalEmissions: 160
            },
            score: 0,
            streakDays: 0,
            completedHabits: []
        });
    });

    test('should initialize with default states correctly', () => {
        const state = useCarbonStore.getState();
        expect(state.score).toBe(0);
        expect(state.streakDays).toBe(0);
        expect(state.completedHabits).toHaveLength(0);
    });

    test('should update metrics and recalculate carbon footprint breakdown dynamically', () => {
        useCarbonStore.getState().updateMetrics({
            electricityKwh: 200, // 200 * 0.385 = 77
            naturalGasTherms: 20 // 20 * 5.3 = 106
        });

        const state = useCarbonStore.getState();
        expect(state.metrics.electricityKwh).toBe(200);
        expect(state.metrics.naturalGasTherms).toBe(20);
        expect(state.breakdown.housingEmissions).toBe(183); // 77 + 106
    });

    test('should add completed habits and increment eco points score', () => {
        useCarbonStore.getState().completeHabit('Recycled plastic and waste products', 10);
        
        const state = useCarbonStore.getState();
        expect(state.score).toBe(10);
        expect(state.completedHabits).toHaveLength(1);
        expect(state.completedHabits[0].title).toBe('Recycled plastic and waste products');
        expect(state.completedHabits[0].pointsEarned).toBe(10);
    });

    test('should calculate streaks accurately for consecutive day logs', () => {
        // Mock system time to control timestamps
        vi.useFakeTimers();
        
        // Log habit today (e.g. Day 1)
        const dateToday = new Date('2026-06-21T12:00:00Z');
        vi.setSystemTime(dateToday);
        useCarbonStore.getState().completeHabit('Habit 1', 10);
        
        expect(useCarbonStore.getState().streakDays).toBe(1);

        // Log habit next day (e.g. Day 2)
        const dateTomorrow = new Date('2026-06-22T12:00:00Z');
        vi.setSystemTime(dateTomorrow);
        useCarbonStore.getState().completeHabit('Habit 2', 15);

        expect(useCarbonStore.getState().streakDays).toBe(2);

        // Log habit on day 4 (gap of 2 days, should reset streak to 1)
        const dateThreeDaysLater = new Date('2026-06-25T12:00:00Z');
        vi.setSystemTime(dateThreeDaysLater);
        useCarbonStore.getState().completeHabit('Habit 3', 20);

        expect(useCarbonStore.getState().streakDays).toBe(1);

        vi.useRealTimers();
    });
});
