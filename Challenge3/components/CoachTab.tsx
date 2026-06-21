/**
 * @file CoachTab.tsx
 * @description AI Sustainability Coach panel. Invokes the Gemini-powered serverless AI
 * to generate personalized carbon reduction strategies based on the user's current breakdown.
 */

'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { CarbonBreakdown } from '@/core/engine/carbonEngine';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CoachTabProps {
  breakdown: CarbonBreakdown;
  aiResponse: string;
  isPending: boolean;
  onGenerate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Displays the AI coaching interface with a generate button and streamed response panel.
 * @param props - Carbon breakdown data, AI response state, loading state, and trigger callback.
 */
export default function CoachTab({ aiResponse, isPending, onGenerate }: CoachTabProps) {
  return (
    <section aria-labelledby="coach-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 id="coach-heading" className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Sustainability Coach Insights
          </h2>
          <p className="text-xs text-slate-400">
            Receive hyper-actionable, customized mitigation advice from our serverless AI model
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={isPending}
          aria-label="Invoke AI sustainability consultant analysis"
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none shrink-0"
        >
          {isPending
            ? <RefreshCw className="w-4 h-4 animate-spin" />
            : <Sparkles className="w-4 h-4" />
          }
          {isPending ? 'Analyzing Metrics...' : 'Generate AI Advice'}
        </button>
      </div>

      <div className="bg-slate-900/65 rounded-2xl border border-slate-700/60 min-h-[180px] p-6 flex flex-col justify-center relative overflow-hidden">
        {isPending ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
              <Sparkles className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">Consulting AI Model Matrix...</p>
              <p className="text-xs text-slate-500 mt-1">Analyzing housing, transportation, and nutrition factors</p>
            </div>
          </div>
        ) : aiResponse ? (
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans prose prose-invert max-w-none">
            {aiResponse}
          </div>
        ) : (
          <div className="text-center py-6">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No suggestions loaded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click the button above to invoke the Sustainability Coach AI analysis.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
