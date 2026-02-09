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
  // Take top 10 and sort by count descending
  const topContacts = data.slice(0, 10).sort((a, b) => b.messageCount - a.messageCount);

  // Truncate long names
  const chartData = topContacts.map((contact) => ({
    ...contact,
    displayName: contact.name.length > 20 ? contact.name.substring(0, 17) + '...' : contact.name,
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top 10 Contacts
      </h3>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis
              dataKey="displayName"
              type="category"
              stroke="#9CA3AF"
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              labelStyle={{ color: '#F9FAFB' }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat('en-US').format(value),
                'Messages',
              ]}
            />
            <Bar dataKey="messageCount" fill="#0B93F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
