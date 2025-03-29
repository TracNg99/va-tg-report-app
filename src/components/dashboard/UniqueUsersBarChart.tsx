import { LineChart } from '@mantine/charts';
import { Card, Title } from '@mantine/core';
import React from 'react';

import { UniqueUsersBarChartProps, UniqueUsersData } from '@/types/dashboard';

// Sample data for testing and initial rendering
export const sampleData: UniqueUsersData[] = [
  { date: '2025-03-12', visited: 10, posted: 5 },
  { date: '2025-03-13', visited: 12, posted: 5 },
  { date: '2025-03-14', visited: 15, posted: 6 },
  { date: '2025-03-15', visited: 18, posted: 8 },
  { date: '2025-03-16', visited: 20, posted: 9 },
  { date: '2025-03-17', visited: 24, posted: 13 },
  { date: '2025-03-18', visited: 30, posted: 13 },
];

const UniqueUsersBarChart: React.FC<UniqueUsersBarChartProps> = ({ data }) => {
  const chartData = data || sampleData;

  return (
    <Card padding="lg">
      <Title order={4} mb="md">
        Unique Users Posting Stories
      </Title>
      <LineChart
        h={300}
        data={chartData}
        dataKey="date"
        series={[
          { name: 'visited', color: 'violet.4', label: 'Visited' },
          { name: 'posted', color: 'blue.4', label: 'Posted' },
        ]}
        curveType="linear"
        tickLine="y"
        withLegend
        dotProps={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
        activeDotProps={{ r: 8, strokeWidth: 1, fill: '#fff' }}
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

export default UniqueUsersBarChart;
