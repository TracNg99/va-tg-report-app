export interface ActivityData {
  date: string;
  stories: number;
  photos: number;
}

export interface DailyActivityChartProps {
  data?: ActivityData[];
}

export interface NumberChartProps {
  title: string;
  value: number;
  gradientColor?: string;
  icon?: React.ReactNode;
  change?: number; // percentage change compared to last week
}

export interface ExperienceStat {
  experience_id: string;
  num_visits: number;
  stories: number;
  photos: number;
}

export type TopExperiencesMetricKey = 'num_visits' | 'stories' | 'photos';

export type TopExperiencesChartType = 'bar' | 'line' | 'area';

export interface TopExperiencesChartProps {
  data?: ExperienceStat[];
}

export interface TopExperiencesSeriesItem {
  name: TopExperiencesMetricKey;
  type: TopExperiencesChartType;
  color: string;
  label: string;
}

export interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  payload: {
    name: string;
    value: number;
  };
}

export interface CustomLabelLineProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
}

export interface MyPieChartCell {
  name: string;
  value: number;
  color: string;
}

export interface TopExperiencePieChartProps {
  data?: ExperienceStat[];
  numberOfTop: number; // How many top experiences to display before grouping "Others"
}

export interface UniqueUsersData {
  date: string;
  visited: number;
  posted: number;
}

export interface UniqueUsersBarChartProps {
  data?: UniqueUsersData[];
}
