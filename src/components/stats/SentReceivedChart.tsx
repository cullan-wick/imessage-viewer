'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentReceivedChartProps {
  sent: number;
  received: number;
}

export function SentReceivedChart({ sent, received }: SentReceivedChartProps) {
  const data = [
    { name: 'Sent', value: sent },
    { name: 'Received', value: received },
  ];

  const COLORS = ['#0B93F6', '#8E8E93'];

  const total = sent + received;
  const sentPercent = total > 0 ? ((sent / total) * 100).toFixed(1) : '0';
  const receivedPercent = total > 0 ? ((received / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sent vs Received
      </h3>

      {total === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {new Intl.NumberFormat('en-US').format(sent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Sent ({sentPercent}%)
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {new Intl.NumberFormat('en-US').format(received)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Received ({receivedPercent}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
