/**
 * @file carbonEngine.ts
 * @description Strongly typed Enterprise Math Matrix for accurate, auditable carbon metrics.
 * Baseline conversion figures are sourced from global environmental frameworks (GHG Protocol).
 */

export interface UsageMetrics {
    electricityKwh: number;
    naturalGasTherms: number;
    gasolineGallons: number;
    flightsShortHaul: number; // < 3 hours
    flightsLongHaul: number;  // > 3 hours
    meatConsumptionFactor: 'high' | 'medium' | 'low' | 'vegan';
}

export interface CarbonBreakdown {
    housingEmissions: number;    // kg CO2e / month
    transportEmissions: number;  // kg CO2e / month
    lifestyleEmissions: number;  // kg CO2e / month
    totalEmissions: number;      // kg CO2e / month
}

// Strictly immutable conversion coefficients (kg CO2e per unit)
const EMISSION_FACTORS = {
    electricity: 0.385,     // US Grid Average
    naturalGas: 5.3,        // Per Therm
    gasoline: 8.887,        // Per Gallon
    flightShort: 150,       // Flat per takeoff/landing short range average
    flightLong: 600,        // Long distance cruise allocation
    diet: {
        high: 250,            // Heavy meat consumption monthly baseline
        medium: 160,          // Balanced omnivore
        low: 90,              // Vegetarian
        vegan: 50             // Strict plant-based
    }
} as const;

/**
 * Calculates a comprehensive breakdown of an individual's carbon footprint.
 * Ensures input metrics are safe, positive numbers to prevent invalid calculation state.
 * @param metrics User inputs gathered via tracking interface
 */
export function calculateCarbonFootprint(metrics: UsageMetrics): CarbonBreakdown {
    // Input sanitation & safety defaults
    const electricity = Math.max(0, Number(metrics.electricityKwh) || 0);
    const naturalGas = Math.max(0, Number(metrics.naturalGasTherms) || 0);
    const gasoline = Math.max(0, Number(metrics.gasolineGallons) || 0);
    const flightShort = Math.max(0, Number(metrics.flightsShortHaul) || 0);
    const flightLong = Math.max(0, Number(metrics.flightsLongHaul) || 0);
    
    // Validate dietary strategy factor
    const dietFactor = (metrics.meatConsumptionFactor in EMISSION_FACTORS.diet)
        ? metrics.meatConsumptionFactor 
        : 'medium';

    const housingEmissions =
        (electricity * EMISSION_FACTORS.electricity) +
        (naturalGas * EMISSION_FACTORS.naturalGas);

    const transportEmissions =
        (gasoline * EMISSION_FACTORS.gasoline) +
        (flightShort * EMISSION_FACTORS.flightShort) +
        (flightLong * EMISSION_FACTORS.flightLong);

    const lifestyleEmissions = EMISSION_FACTORS.diet[dietFactor];

    const totalEmissions = housingEmissions + transportEmissions + lifestyleEmissions;

    return {
        housingEmissions: Number(housingEmissions.toFixed(2)),
        transportEmissions: Number(transportEmissions.toFixed(2)),
        lifestyleEmissions: Number(lifestyleEmissions.toFixed(2)),
        totalEmissions: Number(totalEmissions.toFixed(2))
    };
}