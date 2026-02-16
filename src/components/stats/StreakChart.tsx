'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StreakEntry {
  name: string;
  longestStreak: number;
  currentStreak: number;
}

interface StreakChartProps {
  data: StreakEntry[];
}

export function StreakChart({ data }: StreakChartProps) {
  const sorted = [...data].sort((a, b) => b.longestStreak - a.longestStreak).slice(0, 10);
  const chartData = sorted.map((entry) => ({
    ...entry,
    displayName: entry.name.length > 18 ? entry.name.substring(0, 15) + '...' : entry.name,
  }));

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Texting Streaks
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Consecutive days of messaging
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 90, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis type="number" stroke="var(--muted-light)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis
              dataKey="displayName"
              type="category"
              stroke="var(--muted-light)"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              width={85}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--foreground)',
                fontSize: 12,
                padding: '8px 12px',
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                value != null ? `${value} days` : '0 days',
                name === 'longestStreak' ? 'Best Streak' : 'Current Streak',
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
              formatter={(value: string) => value === 'longestStreak' ? 'Best Streak' : 'Current Streak'}
            />
            <Bar dataKey="longestStreak" fill="var(--accent)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="currentStreak" fill="var(--green)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
