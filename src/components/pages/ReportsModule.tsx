import React, { useState } from 'react';
import { Page } from '../../App';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus,
  MapPin,
  Calendar,
  ThumbsUp,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Camera
} from "lucide-react";

interface ReportsModuleProps {
  onNavigate: (page: Page, itemId?: string) => void;
  selectedItemId?: string | null;
}

const ReportsModule: React.FC<ReportsModuleProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const mockReports = [
    {
      id: '1',
      title: "Broken Streetlight on Main Street",
      description: "The streetlight at the intersection of Main Street and Oak Avenue has been out for over a week, creating a safety hazard for pedestrians and drivers.",
      category: "Infrastructure",
      tags: ["Street Maintenance"],
      location: "Main St & Oak Ave",
      status: "In Progress",
      upvotes: 23,
      submittedBy: "Anonymous",
      attachments: 1
    },
    {
      id: '2',
      title: "Pothole on Elm Street",
      description: "Large pothole near 123 Elm Street is causing damage to vehicles and creating a traffic hazard.",
      category: "Infrastructure",
      tags: ["Road Maintenance"],
      location: "123 Elm Street",
      status: "Resolved",
      upvotes: 45,
      submittedBy: "Sarah Johnson",
      attachments: 2
    },
  ];

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setViewMode('detail');
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedReport(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const ReportDetailView = ({ report }: { report: any }) => (
    <div className="space-y-6">
       <Button variant="ghost" onClick={handleBackToList}>← Back to Reports</Button>
       <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-civix-dark-brown dark:text-white mb-4">{report.title}</h2>
            {/* Add more detailed content here */}
            <p className="text-gray-600 dark:text-gray-300">{report.description}</p>
        </CardContent>
       </Card>
    </div>
  );

  const ReportListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Community Reports</h2>
          <p className="text-gray-500 dark:text-gray-400">Report issues and track progress in your community</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a New Report</DialogTitle>
              <DialogDescription>Help improve your community by reporting an issue.</DialogDescription>
            </DialogHeader>
            {/* Form for new report would go here */}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search reports..." className="pl-10 bg-civix-light-gray dark:bg-gray-700" />
            </div>
            <div className="flex gap-4">
              <Select defaultValue="all"><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem></SelectContent></Select>
              <Select defaultValue="all"><SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mockReports.map((report) => (
          <Card key={report.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                     <h3 className="text-lg font-semibold text-civix-dark-brown dark:text-white">{report.title}</h3>
                     {getStatusBadge(report.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Badge variant="outline">{report.category}</Badge>
                    {report.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/>{report.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{report.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-civix-warm-beige dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center"><ThumbsUp className="w-4 h-4 mr-1"/>{report.upvotes} upvotes</span>
                  <span>By {report.submittedBy}</span>
                  {report.attachments > 0 && <span className="flex items-center"><Camera className="w-4 h-4 mr-1"/>{report.attachments} attachment</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">Upvote</Button>
                  <Button size="sm" onClick={() => handleViewReport(report)}>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {viewMode === 'list' ? <ReportListView /> : <ReportDetailView report={selectedReport} />}
    </div>
  );
};

export default ReportsModule;

