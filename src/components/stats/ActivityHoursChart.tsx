'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityByHour {
  hour: number;
  count: number;
}

interface ActivityHoursChartProps {
  data: ActivityByHour[];
}

export function ActivityHoursChart({ data }: ActivityHoursChartProps) {
  // Ensure we have data for all 24 hours
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const existing = data.find((d) => d.hour === i);
    return {
      hour: i,
      count: existing?.count || 0,
      displayHour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
    };
  });

  // Determine sleep hours (typically midnight to 6 AM)
  const isSleepHour = (hour: number) => hour >= 0 && hour < 6;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Activity by Hour of Day
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={fullData}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="displayHour"
                stroke="#9CA3AF"
                tick={{ fill: '#6B7280', fontSize: 11 }}
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
                labelStyle={{ color: '#F9FAFB' }}
                formatter={(value: number) => [
                  new Intl.NumberFormat('en-US').format(value),
                  'Messages',
                ]}
              />
              <Bar
                dataKey="count"
                fill="#0B93F6"
                radius={[4, 4, 0, 0]}
                // Color sleep hours differently
                shape={(props: any) => {
                  const { fill, x, y, width, height, payload } = props;
                  const fillColor = isSleepHour(payload.hour) ? '#6B7280' : fill;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fillColor}
                      rx={4}
                      ry={4}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#0B93F6] rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Sleep Hours (12 AM - 6 AM)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
