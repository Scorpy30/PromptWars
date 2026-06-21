/**
 * @file MitigationTab.tsx
 * @description Gamified eco-challenge panel where users log completed sustainability habits to earn XP.
 * Each habit is categorized, scored, and persisted to the store's audit trail.
 */

'use client';

import React from 'react';
import { Plus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A predefined eco-mitigation action that users can log */
export interface HabitDefinition {
  readonly title: string;
  readonly points: number;
  readonly category: 'transport' | 'diet' | 'housing' | 'waste';
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** High-impact daily habits sourced from global sustainability research */
export const AVAILABLE_HABITS: readonly HabitDefinition[] = [
  { title: 'Commuted cleanly using zero-emission travel vectors (cycle, walk, EV)', points: 15, category: 'transport' },
  { title: 'Eliminated animal products over a complete 24-hour cycle',             points: 25, category: 'diet'      },
  { title: 'Reduced electricity footprint (switched off standby, optimized heating)', points: 10, category: 'housing' },
  { title: 'Avoided a short-haul flight by taking high-speed rail instead',        points: 40, category: 'transport' },
  { title: 'Composted organic waste materials to reduce methane landfill emissions', points: 15, category: 'waste'   },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface MitigationTabProps {
  onCompleteHabit: (title: string, points: number) => void;
  onToast: (message: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the Gamified Challenges tab with all available habits.
 * @param props - onCompleteHabit callback and toast trigger.
 */
export default function MitigationTab({ onCompleteHabit, onToast }: MitigationTabProps) {
  return (
    <section aria-labelledby="mitigation-heading" className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800/60 space-y-6">
      <div>
        <h2 id="mitigation-heading" className="text-xl font-bold text-slate-200">Eco-Mitigation Challenges</h2>
        <p className="text-xs text-slate-400">
          Complete standard action items in your daily lifestyle to earn XP points and extend your conservation streaks.
        </p>
      </div>

      <div className="space-y-3.5">
        {AVAILABLE_HABITS.map((habit) => (
          <div
            key={habit.title}
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
                onCompleteHabit(habit.title, habit.points);
                onToast(`Habit logged! Earned +${habit.points} XP.`);
              }}
              aria-label={`Log habit: ${habit.title} and earn ${habit.points} XP`}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 outline-none focus:ring-2 focus:ring-emerald-400 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Habit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
