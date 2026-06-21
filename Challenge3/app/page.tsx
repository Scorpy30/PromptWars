'use client';

/**
 * @file page.tsx
 * @description EcoTrack Pro — Root application page. Acts as the orchestration shell,
 * composing tab components, managing shared UI state, and connecting the Zustand store
 * to the serverless AI coach service.
 */

import React, { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import { useCarbonStore } from '@/core/store/useCarbonStore';
import { getPersonalizedInsights } from '@/services/aiCoach';
import { CarbonBreakdown } from '@/core/engine/carbonEngine';
import {
  Leaf, Flame, Award, Zap, Car, Utensils,
  Sparkles, History, CheckCircle, Key,
  Activity, Download,
} from 'lucide-react';

import CalculatorTab from '@/components/CalculatorTab';
import MitigationTab from '@/components/MitigationTab';
import CoachTab from '@/components/CoachTab';
import HistoryTab from '@/components/HistoryTab';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'calculator' | 'mitigation' | 'coach' | 'history';

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType; step: string }> = [
  { id: 'calculator', label: 'Usage Matrix Calculator', icon: Activity,     step: '1.' },
  { id: 'mitigation', label: 'Gamified Challenges',     icon: CheckCircle,  step: '2.' },
  { id: 'coach',      label: 'AI Coaching Insights',    icon: Sparkles,     step: '3.' },
  { id: 'history',    label: 'Gamification Log',        icon: History,      step: '4.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calculates percentage of total with divide-by-zero protection */
function safePercent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** Generates a downloadable JSON report of the user's carbon data */
function buildReportBlob(
  score: number,
  streakDays: number,
  metrics: ReturnType<typeof useCarbonStore.getState>['metrics'],
  breakdown: CarbonBreakdown,
  completedHabits: ReturnType<typeof useCarbonStore.getState>['completedHabits'],
): Blob {
  const reportData = { timestamp: new Date().toISOString(), score, streakDays, metrics, breakdown, completedHabits };
  return new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CarbonPlatform() {
  const { metrics, breakdown, score, streakDays, completedHabits, updateMetrics, completeHabit, recalculateStreak } = useCarbonStore();

  const [mounted,     setMounted]     = useState(false);
  const [judgeKey,    setJudgeKey]    = useState('');
  const [aiResponse,  setAiResponse]  = useState('');
  const [activeTab,   setActiveTab]   = useState<TabId>('calculator');
  const [isPending,   startTransition] = useTransition();
  const [habitFilter, setHabitFilter] = useState('');
  const [keyInputType, setKeyInputType] = useState<'password' | 'text'>('password');
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mounted status and run dynamic streak calculation on client load
  useEffect(() => {
    setMounted(true);
    recalculateStreak();
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [recalculateStreak]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const triggerToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const handleAiConsultation = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await getPersonalizedInsights(breakdown, judgeKey || undefined);
        setAiResponse(response);
        triggerToast('AI recommendations updated successfully!');
      } catch (error) {
        console.error('AI consultation error:', error);
        setAiResponse('An unexpected error occurred. Please verify your internet connection.');
      }
    });
  }, [breakdown, judgeKey, triggerToast]);

  const handleExportReport = useCallback(() => {
    const blob = buildReportBlob(score, streakDays, metrics, breakdown, completedHabits);
    const url  = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href     = url;
    anchor.download = `ecotrack-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    triggerToast('Data report exported successfully!');
  }, [score, streakDays, metrics, breakdown, completedHabits, triggerToast]);

  const handleReset = useCallback(() => {
    updateMetrics({ electricityKwh: 0, naturalGasTherms: 0, gasolineGallons: 0, flightsShortHaul: 0, flightsLongHaul: 0, meatConsumptionFactor: 'medium' });
    triggerToast('Usage matrix cleared.');
  }, [updateMetrics, triggerToast]);

  const toggleKeyVisibility = useCallback(
    () => setKeyInputType((prev) => (prev === 'password' ? 'text' : 'password')),
    [],
  );

  // ── Derived values ────────────────────────────────────────────────────────

  const total        = breakdown.totalEmissions;
  const housingPct   = safePercent(breakdown.housingEmissions,   total);
  const transportPct = safePercent(breakdown.transportEmissions,  total);
  const lifestylePct = safePercent(breakdown.lifestyleEmissions,  total);

  const housingFloat = total > 0 ? (breakdown.housingEmissions / total) * 100 : 0;
  const transportFloat = total > 0 ? (breakdown.transportEmissions / total) * 100 : 0;
  const lifestyleFloat = total > 0 ? (breakdown.lifestyleEmissions / total) * 100 : 0;

  const targetBarPct = Math.min((total / 1000) * 100, 100);
  const isOnTarget   = total <= 500;

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading EcoTrack Pro...</p>
        </div>
      </main>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-12">
      {/* Toast Announcements */}
      <div aria-live="polite" aria-atomic="true" className="fixed top-4 right-4 z-50">
        {toastMessage && (
          <div
            role="status"
            className="bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-8">

        {/* Evaluation Auth Panel */}
        <section
          aria-labelledby="evaluation-panel-title"
          className="bg-amber-950/60 border border-amber-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm"
        >
          <div className="space-y-1 text-center md:text-left">
            <h4 id="evaluation-panel-title" className="text-sm font-semibold text-amber-300 flex items-center justify-center md:justify-start gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Evaluation Authorization Panel
            </h4>
            <p className="text-xs text-amber-200/80 max-w-xl">
              Provide a custom Gemini API Key below to query recommendations directly. Falls back to server environment key if left blank.
            </p>
          </div>
          <div className="relative w-full md:w-80 flex items-center">
            <input
              id="judge-key"
              type={keyInputType}
              placeholder="Gemini API Key (Optional)"
              aria-label="Gemini API Key Input for judges"
              className="w-full pl-3 pr-10 py-2 text-sm rounded-xl border border-amber-800/60 bg-amber-950/90 text-amber-100 placeholder-amber-500/70 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              value={judgeKey}
              onChange={(e) => setJudgeKey(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleKeyVisibility}
              aria-label={keyInputType === 'password' ? 'Show API Key' : 'Hide API Key'}
              className="absolute right-3 text-xs text-amber-400 hover:text-amber-300 focus:outline-none"
            >
              {keyInputType === 'password' ? 'Show' : 'Hide'}
            </button>
          </div>
        </section>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30">
              <Leaf className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                EcoTrack Pro
              </h1>
              <p className="text-slate-400 text-xs md:text-sm">
                Personal Carbon Ledger &amp; Interactive AI-Powered Mitigation Strategy
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-between sm:justify-start">
            <div className="bg-slate-800 px-4 py-3 rounded-2xl text-center border border-slate-700/80 shadow-md min-w-[100px] flex-1 sm:flex-initial">
              <span className="block text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Eco Score</span>
              <span className="text-lg md:text-xl font-black text-slate-100 flex items-center justify-center gap-1">
                <Award className="w-5 h-5 text-yellow-400" />
                {score} XP
              </span>
            </div>
            <div className="bg-slate-800 px-4 py-3 rounded-2xl text-center border border-slate-700/80 shadow-md min-w-[100px] flex-1 sm:flex-initial">
              <span className="block text-[10px] uppercase tracking-wider text-blue-400 font-bold">Streak</span>
              <span className="text-lg md:text-xl font-black text-slate-100 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                {streakDays} Days
              </span>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section aria-label="Footprint Accounting Breakdown" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Housing',       value: breakdown.housingEmissions,   icon: Zap,      color: 'text-yellow-500', sub: 'Electricity & Natural Gas' },
            { label: 'Transport',     value: breakdown.transportEmissions,  icon: Car,      color: 'text-blue-500',   sub: 'Gasoline & Long/Short Flights' },
            { label: 'Diet/Lifestyle', value: breakdown.lifestyleEmissions, icon: Utensils, color: 'text-emerald-500', sub: 'Meat Consumption Factor' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800/80">
              <span className={`text-slate-400 text-xs font-semibold uppercase flex items-center gap-2`}>
                <Icon className={`w-4 h-4 ${color}`} /> {label}
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-2">
                {value} <span className="text-xs text-slate-400">kg CO2e</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-5 rounded-2xl border border-emerald-700/40 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-10">
              <Activity className="w-32 h-32 text-white" />
            </div>
            <span className="text-emerald-300 text-xs font-bold uppercase block">Aggregated Monthly</span>
            <p className="text-3xl font-black text-white mt-2">
              {breakdown.totalEmissions} <span className="text-sm font-normal text-emerald-200">kg</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOnTarget ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className="text-[10px] text-emerald-100 font-medium">
                {isOnTarget ? 'Below Target (Optimal)' : 'Above Target (Reduce)'}
              </span>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section aria-label="Visual Analytics" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Emissions Allocation Analytics</h3>
              <p className="text-xs text-slate-400">Visual mapping of usage metrics relative to global target (500 kg)</p>
            </div>
            <button
              onClick={handleExportReport}
              aria-label="Export carbon ledger report as JSON"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>

          <div className="space-y-6">
            {/* Stacked Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                <span>Distribution %</span>
                <span>Total: {total} kg CO2e</span>
              </div>
              <svg className="h-6 w-full rounded-xl bg-slate-750 shadow-inner overflow-hidden" role="img" aria-label="Emissions distribution bar chart">
                {total > 0 ? (
                  <>
                    {housingFloat > 0 && (
                      <rect
                        x="0%"
                        y="0"
                        width={`${housingFloat}%`}
                        height="100%"
                        fill="#eab308"
                        className="transition-all duration-500"
                      >
                        <title>Housing: {breakdown.housingEmissions} kg</title>
                      </rect>
                    )}
                    {transportFloat > 0 && (
                      <rect
                        x={`${housingFloat}%`}
                        y="0"
                        width={`${transportFloat}%`}
                        height="100%"
                        fill="#3b82f6"
                        className="transition-all duration-500"
                      >
                        <title>Transport: {breakdown.transportEmissions} kg</title>
                      </rect>
                    )}
                    {lifestyleFloat > 0 && (
                      <rect
                        x={`${housingFloat + transportFloat}%`}
                        y="0"
                        width={`${lifestyleFloat}%`}
                        height="100%"
                        fill="#10b981"
                        className="transition-all duration-500"
                      >
                        <title>Diet: {breakdown.lifestyleEmissions} kg</title>
                      </rect>
                    )}
                  </>
                ) : (
                  <text x="50%" y="60%" textAnchor="middle" className="fill-slate-450 text-[11px] font-semibold">
                    No logged carbon records. Input usage details below.
                  </text>
                )}
              </svg>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 mt-2 px-1">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-yellow-500" /> Housing ({housingPct}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-500" /> Transport ({transportPct}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500" /> Diet/Lifestyle ({lifestylePct}%)</span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Mitigation Progress against Target (500 kg/mo limit)</span>
                <span className="font-bold text-slate-200">
                  {isOnTarget
                    ? `Safe (${500 - breakdown.totalEmissions} kg buffer)`
                    : `Exceeded by ${(breakdown.totalEmissions - 500).toFixed(2)} kg`
                  }
                </span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2.5 flex rounded-full bg-slate-700">
                  <div
                    style={{ width: `${targetBarPct}%` }}
                    className={`transition-all duration-500 ${isOnTarget ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                  />
                </div>
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-amber-400/80 -translate-y-1" title="Target threshold (500kg)">
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-950 text-amber-300 border border-amber-800 text-[8px] font-extrabold px-1 rounded whitespace-nowrap">
                    500 kg limit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div
            role="tablist"
            aria-label="Dashboard views"
            className="lg:col-span-3 flex flex-row lg:flex-col gap-2 bg-slate-800/30 p-3 rounded-2xl border border-slate-800/80 overflow-x-auto lg:overflow-x-visible"
          >
            {TABS.map(({ id, label, icon: Icon, step }) => (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold rounded-xl w-full text-left whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  activeTab === id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {step} {label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-9">
            {activeTab === 'calculator' && (
              <div id="panel-calculator" role="tabpanel" aria-labelledby="tab-calculator" className="outline-none">
                <CalculatorTab metrics={metrics} onUpdate={updateMetrics} onReset={handleReset} />
              </div>
            )}
            {activeTab === 'mitigation' && (
              <div id="panel-mitigation" role="tabpanel" aria-labelledby="tab-mitigation" className="outline-none">
                <MitigationTab onCompleteHabit={completeHabit} onToast={triggerToast} />
              </div>
            )}
            {activeTab === 'coach' && (
              <div id="panel-coach" role="tabpanel" aria-labelledby="tab-coach" className="outline-none">
                <CoachTab breakdown={breakdown} aiResponse={aiResponse} isPending={isPending} onGenerate={handleAiConsultation} />
              </div>
            )}
            {activeTab === 'history' && (
              <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="outline-none">
                <HistoryTab completedHabits={completedHabits} habitFilter={habitFilter} onFilterChange={setHabitFilter} />
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}