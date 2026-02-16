'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SentReceivedChartProps {
  sent: number;
  received: number;
}

export function SentReceivedChart({ sent, received }: SentReceivedChartProps) {
  const data = [
    { name: 'Sent', value: sent },
    { name: 'Received', value: received },
  ];

  const COLORS = ['var(--accent)', 'var(--muted-light)'];
  const total = sent + received;
  const sentPct = total > 0 ? ((sent / total) * 100).toFixed(1) : '0';
  const recvPct = total > 0 ? ((received / total) * 100).toFixed(1) : '0';
  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        Sent vs Received
      </h3>

      {total === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No data available</p>
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--foreground)',
                  fontSize: 12,
                  padding: '8px 12px',
                }}
                formatter={(value: number | undefined) => value != null ? fmt(value) : '0'}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg p-3 text-center" style={{ background: 'var(--accent-soft)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{fmt(sent)}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Sent ({sentPct}%)</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface-hover)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{fmt(received)}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Received ({recvPct}%)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
