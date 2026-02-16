'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ActivityByHour {
  hour: number;
  count: number;
}

interface ActivityHoursChartProps {
  data: ActivityByHour[];
}

export function ActivityHoursChart({ data }: ActivityHoursChartProps) {
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const existing = data.find((d) => d.hour === i);
    return {
      hour: i,
      count: existing?.count || 0,
      label: i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`,
    };
  });

  const maxCount = Math.max(...fullData.map(d => d.count));

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        Activity by Hour
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fullData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-light)"
              tick={{ fill: 'var(--muted)', fontSize: 10 }}
              interval={1}
            />
            <YAxis stroke="var(--muted-light)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--accent)',
                fontSize: 12,
                padding: '8px 12px',
              }}
              itemStyle={{ color: 'var(--accent)' }}
              labelStyle={{ color: 'var(--accent)' }}
              formatter={(value: number | undefined) => [value != null ? new Intl.NumberFormat('en-US').format(value) : '0', 'Messages']}
              labelFormatter={(label) => {
                const item = fullData.find(d => d.label === label);
                if (!item) return label;
                const h = item.hour;
                return h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h-12}:00 PM`;
              }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {fullData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={'var(--accent)'}
                  opacity={entry.count === 0 ? 0.2 : 0.4 + (entry.count / maxCount) * 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
