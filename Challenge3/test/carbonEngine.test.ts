import { describe, test, expect } from 'vitest';
import { calculateCarbonFootprint, UsageMetrics } from '../core/engine/carbonEngine';

describe('Carbon Accounting Mathematical Validity Testing Matrix', () => {
    test('Should handle zero-value metrics correctly without runtime exceptions', () => {
        const zeroMetrics: UsageMetrics = {
            electricityKwh: 0,
            naturalGasTherms: 0,
            gasolineGallons: 0,
            flightsShortHaul: 0,
            flightsLongHaul: 0,
            meatConsumptionFactor: 'vegan'
        };

        const outcome = calculateCarbonFootprint(zeroMetrics);
        expect(outcome.totalEmissions).toBe(50.00); // Only lifestyle diet footprint remains
        expect(outcome.housingEmissions).toBe(0);
        expect(outcome.transportEmissions).toBe(0);
    });

    test('Should precisely calculate a mixed profile metric payload', () => {
        const standardMetrics: UsageMetrics = {
            electricityKwh: 100,         // 100 * 0.385 = 38.5
            naturalGasTherms: 10,       // 10 * 5.3 = 53
            gasolineGallons: 20,        // 20 * 8.887 = 177.74
            flightsShortHaul: 1,        // 1 * 150 = 150
            flightsLongHaul: 0,
            meatConsumptionFactor: 'high' // 250
        };

        const outcome = calculateCarbonFootprint(standardMetrics);

        expect(outcome.housingEmissions).toBe(91.5);
        expect(outcome.transportEmissions).toBe(327.74);
        expect(outcome.lifestyleEmissions).toBe(250);
        expect(outcome.totalEmissions).toBe(669.24);
    });
});