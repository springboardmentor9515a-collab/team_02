export interface SentimentResults {
  results: {
    positive: number;
    negative: number;
    neutral: number;
  };
  percentages: {
    positive: number;
    negative: number;
    neutral: number;
  };
  total: number;
  type: string;
  entityId: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
}

export type SentimentType = 'positive' | 'negative' | 'neutral';