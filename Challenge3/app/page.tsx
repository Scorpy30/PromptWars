'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useCarbonStore } from '@/core/store/useCarbonStore';
import { getPersonalizedInsights } from '@/services/aiCoach';
import { 
  Leaf, 
  Flame, 
  Award, 
  Zap, 
  Car, 
  Utensils, 
  Sparkles, 
  History, 
  CheckCircle, 
  Plus, 
  Plane, 
  Key, 
  Activity, 
  Download, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export default function CarbonPlatform() {
  const { metrics, breakdown, score, streakDays, completedHabits, updateMetrics, completeHabit } = useCarbonStore();
  const [judgeKey, setJudgeKey] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [activeTab, setActiveTab] = useState<'calculator' | 'mitigation' | 'coach' | 'history'>('calculator');
  const [isPending, startTransition] = useTransition();
  const [habitFilter, setHabitFilter] = useState('');
  const [keyInputType, setKeyInputType] = useState<'password' | 'text'>('password');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAiConsultation = () => {
    startTransition(async () => {
      try {
        const response = await getPersonalizedInsights(breakdown, judgeKey);
        setAiResponse(response);
        triggerToast("AI recommendations updated successfully!");
      } catch (error) {
        setAiResponse("An unexpected error occurred while communicating with the AI. Please verify your internet connection.");
      }
    });
  };

  // Safe metrics parsing to prevent divide-by-zero or NaN display issues
  const electricityKwh = metrics.electricityKwh || 0;
  const naturalGasTherms = metrics.naturalGasTherms || 0;
  const gasolineGallons = metrics.gasolineGallons || 0;
  const flightsShortHaul = metrics.flightsShortHaul || 0;
  const flightsLongHaul = metrics.flightsLongHaul || 0;

  // Custom formatted diet names for display
  const dietLabels: Record<string, string> = {
    high: 'Heavy Omnivore (High Impact)',
    medium: 'Balanced Omnivore (Moderate Impact)',
    low: 'Vegetarian (Low Impact)',
    vegan: 'Plant-Based (Minimal Impact)'
  };

  // Filtered habits for history tab
  const filteredHabits = useMemo(() => {
    if (!habitFilter) return completedHabits;
    return completedHabits.filter(h => 
      h.title.toLowerCase().includes(habitFilter.toLowerCase())
    );
  }, [completedHabits, habitFilter]);

  // Export report as JSON file
  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      score,
      streakDays,
      metrics,
      breakdown,
      completedHabits
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotrack-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Data report exported successfully!");
  };

  // Reset metrics to default
  const resetMetrics = () => {
    updateMetrics({
      electricityKwh: 0,
      naturalGasTherms: 0,
      gasolineGallons: 0,
      flightsShortHaul: 0,
      flightsLongHaul: 0,
      meatConsumptionFactor: 'medium'
    });
    triggerToast("Usage matrix cleared.");
  };

  // Predefined high-impact actions for mitigation
  const availableHabits = [
    { title: "Commuted cleanly using zero-emission travel vectors (cycle, walk, EV)", points: 15, category: "transport" },
    { title: "Eliminated animal products over a complete 24-hour cycle", points: 25, category: "diet" },
    { title: "Reduced electricity footprint (switched off standby, optimized heating)", points: 10, category: "housing" },
    { title: "Avoided a short flights distance journey by taking high-speed rail", points: 40, category: "transport" },
    { title: "Composted organic waste materials to reduce methane landfill emissions", points: 15, category: "waste" }
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce transition-all duration-300">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Outer wrapper for layout container */}
      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-8">
        
        {/* Judge Secret Configuration Banner */}
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
              Provide a custom Gemini API Key below to query recommendations directly. If left blank, it falls back to the server environment key.
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
              className="absolute right-3 text-xs text-amber-400 hover:text-amber-300 focus:outline-none"
              onClick={() => setKeyInputType(prev => prev === 'password' ? 'text' : 'password')}
              aria-label={keyInputType === 'password' ? 'Show API Key' : 'Hide API Key'}
            >
              {keyInputType === 'password' ? 'Show' : 'Hide'}
            </button>
          </div>
        </section>

        {/* Global Dashboard Header & Leaderboard */}
        <header className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-slate-800/60 p-6 rounded-3xl border border-slate-700/60 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30">
                <Leaf className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  EcoTrack Pro
                </h1>
                <p className="text-slate-400 text-xs md:text-sm">
                  Personal Carbon Ledger & Interactive AI-Powered Mitigation Strategy
                </p>
              </div>
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

        {/* Global Statistics Cards */}
        <section aria-label="Footprint Accounting Breakdown" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Housing
            </span>
            <p className="text-2xl font-bold text-slate-100 mt-2">{breakdown.housingEmissions} <span className="text-xs text-slate-400">kg CO2e</span></p>
            <p className="text-[10px] text-slate-500 mt-1">Electricity & Natural Gas</p>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" /> Transport
            </span>
            <p className="text-2xl font-bold text-slate-100 mt-2">{breakdown.transportEmissions} <span className="text-xs text-slate-400">kg CO2e</span></p>
            <p className="text-[10px] text-slate-500 mt-1">Gasoline & Long/Short Flights</p>
          </div>
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" /> Diet/Lifestyle
            </span>
            <p className="text-2xl font-bold text-slate-100 mt-2">{breakdown.lifestyleEmissions} <span className="text-xs text-slate-400">kg CO2e</span></p>
            <p className="text-[10px] text-slate-500 mt-1">Meat Consumption Factor</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-5 rounded-2xl border border-emerald-700/40 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-10">
              <Activity className="w-32 h-32 text-white" />
            </div>
            <span className="text-emerald-300 text-xs font-bold uppercase block">
              Aggregated Monthly
            </span>
            <p className="text-3xl font-black text-white mt-2">
              {breakdown.totalEmissions} <span className="text-sm font-normal text-emerald-200">kg</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${breakdown.totalEmissions <= 500 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className="text-[10px] text-emerald-100 font-medium">
                {breakdown.totalEmissions <= 500 ? 'Below Target (Optimal)' : 'Above Target (Reduce)'}
              </span>
            </div>
          </div>
        </section>

        {/* Charts & Visualization Screen */}
        <section aria-label="Visual Analytics" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200">Emissions Allocation Analytics</h3>
              <p className="text-xs text-slate-400">Visual mapping of current usage metrics relative to global average targets (500 kg)</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={exportReport}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto transition-all"
                aria-label="Export carbon ledger report as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Horizontal Stacked Percentage Bar Chart */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                <span>Distribution %</span>
                <span>Total: {breakdown.totalEmissions} kg CO2e</span>
              </div>
              <div className="h-6 w-full rounded-xl bg-slate-700 overflow-hidden flex shadow-inner">
                {breakdown.totalEmissions > 0 ? (
                  <>
                    <div 
                      style={{ width: `${(breakdown.housingEmissions / breakdown.totalEmissions) * 100}%` }}
                      className="bg-yellow-500 h-full transition-all duration-500"
                      title={`Housing: ${breakdown.housingEmissions} kg`}
                    />
                    <div 
                      style={{ width: `${(breakdown.transportEmissions / breakdown.totalEmissions) * 100}%` }}
                      className="bg-blue-500 h-full transition-all duration-500"
                      title={`Transport: ${breakdown.transportEmissions} kg`}
                    />
                    <div 
                      style={{ width: `${(breakdown.lifestyleEmissions / breakdown.totalEmissions) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title={`Diet/Lifestyle: ${breakdown.lifestyleEmissions} kg`}
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                    No logged carbon records. Input usage details below.
                  </div>
                )}
              </div>
              
              {/* Chart Legend */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 mt-2 px-1">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-yellow-500"></span> Housing ({breakdown.totalEmissions > 0 ? Math.round((breakdown.housingEmissions / breakdown.totalEmissions) * 100) : 0}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-500"></span> Transport ({breakdown.totalEmissions > 0 ? Math.round((breakdown.transportEmissions / breakdown.totalEmissions) * 100) : 0}%)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500"></span> Diet/Lifestyle ({breakdown.totalEmissions > 0 ? Math.round((breakdown.lifestyleEmissions / breakdown.totalEmissions) * 100) : 0}%)</span>
              </div>
            </div>

            {/* Target comparison meter */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Mitigation Progress against Target (500 kg/mo limit)</span>
                <span className="font-bold text-slate-200">
                  {breakdown.totalEmissions <= 500 
                    ? `Safe (${500 - breakdown.totalEmissions} kg buffer)` 
                    : `Exceeded by ${(breakdown.totalEmissions - 500).toFixed(2)} kg`
                  }
                </span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-700">
                  <div 
                    style={{ width: `${Math.min((breakdown.totalEmissions / 1000) * 100, 100)}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                      breakdown.totalEmissions <= 500 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                    }`}
                  />
                </div>
                {/* Visual target threshold pointer */}
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-amber-400/80 -translate-y-1" title="Target threshold (500kg)">
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-950 text-amber-300 border border-amber-800 text-[8px] font-extrabold px-1 rounded whitespace-nowrap">
                    500 kg limit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Dashboard Working Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Navigation Links/Tabs (Tabbed UI for cleanliness & easy-to-understand layouts) */}
          <nav aria-label="Dashboard views" className="lg:col-span-3 flex flex-row lg:flex-col gap-2 bg-slate-800/30 p-3 rounded-2xl border border-slate-800/80 overflow-x-auto lg:overflow-x-visible">
            <button 
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold rounded-xl w-full text-left whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              1. Usage Matrix Calculator
            </button>
            <button 
              onClick={() => setActiveTab('mitigation')}
              className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold rounded-xl w-full text-left whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                activeTab === 'mitigation' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              2. Gamified Challenges
            </button>
            <button 
              onClick={() => setActiveTab('coach')}
              className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold rounded-xl w-full text-left whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                activeTab === 'coach' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              3. AI Coaching Insights
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-semibold rounded-xl w-full text-left whitespace-nowrap outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                activeTab === 'history' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              4. Gamification Log
            </button>
          </nav>

          {/* Right panel: Active Viewport Content */}
          <div className="lg:col-span-9">
            
            {/* Viewport 1: Usage Matrix Form */}
            {activeTab === 'calculator' && (
              <section aria-labelledby="calculator-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
                  <div>
                    <h2 id="calculator-heading" className="text-xl font-bold text-slate-200">Usage Matrix Parameters</h2>
                    <p className="text-xs text-slate-400">Provide environmental values to calculate footprints dynamically</p>
                  </div>
                  <button 
                    onClick={resetMetrics}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Form
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Housing inputs */}
                  <div className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60">
                    <h3 className="text-xs uppercase font-extrabold text-yellow-500 tracking-wider">Housing Operations</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <label htmlFor="electricity-input" className="text-slate-300">Electricity Usage (kWh/mo)</label>
                        <span className="text-slate-400 font-mono">{electricityKwh} kWh</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <input 
                          type="range"
                          min="0"
                          max="2000"
                          aria-label="Electricity usage slider"
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          value={electricityKwh}
                          onChange={(e) => updateMetrics({ electricityKwh: Number(e.target.value) })}
                        />
                        <input 
                          id="electricity-input"
                          type="number" 
                          min="0"
                          className="w-20 px-2 py-1 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-right"
                          value={electricityKwh}
                          onChange={(e) => updateMetrics({ electricityKwh: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <label htmlFor="gas-input" className="text-slate-300">Natural Gas Consumption (Therms/mo)</label>
                        <span className="text-slate-400 font-mono">{naturalGasTherms} Therms</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <input 
                          type="range"
                          min="0"
                          max="300"
                          aria-label="Natural Gas usage slider"
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          value={naturalGasTherms}
                          onChange={(e) => updateMetrics({ naturalGasTherms: Number(e.target.value) })}
                        />
                        <input 
                          id="gas-input"
                          type="number" 
                          min="0"
                          className="w-20 px-2 py-1 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-right"
                          value={naturalGasTherms}
                          onChange={(e) => updateMetrics({ naturalGasTherms: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transport inputs */}
                  <div className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60">
                    <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider">Transport & Commuting</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <label htmlFor="gasoline-input" className="text-slate-300">Gasoline Consumption (Gallons/mo)</label>
                        <span className="text-slate-400 font-mono">{gasolineGallons} Gal</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <input 
                          type="range"
                          min="0"
                          max="200"
                          aria-label="Gasoline volume slider"
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          value={gasolineGallons}
                          onChange={(e) => updateMetrics({ gasolineGallons: Number(e.target.value) })}
                        />
                        <input 
                          id="gasoline-input"
                          type="number" 
                          min="0"
                          className="w-20 px-2 py-1 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-right"
                          value={gasolineGallons}
                          onChange={(e) => updateMetrics({ gasolineGallons: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="short-flights-input" className="block text-xs font-semibold text-slate-300">Short Flights (&lt;3h)</label>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-slate-500 shrink-0" />
                          <input 
                            id="short-flights-input"
                            type="number" 
                            min="0"
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                            value={flightsShortHaul}
                            onChange={(e) => updateMetrics({ flightsShortHaul: Math.max(0, Number(e.target.value)) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="long-flights-input" className="block text-xs font-semibold text-slate-300">Long Flights (&gt;3h)</label>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-slate-400 shrink-0" />
                          <input 
                            id="long-flights-input"
                            type="number" 
                            min="0"
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                            value={flightsLongHaul}
                            onChange={(e) => updateMetrics({ flightsLongHaul: Math.max(0, Number(e.target.value)) })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dietary Profile */}
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 space-y-3">
                  <h3 className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">Lifestyle & Nutrition Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1">
                      <label htmlFor="diet-profile" className="text-xs font-semibold text-slate-300">Dietary Baseline Profile</label>
                      <p className="text-[10px] text-slate-500 mt-1">Sourced from global agricultural carbon research parameters.</p>
                    </div>
                    <div className="md:col-span-2">
                      <select 
                        id="diet-profile"
                        className="w-full px-3 py-2 text-sm border border-slate-700 rounded-xl bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-200"
                        value={metrics.meatConsumptionFactor}
                        onChange={(e) => updateMetrics({ meatConsumptionFactor: e.target.value as any })}
                      >
                        <option value="high">Heavy Meat Consumption (+250 kg/mo baseline)</option>
                        <option value="medium">Balanced Omnivore (+160 kg/mo baseline)</option>
                        <option value="low">Vegetarian Profile (+90 kg/mo baseline)</option>
                        <option value="vegan">Strict Plant-Based Profile (+50 kg/mo baseline)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/20 p-3.5 rounded-xl border border-slate-800/40">
                  <AlertCircle className="w-4 h-4 text-emerald-500/80 shrink-0" />
                  <span>Values reflect dynamic calculation adjustments immediately visible in the accounting banners above.</span>
                </div>
              </section>
            )}

            {/* Viewport 2: Gamified Goals and Checklist */}
            {activeTab === 'mitigation' && (
              <section aria-labelledby="mitigation-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
                <div>
                  <h2 id="mitigation-heading" className="text-xl font-bold text-slate-200">Eco-Mitigation Challenges</h2>
                  <p className="text-xs text-slate-400">Complete standard action items in your daily lifestyle to earn XP points and extend your conservation streaks</p>
                </div>

                <div className="space-y-3.5">
                  {availableHabits.map((habit, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-700/60 bg-slate-850 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60 uppercase">
                            {habit.category}
                          </span>
                          <span className="text-xs font-bold text-yellow-400">+{habit.points} XP</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200 mt-1">{habit.title}</p>
                      </div>
                      <button 
                        onClick={() => {
                          completeHabit(habit.title, habit.points);
                          triggerToast(`Habit logged! Earned +${habit.points} XP.`);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 outline-none focus:ring-2 focus:ring-emerald-400"
                        aria-label={`Log habit: ${habit.title} and earn ${habit.points} XP`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Log Habit
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Viewport 3: AI Recommendations */}
            {activeTab === 'coach' && (
              <section aria-labelledby="coach-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 id="coach-heading" className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      Sustainability Coach Insights
                    </h2>
                    <p className="text-xs text-slate-400">Receive hyper-actionable, customized mitigation advice from our serverless AI model</p>
                  </div>
                  <button 
                    onClick={handleAiConsultation}
                    disabled={isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    aria-label="Invoke AI sustainability consultant analysis"
                  >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isPending ? 'Analyzing Metrics...' : 'Generate AI Advice'}
                  </button>
                </div>

                <div className="bg-slate-900/65 rounded-2xl border border-slate-700/60 min-h-[180px] p-6 flex flex-col justify-center relative overflow-hidden">
                  {isPending ? (
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin"></div>
                        <Sparkles className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-300">Consulting AI Model Matrix...</p>
                        <p className="text-xs text-slate-500 mt-1">Analyzing housing, transportation, and nutrition factors</p>
                      </div>
                    </div>
                  ) : aiResponse ? (
                    <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans prose prose-invert max-w-none">
                      {/* Simple custom markdown style block */}
                      <div className="space-y-2">
                        {aiResponse}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-400">No suggestions loaded yet</p>
                      <p className="text-xs text-slate-500 mt-1">Click the button above to invoke the Sustainability Coach AI analysis.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Viewport 4: Logged Habits Audit Trail */}
            {activeTab === 'history' && (
              <section aria-labelledby="history-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 id="history-heading" className="text-xl font-bold text-slate-200 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-400" />
                      Action Logs Audit Trail
                    </h2>
                    <p className="text-xs text-slate-400">Verification log of your environmental actions</p>
                  </div>
                  <div className="w-full sm:w-60">
                    <input 
                      type="text"
                      placeholder="Search logged habits..."
                      aria-label="Search habit log history"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={habitFilter}
                      onChange={(e) => setHabitFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-700/60 rounded-2xl bg-slate-900/30">
                  {filteredHabits.length > 0 ? (
                    <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                      <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th scope="col" className="px-4 py-3">Logged Habit Description</th>
                          <th scope="col" className="px-4 py-3">Timestamp</th>
                          <th scope="col" className="px-4 py-3 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {filteredHabits.map((habit) => (
                          <tr key={habit.id} className="hover:bg-slate-800/35 transition-colors">
                            <td className="px-4 py-3.5 font-medium">{habit.title}</td>
                            <td className="px-4 py-3.5 text-slate-500">
                              {new Date(habit.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-emerald-400">+{habit.pointsEarned} XP</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      {completedHabits.length === 0 
                        ? 'No habits logged yet. Visit the Challenges tab to complete mitigation tasks.' 
                        : 'No records match search parameters.'
                      }
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}