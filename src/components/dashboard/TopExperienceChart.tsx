'use client';

import { CompositeChart } from '@mantine/charts';
import { Title } from '@mantine/core';
import React from 'react';

import {
  ExperienceStat,
  TopExperiencesChartProps,
  TopExperiencesChartType,
  TopExperiencesMetricKey,
  TopExperiencesSeriesItem,
} from '@/types/dashboard';

// Generate some mock data
export const mockData: ExperienceStat[] = [
  {
    experience_id: 'Saigon After Dark',
    num_visits: 150,
    stories: 10,
    photos: 30,
  },
  { experience_id: 'Insider Saigon', num_visits: 200, stories: 15, photos: 20 },
  { experience_id: 'Lovesick', num_visits: 80, stories: 12, photos: 25 },
  { experience_id: 'Starstruck', num_visits: 160, stories: 20, photos: 35 },
  { experience_id: 'Love In The City', num_visits: 90, stories: 5, photos: 10 },
  { experience_id: 'Rainy Metro', num_visits: 130, stories: 10, photos: 30 },
  {
    experience_id: 'Sunshine in HCM',
    num_visits: 180,
    stories: 14,
    photos: 28,
  },
  { experience_id: 'Dance All Night', num_visits: 100, stories: 9, photos: 22 },
  { experience_id: 'Foodie Haven', num_visits: 220, stories: 2, photos: 40 },
  { experience_id: 'Lalaland', num_visits: 110, stories: 7, photos: 18 },
];

const TopExperiencesChart: React.FC<TopExperiencesChartProps> = ({
  data = mockData,
}) => {
  // Create the mapping object with full typing
  const mapMetric: Record<TopExperiencesMetricKey, TopExperiencesChartType> = {
    num_visits: 'line',
    stories: 'bar',
    photos: 'bar',
  };

  // Create the mapping object with full typing
  const mapMetricColor: Record<TopExperiencesMetricKey, string> = {
    num_visits: '#FFB07C',
    stories: 'violet.4',
    photos: 'yellow',
  };

  // Define metrics array with correct typing
  const metrics: TopExperiencesMetricKey[] = [
    // 'num_visits',
    'stories',
    'photos',
  ];

  // Properly typed and constructed series array
  const series: TopExperiencesSeriesItem[] = [];

  for (const metric of metrics) {
    series.push({
      name: metric,
      type: mapMetric[metric],
      // color: `${mapMetricColor[metric]}.${idx + 3}`,
      color: mapMetricColor[metric],
      label: metric.charAt(0).toUpperCase() + metric.slice(1).toLowerCase(),
    });
  }

  return (
    <div>
      <Title order={4} mb="sm">
        All Experiences
      </Title>
      <CompositeChart
        data={data}
        dataKey="experience_id" // The key to use for labels on the y-axis
        series={series}
        h={350}
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
        xAxisProps={{
          tickMargin: 15,
          orientation: 'bottom',
          angle: 0,
          style: { fontSize: '0.5rem' },
          interval: 0,
          tick: ({ x, y, payload }) => {
            const words = String(payload.value).split(' ');
            return (
              <g transform={`translate(${x},${y + 10})`}>
                <text textAnchor="middle" fill="#666" fontSize="0.5rem">
                  {words.map((word, index) => (
                    <tspan key={index} x={0} dy={index === 0 ? 0 : 12}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          },
        }}
      />
    </div>
  );
};

export default TopExperiencesChart;
