import React, { useState, useEffect } from 'react';
import { Page } from '@/types';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // ✅ ADDED IMPORT

import { 
  Search, 
  Plus,
  MapPin,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Eye
} from "lucide-react";

import { ReportDashboard, ReportsFilter } from './ReportComponents';

// Define props interfaces for the components
interface ReportsFilterProps {
  onChange: (filters: { category?: string; status?: string; type?: string }) => void;
}

interface ReportDashboardProps {
  reports: Report[];
  onViewDetails?: (reportId: string) => void;
  onNavigate?: (page: Page, itemId?: string) => void;
}

// ✅ Report data type
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  location: string;
  status: "In Progress" | "Resolved" | "Pending" | "Under Review";
  upvotes: number;
  submittedBy: string;
  attachments: number;
}

interface ReportsModuleProps {
  onNavigate: (page: Page, itemId?: string) => void;
  selectedItemId?: string | null;
  userName: string;
}

const ReportsModule: React.FC<ReportsModuleProps> = ({ onNavigate, userName }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    location: '',
  });

  // ✅ Added mock report storage
  const [mockReports, setMockReports] = useState<Report[]>([]);

  // ✅ Fetch Reports (mock)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const mockData: Report[] = []; // Placeholder
        setReports(mockData);
        setFilteredReports(mockData);
        setMockReports(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // ✅ Filter Handler (Placeholder)
  const handleFilterChange = (filters: any) => {
    // Apply filters logic here if needed
    setFilteredReports(reports);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setViewMode('detail');
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedReport(null);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReport.title || !newReport.description || !newReport.type || !newReport.category) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const createdReport: Report = {
      id: (mockReports.length + 1).toString(),
      title: newReport.title,
      description: newReport.description,
      type: newReport.type,
      category: newReport.category,
      location: newReport.location || "Not specified",
      status: "Pending",
      upvotes: 0,
      submittedBy: isAnonymous ? "Anonymous" : userName,
      attachments: 0,
    };

    const updatedReports = [createdReport, ...mockReports];
    setMockReports(updatedReports);
    setReports(updatedReports);
    setFilteredReports(updatedReports);

    toast.success("Report submitted successfully!");
    setIsCreateModalOpen(false);

    setNewReport({
      title: '',
      description: '',
      type: '',
      category: '',
      location: '',
    });
    setIsAnonymous(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Pending':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const ReportDetailView = ({ report }: { report: Report }) => (
    <div className="space-y-6 p-6">
      <Button variant="ghost" onClick={handleBackToList}>← Back to Reports</Button>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-civix-dark-brown dark:text-white mb-4">{report.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{report.description}</p>
        </CardContent>
      </Card>
    </div>
  );

  const ReportListView = () => (
    <div className="space-y-6 p-6">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700">
        ← Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Community Reports</h2>
          <p className="text-gray-500 dark:text-gray-400">Welcome, {userName}. Report issues and track progress.</p>
        </div>

        {/* Create Report Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Submit New Report</DialogTitle>
              <DialogDescription>Report an issue or observation to help improve your community</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateReport} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input id="title" placeholder="Brief, descriptive title" value={newReport.title} onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide details" rows={4} value={newReport.description} onChange={(e) => setNewReport({ ...newReport, description: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Report Type</Label>
                  <Select value={newReport.type} onValueChange={(value) => setNewReport({ ...newReport, type: value })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Complaint">Complaint</SelectItem>
                      <SelectItem value="Observation">Observation</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure Issue</SelectItem>
                      <SelectItem value="Safety">Safety Concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newReport.category} onValueChange={(value) => setNewReport({ ...newReport, category: value })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Road Maintenance">Road Maintenance</SelectItem>
                      <SelectItem value="Street Maintenance">Street Maintenance</SelectItem>
                      <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                      <SelectItem value="Noise">Noise</SelectItem>
                      <SelectItem value="Sanitation">Sanitation</SelectItem>
                      <SelectItem value="Public Safety">Public Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Street address or description" value={newReport.location} onChange={(e) => setNewReport({ ...newReport, location: e.target.value })} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white">Submit Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Cards */}
      <div className="space-y-4 mt-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-civix-dark-brown dark:text-white">{report.title}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Badge variant="outline">{report.type}</Badge>
                    <Badge variant="secondary">{report.category}</Badge>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{report.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{report.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-civix-warm-beige dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center"><ThumbsUp className="w-4 h-4 mr-1" />{report.upvotes} upvotes</span>
                  <span>By {report.submittedBy}</span>
                  {report.attachments > 0 && <span className="flex items-center"><Camera className="w-4 h-4 mr-1" />{report.attachments} attachment</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-civix-civic-green text-civix-civic-green hover:bg-civix-civic-green hover:text-white">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Upvote
                  </Button>
                  <Button size="sm" className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white" onClick={() => handleViewReport(report)}>
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-civix-warm-beige dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-civix-civic-green text-white">
                  {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-civix-dark-brown dark:text-civix-sandal">{userName}</p>
                <p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">Civic Member</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-civix-dark-brown dark:text-white mb-2">
              Community Engagement Overview
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Track and analyze civic participation metrics.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">Loading reports...</div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <ReportsFilter onChange={handleFilterChange} />
              <ReportDashboard 
                reports={filteredReports}
                onViewDetails={(reportId: string) => {
                  const report = filteredReports.find(r => r.id === reportId);
                  if (report) handleViewReport(report);
                }}
                onNavigate={onNavigate}
              />
              {viewMode === 'detail' && selectedReport ? (
                <ReportDetailView report={selectedReport} />
              ) : (
                <ReportListView />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;
