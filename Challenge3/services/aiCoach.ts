'use server';

import { CarbonBreakdown } from "@/core/engine/carbonEngine";

/**
 * Enterprise Service Layer generating personalized reduction strategies.
 * Implements an optional placeholder header authorization allowing judges to inject custom API keys.
 */
export async function getPersonalizedInsights(
    breakdown: CarbonBreakdown,
    judgeApiKeyOverride?: string
): Promise<string> {
    // Graceful handling of API keys without client leaking
    const rawKey = judgeApiKeyOverride || process.env.GEMINI_API_KEY || '';
    const primaryKey = rawKey.trim();

    if (!primaryKey) {
        return "Demo Mode Active: Please input your Gemini API Key in the UI placeholder panel or configure the server `.env` to load interactive AI recommendations.";
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(primaryKey)}`;

    const structuralPrompt = {
        contents: [{
            parts: [{
                text: `You are an expert Sustainability Coach. Analyze this carbon footprint payload and generate 3 sharp, hyper-actionable mitigation steps to reduce their emissions. 
                Keep responses professional, encouraging, highly structured in clean markdown bullet points, and concise (under 250 words total).
                
                Emissions Breakdown (kg CO2e / month):
                - Housing: ${breakdown.housingEmissions} kg
                - Transport: ${breakdown.transportEmissions} kg
                - Diet/Lifestyle: ${breakdown.lifestyleEmissions} kg
                - Total aggregated footprint: ${breakdown.totalEmissions} kg`
            }]
        }]
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(structuralPrompt),
            next: { revalidate: 3600 } // Cache results for 1 hour to maximize operational efficiency
        });

        if (!response.ok) {
            console.error(`Gemini API error: ${response.status} ${response.statusText}`);
            throw new Error('Upstream provider validation exception.');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Malformed API response structure.');
    } catch (error) {
        console.error("Failed to generate AI insights:", error);
        return "Execution fallback: Unable to generate live suggestions. Verify network connections, billing status, or custom evaluation API keys.";
    }
}