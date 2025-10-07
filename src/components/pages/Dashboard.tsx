import React from 'react';
import { Page } from '../../App';  // Corrected to absolute path
import { Button } from "@/components/ui/button"; // Corrected to absolute path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Corrected to absolute path
import { Badge } from "@/components/ui/badge"; // Corrected to absolute path
import { 
  FileText, 
  Vote, 
  BarChart3, 
  MessageSquare, 
  TrendingUp
} from "lucide-react";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const stats = [
    { title: "Total Petitions", value: 12, change: "3 signed this week", icon: FileText },
    { title: "Active Polls", value: 8, change: "2 voted today", icon: Vote },
    { title: "Reports Submitted", value: 5, change: "2 resolved", icon: BarChart3 },
    { title: "Messages Received", value: 4, change: "1 unread", icon: MessageSquare },
  ];

  const trendingItems = [
    { title: "Solar Panel Schools", status: "Hot" },
    { title: "Bike Lane Expansion", status: "Rising" },
    { title: "Library Hours Extension", status: "New" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white shadow-lg border-0">
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold">Welcome back, John!</h2>
          <p className="opacity-90">Ready to make a difference in your community today?</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-civix-dark-brown dark:text-gray-300">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-civix-dark-brown/70 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-civix-dark-brown dark:text-white">{stat.value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Trending */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-civix-dark-brown dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => onNavigate('petitions')} className="bg-civix-civic-green text-white h-28 flex flex-col gap-2 hover:bg-civix-civic-green/90">
                <FileText />
                <span>Create Petition</span>
              </Button>
              <Button onClick={() => onNavigate('reports')} className="bg-civix-civic-green text-white h-28 flex flex-col gap-2 hover:bg-civix-civic-green/90">
                <BarChart3 />
                <span>Submit Report</span>
              </Button>
              <Button onClick={() => onNavigate('polls')} className="bg-civix-civic-green text-white h-28 flex flex-col gap-2 hover:bg-civix-civic-green/90">
                <Vote />
                <span>Start Poll</span>
              </Button>
              <Button onClick={() => onNavigate('messages')} className="bg-civix-civic-green text-white h-28 flex flex-col gap-2 hover:bg-civix-civic-green/90">
                <MessageSquare />
                <span>View Messages</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-civix-dark-brown dark:text-white flex items-center"><TrendingUp className="mr-2"/>Trending Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium text-civix-dark-brown dark:text-gray-200">{item.title}</span>
                  <Badge className={`${item.status === 'Hot' ? 'bg-red-500' : 'bg-green-500'} text-white`}>{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Poll */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-civix-dark-brown dark:text-white">Quick Poll</CardTitle>
              <CardDescription>How would you rate your city's response to citizen concerns?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start">Excellent</Button>
              <Button variant="outline" className="w-full justify-start">Good</Button>
              <Button variant="outline" className="w-full justify-start">Fair</Button>
              <Button variant="outline" className="w-full justify-start">Poor</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

