import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { SentimentResults, ChartDataPoint, SentimentType } from '@/types/sentiment';

const COLORS: Record<SentimentType, string> = {
  positive: '#4CAF50', // Green
  negative: '#f44336', // Red
  neutral: '#FFC107'   // Yellow
};

const REFRESH_INTERVAL = 5000; // Refresh every 5 seconds

const SentimentDashboard = () => {
  const params = useParams();
  const type = params.type ?? '';
  const id = params.id ?? '';
  const [results, setResults] = useState<SentimentResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    if (!type || !id) {
      setError('Missing resource type or id in URL');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/reports/sentiment/${type}/${id}`);
      setResults(response.data);
      setError(null);
    } catch (err) {
      const errorMsg = (err && (err as AxiosError).message) ? (err as AxiosError).message : 'Unknown error';
      setError(errorMsg);
      console.error('Error fetching results:', err);
      toast.error('Failed to load sentiment analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [type, id]);

  // Export data as JSON
  const handleExportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${type}-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported sentiment analysis as JSON');
  };

  // Export data as CSV
  const handleExportCSV = () => {
    if (!results) return;
    const { percentages } = results;
    const csvData = `Sentiment,Count,Percentage
Positive,${results.results.positive},${percentages.positive}
Negative,${results.results.negative},${percentages.negative}
Neutral,${results.results.neutral},${percentages.neutral}
Total,${results.total},100`;

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${type}-${id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported sentiment analysis as CSV');
  };

  const getColorForSentiment = (key: string): string => {
    const k = key.toLowerCase() as SentimentType;
    return COLORS[k] || '#888';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-civix-civic-green" />
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center p-4">Error: {error}</div>
  );

  if (!results) return null;

  const chartData: ChartDataPoint[] = [
    { name: 'Positive', value: results.results.positive, percentage: results.percentages.positive },
    { name: 'Negative', value: results.results.negative, percentage: results.percentages.negative },
    { name: 'Neutral', value: results.results.neutral, percentage: results.percentages.neutral }
  ];

  return (
    <Card className="p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold text-civix-dark-brown dark:text-civix-sandal">
            Sentiment Analysis
          </CardTitle>
          <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
            Analysis of {type.slice(0, -1)} content and comments
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportJSON}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/50 dark:bg-gray-700/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold">{results.total}</div>
              <p className="text-xs text-muted-foreground">Total Analysis Points</p>
            </CardContent>
          </Card>
          {(Object.entries(results.percentages) as [string, number][]).map(([key, value]) => (
            <Card key={key} className="bg-white/50 dark:bg-gray-700/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold" style={{ color: getColorForSentiment(key) }}>
                  {Number(value)}%
                </div>
                <p className="text-xs text-muted-foreground capitalize">{key} Sentiment</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">Distribution (Pie Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={getColorForSentiment(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">Distribution (Bar Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={getColorForSentiment(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDashboard;