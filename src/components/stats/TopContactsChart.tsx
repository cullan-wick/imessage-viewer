'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopContact {
  name: string;
  messageCount: number;
}

interface TopContactsChartProps {
  data: TopContact[];
}

export function TopContactsChart({ data }: TopContactsChartProps) {
  const topContacts = data.slice(0, 10).sort((a, b) => b.messageCount - a.messageCount);
  const chartData = topContacts.map((contact) => ({
    ...contact,
    displayName: contact.name.length > 18 ? contact.name.substring(0, 15) + '...' : contact.name,
  }));

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        Top 10 Contacts
      </h3>
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
