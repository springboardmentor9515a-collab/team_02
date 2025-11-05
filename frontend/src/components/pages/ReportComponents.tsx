import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { reportsAPI } from '@/lib/api';
import { toast } from "sonner";
import { BarChart3, FileText, Download, TrendingUp, MessageSquare, BarChart } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { SentimentResults, ChartDataPoint, SentimentType } from '@/types/sentiment';

interface ReportSummary {
  category: string;
  count: number;
  lastMonth: number;
  trend: 'up' | 'down' | 'stable';
}

import { Page } from '@/types';

interface ReportDashboardProps {
  reports: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    location: string;
    status: string;
    upvotes: number;
    submittedBy: string;
    attachments: number;
  }>;
  onViewDetails?: (reportId: string) => void;
  onNavigate?: (page: Page, itemId?: string) => void;
}

interface SentimentChartProps {
  data: SentimentResults;
}

function SentimentChart({ data }: SentimentChartProps) {
  const chartData: ChartDataPoint[] = [
    { name: 'Positive', value: data.results.positive, percentage: data.percentages.positive },
    { name: 'Negative', value: data.results.negative, percentage: data.percentages.negative },
    { name: 'Neutral', value: data.results.neutral, percentage: data.percentages.neutral },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>Distribution of sentiment for {data.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} (${chartData.find(d => d.name === name)?.percentage.toFixed(1)}%)`,
                  name
                ]}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#22c55e"
                name="Sentiment Count"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportDashboard({ reports, onViewDetails, onNavigate }: ReportDashboardProps) {
  const [reportStats, setReportStats] = useState<{
    totalReports: number;
    monthlyReports: ReportSummary[];
  } | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentResults | null>(null);

  useEffect(() => {
    loadEngagementReport();
    loadSentimentAnalysis();
  }, []);

  const loadEngagementReport = async () => {
    try {
      const data = await reportsAPI.getEngagementReport();
      setReportStats(data);
    } catch (error) {
      console.error('Error loading engagement report:', error);
      toast.error('Failed to load engagement report');
    }
  };

  const loadSentimentAnalysis = async () => {
    try {
      const data = await reportsAPI.getSentimentAnalysis();
      setSentimentData(data);
    } catch (error) {
      console.error('Error loading sentiment analysis:', error);
      toast.error('Failed to load sentiment analysis');
    }
  };

  const handleExportReport = async (type: 'polls' | 'petitions' | 'complaints') => {
    try {
      const blob = await reportsAPI.exportReports('csv', type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${type} report:`, error);
      toast.error(`Failed to export ${type} report`);
    }
  };

  if (!reportStats) {
    return <div>Loading engagement data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Engagement</CardTitle>
                <CardDescription>Overall participation statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.totalReports}</div>
                <p className="text-sm text-gray-500">Total Reports</p>
              </CardContent>
            </Card>

            {reportStats.monthlyReports.map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{report.category}</CardTitle>
                  <CardDescription>Monthly activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Current Month</span>
                      <span className="font-bold">{report.count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Previous Month</span>
                      <span>{report.lastMonth}</span>
                    </div>
                    <Badge
                      variant={report.trend === 'up' ? 'default' : report.trend === 'down' ? 'destructive' : 'secondary'}
                    >
                      {report.trend === 'up' ? '↑' : report.trend === 'down' ? '↓' : '→'} {report.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleExportReport('polls')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Polls Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleExportReport('petitions')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Petitions Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleExportReport('complaints')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Complaints Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          {sentimentData ? (
            <SentimentChart data={sentimentData} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Loading sentiment analysis...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReportsFilterProps {
  onChange: (filters: { category?: string; status?: string; type?: string }) => void;
}

export function ReportsFilter({ onChange }: ReportsFilterProps) {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: 'all',
    type: 'all'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="polls">Polls</SelectItem>
              <SelectItem value="petitions">Petitions</SelectItem>
              <SelectItem value="complaints">Complaints</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="participation">Participation</SelectItem>
              <SelectItem value="resolution">Resolution</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}