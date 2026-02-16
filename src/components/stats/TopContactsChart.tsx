'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TopContactsPeriod } from '@/types/database';

interface TopContact {
  name: string;
  messageCount: number;
}

interface TopContactsChartProps {
  dataByPeriod: Record<TopContactsPeriod, TopContact[]>;
}

const periods: { key: TopContactsPeriod; label: string }[] = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
  { key: 'all', label: 'All Time' },
];

export function TopContactsChart({ dataByPeriod }: TopContactsChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TopContactsPeriod>('all');

  const data = dataByPeriod[selectedPeriod] || [];
  const topContacts = data.slice(0, 10).sort((a, b) => b.messageCount - a.messageCount);
  const chartData = topContacts.map((contact) => ({
    ...contact,
    displayName: contact.name.length > 18 ? contact.name.substring(0, 15) + '...' : contact.name,
  }));

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Top Contacts
        </h3>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPeriod(p.key)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              style={{
                background: selectedPeriod === p.key ? 'var(--accent)' : 'var(--surface-hover)',
                color: selectedPeriod === p.key ? 'white' : 'var(--muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
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
              formatter={(value: number | undefined) => [value != null ? new Intl.NumberFormat('en-US').format(value) : '0', 'Messages']}
            />
            <Bar dataKey="messageCount" fill="var(--accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
