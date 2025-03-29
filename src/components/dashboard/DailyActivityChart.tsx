import { LineChart } from '@mantine/charts';
import { Card, Title } from '@mantine/core';
import React from 'react';

import { ActivityData, DailyActivityChartProps } from '@/types/dashboard';

// Sample data for initial rendering / testing
const sampleData: ActivityData[] = [
  { date: '2025-03-12', stories: 5, photos: 8 },
  { date: '2025-03-13', stories: 3, photos: 6 },
  { date: '2025-03-14', stories: 7, photos: 9 },
  { date: '2025-03-15', stories: 4, photos: 5 },
  { date: '2025-03-16', stories: 6, photos: 7 },
  { date: '2025-03-17', stories: 6, photos: 7 },
  { date: '2025-03-18', stories: 6, photos: 7 },
];

const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ data }) => {
  // Use provided data or fallback to sample data
  const chartData = data || sampleData;

  return (
    <Card padding="lg">
      <Title order={4} mb="md">
        Daily Stories and Photos
      </Title>
      <LineChart
        h={300}
        data={chartData}
        dataKey="date"
        withLegend
        legendProps={{
          verticalAlign: 'top',
          layout: 'horizontal',
          wrapperStyle: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'right',
          },
        }}
        series={[
          { name: 'stories', color: 'violet.4', label: 'Stories' },
          { name: 'photos', color: 'yellow', label: 'Photos' },
        ]}
        curveType="linear"
        xAxisProps={{
          tickMargin: 15,
          orientation: 'bottom',
          angle: -30,
          style: { fontSize: '0.6rem' },
        }}
      />
    </Card>
  );
};

export default DailyActivityChart;
