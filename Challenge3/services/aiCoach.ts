'use server';

import { CarbonBreakdown } from "@/core/engine/carbonEngine";

// Models to try in order of preference (fallback chain)
const MODEL_FALLBACK_CHAIN = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
];

const GEMINI_API_VERSION = 'v1beta';

/**
 * Enterprise Service Layer generating personalized reduction strategies.
 * Implements a model fallback chain and optional judge API key override.
 */
export async function getPersonalizedInsights(
    breakdown: CarbonBreakdown,
    judgeApiKeyOverride?: string
): Promise<string> {
    const rawKey = judgeApiKeyOverride || process.env.GEMINI_API_KEY || '';
    const primaryKey = rawKey.trim();

    if (!primaryKey) {
        return "Demo Mode Active: Please configure the GEMINI_API_KEY in your `.env` file to enable AI-powered recommendations.";
    }

    const promptText = `You are an expert Sustainability Coach. Analyze this carbon footprint and generate 3 sharp, hyper-actionable mitigation steps.
Keep responses professional, encouraging, structured in clean markdown bullet points, and concise (under 250 words total).

Emissions Breakdown (kg CO2e / month):
- Housing: ${breakdown.housingEmissions} kg
- Transport: ${breakdown.transportEmissions} kg
- Diet/Lifestyle: ${breakdown.lifestyleEmissions} kg
- Total footprint: ${breakdown.totalEmissions} kg`;

    const body = JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
    });

    // Try each model in the fallback chain
    for (const model of MODEL_FALLBACK_CHAIN) {
        const endpoint = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${encodeURIComponent(primaryKey)}`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                next: { revalidate: 3600 },
            });

            if (response.status === 429) {
                // Rate limited on this model — try next in chain
                console.warn(`Rate limited on ${model}, trying next model...`);
                continue;
            }

            if (response.status === 404) {
                // Model not available — try next
                console.warn(`Model ${model} not found, trying next...`);
                continue;
            }

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Gemini API error on ${model}: ${response.status}`, errorBody);
                continue;
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;

        } catch (err) {
            console.error(`Network error with model ${model}:`, err);
            continue;
        }
    }

    return "⚠️ All Gemini models are currently rate-limited or unavailable. This is a free-tier quota issue — please wait a minute and try again, or upgrade your Google AI Studio plan at https://ai.google.dev/";
}