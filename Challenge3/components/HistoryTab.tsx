/**
 * @file HistoryTab.tsx
 * @description Searchable audit trail table of all logged eco-habits.
 * Displays habit descriptions, timestamps, and XP earned in descending order.
 */

'use client';

import React, { useMemo } from 'react';
import { History } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoggedHabit {
  id: string;
  timestamp: string;
  title: string;
  pointsEarned: number;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HistoryTabProps {
  completedHabits: LoggedHabit[];
  habitFilter: string;
  onFilterChange: (value: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the habit history audit trail with search/filter functionality.
 * @param props - List of completed habits, active filter string, and filter change callback.
 */
export default function HistoryTab({ completedHabits, habitFilter, onFilterChange }: HistoryTabProps) {
  const filteredHabits = useMemo(() => {
    if (!habitFilter.trim()) return completedHabits;
    const lower = habitFilter.toLowerCase();
    return completedHabits.filter((h) => h.title.toLowerCase().includes(lower));
  }, [completedHabits, habitFilter]);

  const last7Days = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d);
    }
    return list;
  }, []);

  const loggedDatesSet = useMemo(() => {
    return new Set(
      completedHabits.map((h) => {
        const d = new Date(h.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );
  }, [completedHabits]);

  return (
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
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
      </div>

      {/* 7-Day Streak Calendar Grid */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/60 space-y-3">
        <h3 className="text-xs uppercase font-extrabold text-emerald-450 tracking-wider">
          Streak Tracker Calendar (Last 7 Days)
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date) => {
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const isLogged = loggedDatesSet.has(dateStr);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={dateStr}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                  isLogged
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : isToday
                    ? 'bg-slate-800 border-amber-500/40 text-slate-300 font-bold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10px] uppercase font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-sm font-black mt-0.5">{date.getDate()}</span>
                <div className={`w-2 h-2 rounded-full mt-2 ${isLogged ? 'bg-emerald-400 animate-pulse' : 'bg-slate-750'}`} />
              </div>
            );
          })}
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
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                    +{habit.pointsEarned} XP
                  </td>
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
  );
}
