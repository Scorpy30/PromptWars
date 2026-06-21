/**
 * @file CalculatorTab.tsx
 * @description Usage Matrix input form allowing users to enter their environmental metrics.
 * Renders sliders and number inputs for electricity, gas, gasoline, flights, and diet profile.
 */

'use client';

import React, { useCallback } from 'react';
import { AlertCircle, RefreshCw, Plane } from 'lucide-react';
import { UsageMetrics } from '@/core/engine/carbonEngine';

// ─── Constants ───────────────────────────────────────────────────────────────

/** All valid diet profile keys with their display labels */
export const DIET_OPTIONS: Array<{ value: UsageMetrics['meatConsumptionFactor']; label: string }> = [
  { value: 'high',   label: 'Heavy Meat Consumption (+250 kg/mo baseline)' },
  { value: 'medium', label: 'Balanced Omnivore (+160 kg/mo baseline)' },
  { value: 'low',    label: 'Vegetarian Profile (+90 kg/mo baseline)' },
  { value: 'vegan',  label: 'Strict Plant-Based Profile (+50 kg/mo baseline)' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CalculatorTabProps {
  metrics: UsageMetrics;
  onUpdate: (partial: Partial<UsageMetrics>) => void;
  onReset: () => void;
}

// ─── Sub-component: Labeled Slider Row ───────────────────────────────────────

interface SliderRowProps {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}

function SliderRow({ id, label, unit, value, min, max, onChange }: SliderRowProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
    [onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold">
        <label htmlFor={id} className="text-slate-300">{label}</label>
        <span className="text-slate-450 font-mono">{value} {unit}</span>
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="range"
          min={min}
          max={max}
          tabIndex={-1}
          aria-hidden="true"
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          value={value}
          onChange={handleChange}
        />
        <input
          id={id}
          type="number"
          min={min}
          className="w-20 px-2 py-1 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-right"
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Renders the Usage Matrix Calculator tab with all environmental input controls.
 * @param props - Component props including current metrics, update handler, and reset handler.
 */
export default function CalculatorTab({ metrics, onUpdate, onReset }: CalculatorTabProps) {
  const handleDietChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onUpdate({ meatConsumptionFactor: e.target.value as UsageMetrics['meatConsumptionFactor'] }),
    [onUpdate],
  );

  return (
    <section aria-labelledby="calculator-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
        <div>
          <h2 id="calculator-heading" className="text-xl font-bold text-slate-200">Usage Matrix Parameters</h2>
          <p className="text-xs text-slate-400">Provide environmental values to calculate footprints dynamically</p>
        </div>
        <button
          onClick={onReset}
          aria-label="Reset all metrics to zero"
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Housing Inputs */}
        <div className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60">
          <h3 className="text-xs uppercase font-extrabold text-yellow-500 tracking-wider">Housing Operations</h3>
          <SliderRow
            id="electricity-input"
            label="Electricity Usage (kWh/mo)"
            unit="kWh"
            value={metrics.electricityKwh}
            min={0}
            max={2000}
            onChange={(val) => onUpdate({ electricityKwh: val })}
          />
          <SliderRow
            id="gas-input"
            label="Natural Gas Consumption (Therms/mo)"
            unit="Therms"
            value={metrics.naturalGasTherms}
            min={0}
            max={300}
            onChange={(val) => onUpdate({ naturalGasTherms: val })}
          />
        </div>

        {/* Transport Inputs */}
        <div className="space-y-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60">
          <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-wider">Transport &amp; Commuting</h3>
          <SliderRow
            id="gasoline-input"
            label="Gasoline Consumption (Gallons/mo)"
            unit="Gal"
            value={metrics.gasolineGallons}
            min={0}
            max={200}
            onChange={(val) => onUpdate({ gasolineGallons: val })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="short-flights-input" className="block text-xs font-semibold text-slate-300">
                Short Flights (&lt;3h)
              </label>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  id="short-flights-input"
                  type="number"
                  min={0}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                  value={metrics.flightsShortHaul}
                  onChange={(e) => onUpdate({ flightsShortHaul: Math.max(0, Number(e.target.value)) })}
                  aria-label="Number of short haul flights per month"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="long-flights-input" className="block text-xs font-semibold text-slate-300">
                Long Flights (&gt;3h)
              </label>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  id="long-flights-input"
                  type="number"
                  min={0}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-700 bg-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                  value={metrics.flightsLongHaul}
                  onChange={(e) => onUpdate({ flightsLongHaul: Math.max(0, Number(e.target.value)) })}
                  aria-label="Number of long haul flights per month"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Profile */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 space-y-3">
        <h3 className="text-xs uppercase font-extrabold text-emerald-500 tracking-wider">Lifestyle &amp; Nutrition Strategy</h3>
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
              onChange={handleDietChange}
            >
              {DIET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/20 p-3.5 rounded-xl border border-slate-800/40">
        <AlertCircle className="w-4 h-4 text-emerald-500/80 shrink-0" />
        <span>Values reflect dynamic calculation adjustments immediately visible in the accounting banners above.</span>
      </div>
    </section>
  );
}
