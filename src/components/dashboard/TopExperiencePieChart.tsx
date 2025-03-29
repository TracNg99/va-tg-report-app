'use client';

import { PieChart } from '@mantine/charts';
import { Select, Title } from '@mantine/core';
import React, { useMemo, useState } from 'react';

import {
  CustomLabelLineProps,
  CustomizedLabelProps,
  MyPieChartCell,
  TopExperiencePieChartProps,
  TopExperiencesMetricKey,
} from '@/types/dashboard';

import { mockData } from './TopExperienceChart';

const pieChartDefaultColors = [
  '#569EE3',
  '#96CEFE',
  '#6487FB',
  '#9674F8',
  '#C4AFFD',
  '#FECD32',
];

const TopExperiencePieChart: React.FC<TopExperiencePieChartProps> = ({
  data = mockData,
  numberOfTop,
}) => {
  // State for the selected metric (default is "num_visits")
  const [selectedMetric, setSelectedMetric] =
    useState<TopExperiencesMetricKey>('num_visits');

  // Prepare pie chart data as an array of cells matching Mantine's PieChartCell type
  const pieChartData: MyPieChartCell[] = useMemo(() => {
    // Sort experiences in descending order by the selected metric
    const sortedData = [...data].sort(
      (a, b) => b[selectedMetric] - a[selectedMetric],
    );
    const topItems = sortedData.slice(0, numberOfTop);
    const otherItems = sortedData.slice(numberOfTop);

    // Map top experiences to PieChartCell objects using "name"
    const cells: MyPieChartCell[] = topItems.map((item, index) => ({
      name: item.experience_id,
      value: item[selectedMetric],
      color: pieChartDefaultColors[index % pieChartDefaultColors.length],
    }));

    // If there are additional experiences, group them into "Others"
    if (otherItems.length > 0) {
      const othersTotal = otherItems.reduce(
        (sum, item) => sum + item[selectedMetric],
        0,
      );
      cells.push({
        name: 'Others',
        value: othersTotal,
        color:
          pieChartDefaultColors[topItems.length % pieChartDefaultColors.length],
      });
    }

    return cells;
  }, [data, numberOfTop, selectedMetric]);

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    payload,
  }: CustomizedLabelProps) => {
    // Calculate position for the value inside the slice.
    const valueRadius = innerRadius + (outerRadius - innerRadius) / 2;
    const valueX = cx + valueRadius * Math.cos(-midAngle * RADIAN);
    const valueY = cy + valueRadius * Math.sin(-midAngle * RADIAN);

    // Calculate position for the name outside the slice.
    const nameRadius = outerRadius + 15; // Adjust offset as needed
    const nameX = cx + nameRadius * Math.cos(-midAngle * RADIAN);
    const nameY = cy + nameRadius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        {/* Value inside the slice */}
        <text
          x={valueX}
          y={valueY}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {payload.value}
        </text>
        {/* Name outside the slice */}
        <text
          x={nameX}
          y={nameY}
          fill="#333"
          textAnchor={nameX > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={8}
        >
          {payload.name}
        </text>
      </g>
    );
  };

  const renderCustomLabelLine = ({
    cx,
    cy,
    midAngle,
    outerRadius,
  }: CustomLabelLineProps) => {
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    // Starting point at the outer edge of the slice
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    // A middle point with a small offset from the outer edge
    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;

    return (
      <polyline stroke="#333" fill="none" points={`${sx},${sy} ${mx},${my}`} />
    );
  };

  return (
    <div>
      <Title order={4} mb="sm">
        Top {numberOfTop} Experiences -{' '}
        {selectedMetric === 'num_visits' ? 'Visitors' : 'Stories'}
      </Title>
      <Select
        label="Select Metric"
        data={[
          { value: 'num_visits', label: 'Visitors' },
          { value: 'stories', label: 'Stories' },
        ]}
        value={selectedMetric}
        onChange={(value) =>
          value && setSelectedMetric(value as TopExperiencesMetricKey)
        }
      />
      <PieChart
        data={pieChartData}
        h={300}
        w={300}
        withTooltip
        tooltipDataSource="segment"
        pieProps={{
          label: renderCustomizedLabel,
          labelLine: renderCustomLabelLine,
        }}
      />
    </div>
  );
};

export default TopExperiencePieChart;
