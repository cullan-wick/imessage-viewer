'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CumulativeChartProps {
  data: Array<{ period: string; sent: number; received: number }>;
}

export function CumulativeChart({ data }: CumulativeChartProps) {
  const cumulative = useMemo(() => {
    let cumSent = 0;
    let cumRecv = 0;
    return data.map(item => {
      cumSent += item.sent;
      cumRecv += item.received;
      return { period: item.period, sent: cumSent, received: cumRecv };
    });
  }, [data]);

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        Total Messages Over Time
      </h3>

      {cumulative.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={cumulative} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <defs>
              <linearGradient id="cumSentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cumRecvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--muted-light)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--muted-light)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="period"
              stroke="var(--muted-light)"
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis stroke="var(--muted-light)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--foreground)',
                fontSize: 12,
                padding: '8px 12px',
              }}
              formatter={(value: number | undefined) => value != null ? new Intl.NumberFormat('en-US').format(value) : '0'}
            />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="sent"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#cumSentGrad)"
              name="Sent"
            />
            <Area
              type="monotone"
              dataKey="received"
              stroke="var(--muted-light)"
              strokeWidth={2}
              fill="url(#cumRecvGrad)"
              name="Received"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
