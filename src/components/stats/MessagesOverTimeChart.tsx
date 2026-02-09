'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MessagesByMonth {
  month: string;
  count: number;
  sent: number;
  received: number;
}

interface MessagesOverTimeChartProps {
  data: MessagesByMonth[];
}

export function MessagesOverTimeChart({ data }: MessagesOverTimeChartProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Messages Over Time
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              labelStyle={{ color: '#F9FAFB', marginBottom: '8px' }}
              formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="sent"
              stroke="#0B93F6"
              strokeWidth={2}
              dot={{ fill: '#0B93F6', r: 3 }}
              activeDot={{ r: 5 }}
              name="Sent"
            />
            <Line
              type="monotone"
              dataKey="received"
              stroke="#8E8E93"
              strokeWidth={2}
              dot={{ fill: '#8E8E93', r: 3 }}
              activeDot={{ r: 5 }}
              name="Received"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#34C759"
              strokeWidth={2}
              dot={{ fill: '#34C759', r: 3 }}
              activeDot={{ r: 5 }}
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
