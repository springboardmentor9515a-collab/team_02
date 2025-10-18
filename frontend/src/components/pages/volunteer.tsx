import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Eye,
  RefreshCw
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner@2.0.3";

interface VolunteerDashboardProps {
  onNavigate: (page: 'dashboard') => void;
  userName: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  status: 'assigned' | 'in-review' | 'resolved';
  submittedBy: string;
  assignedAt: string;
  createdAt: string;
}

export default function VolunteerDashboard({ onNavigate, userName }: VolunteerDashboardProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(null);

  // Mock data for assigned complaints
  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([
    {
      id: '1',
      title: 'Broken Street Light on Main Street',
      description: 'The street light at the corner of Main Street and 5th Avenue has been non-functional for over a week, creating safety concerns for pedestrians.',
      category: 'Infrastructure',
      location: 'Main Street & 5th Avenue',
      latitude: 40.7128,
      longitude: -74.0060,
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      status: 'assigned',
      submittedBy: 'Jane Doe',
      assignedAt: '2025-10-06',
      createdAt: '2025-10-05'
    },
    {
      id: '6',
      title: 'Damaged Playground Equipment',
      description: 'Swing set at Riverside Park has broken chains - safety hazard for children.',
      category: 'Parks & Recreation',
      location: 'Riverside Park',
      latitude: 40.7489,
      longitude: -73.9680,
      photoUrl: 'https://images.unsplash.com/photo-1594737625785-8a0f0bafc9f4?w=400',
      status: 'in-review',
      submittedBy: 'Laura Martinez',
      assignedAt: '2025-10-07',
      createdAt: '2025-10-06'
    },
    {
      id: '7',
      title: 'Water Leak on 2nd Avenue',
      description: 'A water main appears to be leaking, causing flooding on the sidewalk.',
      category: 'Infrastructure',
      location: '2nd Avenue & Maple Street',
      status: 'assigned',
      submittedBy: 'Tom Wilson',
      assignedAt: '2025-10-08',
      createdAt: '2025-10-08'
    },
    {
      id: '8',
      title: 'Fallen Tree Blocking Road',
      description: 'Large tree fell during storm, partially blocking Pine Road.',
      category: 'Public Safety',
      location: 'Pine Road',
      photoUrl: 'https://images.unsplash.com/photo-1517329782449-810562a4ec2f?w=400',
      status: 'resolved',
      submittedBy: 'Maria Garcia',
      assignedAt: '2025-10-04',
      createdAt: '2025-10-03'
    }
  ]);

  const handleUpdateStatus = () => {
    if (!selectedComplaint || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    setAssignedComplaints(assignedComplaints.map(c => 
      c.id === selectedComplaint.id 
        ? { ...c, status: newStatus as 'assigned' | 'in-review' | 'resolved' }
        : c
    ));

    toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
    setUpdateDialogOpen(false);
    setSelectedComplaint(null);
    setNewStatus('');
  };

  const openUpdateDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setUpdateDialogOpen(true);
  };

  const openViewDetails = (complaint: Complaint) => {
    setDetailsComplaint(complaint);
    setViewDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400"><AlertCircle className="w-3 h-3 mr-1" />Assigned</Badge>;
      case 'in-review':
        return <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400"><FileText className="w-3 h-3 mr-1" />In Review</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-civix-civic-green text-civix-civic-green"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
    }
  };

  // Stats
  const stats = {
    total: assignedComplaints.length,
    assigned: assignedComplaints.filter(c => c.status === 'assigned').length,
    inReview: assignedComplaints.filter(c => c.status === 'in-review').length,
    resolved: assignedComplaints.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-civix-sandal to-civix-warm-beige dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-civix-warm-beige dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-2xl text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '700' }}>
                Volunteer Dashboard - My Assignments
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl mb-2" style={{ fontWeight: '700' }}>Welcome, {userName}!</h2>
            <p className="text-white/90">Thank you for volunteering to help resolve community complaints.</p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Total Assigned</p>
                <p className="text-3xl text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '700' }}>{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Pending Review</p>
                <p className="text-3xl text-blue-600 dark:text-blue-400" style={{ fontWeight: '700' }}>{stats.assigned}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">In Progress</p>
                <p className="text-3xl text-orange-600 dark:text-orange-400" style={{ fontWeight: '700' }}>{stats.inReview}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Completed</p>
                <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>{stats.resolved}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Complaints */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-civix-dark-brown dark:text-civix-sandal">
              Assigned Complaints ({assignedComplaints.length})
            </CardTitle>
            <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              Review and update the status of complaints assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedComplaints.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-civix-dark-brown/30 dark:text-civix-sandal/30" />
                <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
                  No Assignments Yet
                </h3>
                <p className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                  You don't have any complaints assigned to you at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignedComplaints.map((complaint) => (
                  <Card key={complaint.id} className="bg-civix-warm-beige/50 dark:bg-gray-700/50 border border-civix-warm-beige dark:border-gray-600">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Photo */}
                        {complaint.photoUrl && (
                          <div className="md:w-48 h-48 rounded-lg overflow-hidden bg-civix-warm-beige dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={complaint.photoUrl}
                              alt={complaint.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2 break-words" style={{ fontWeight: '600' }}>
                                {complaint.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal">
                                  {complaint.category}
                                </Badge>
                                {getStatusBadge(complaint.status)}
                              </div>
                            </div>
                          </div>

                          <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80 mb-4 break-words">
                            {complaint.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-4">
                            <div className="flex items-center min-w-0">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{complaint.location}</span>
                            </div>
                            {complaint.latitude && complaint.longitude && (
                              <div className="text-xs whitespace-nowrap">
                                Lat: {complaint.latitude.toFixed(4)}, Long: {complaint.longitude.toFixed(4)}
                              </div>
                            )}
                            <div className="flex items-center whitespace-nowrap">
                              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                              Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                            </div>
                            <div className="truncate">
                              By: {complaint.submittedBy}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openViewDetails(complaint)}
                              className="border-civix-civic-green text-civix-civic-green hover:bg-civix-civic-green hover:text-white"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openUpdateDialog(complaint)}
                              className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Update Status
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Update Status</DialogTitle>
            <DialogDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              Change the status of this complaint
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-civix-warm-beige dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-civix-dark-brown dark:text-civix-sandal mb-2 break-words" style={{ fontWeight: '600' }}>
                  {selectedComplaint.title}
                </h4>
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 break-words">
                  {selectedComplaint.location}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-civix-dark-brown dark:text-civix-sandal">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="border-civix-warm-beige dark:border-gray-600">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned (Not Started)</SelectItem>
                    <SelectItem value="in-review">In Review (Working On It)</SelectItem>
                    <SelectItem value="resolved">Resolved (Completed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUpdateDialogOpen(false);
                setSelectedComplaint(null);
                setNewStatus('');
              }}
              className="border-civix-warm-beige dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Complaint Details</DialogTitle>
          </DialogHeader>
          
          {detailsComplaint && (
            <div className="space-y-4">
              {detailsComplaint.photoUrl && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={detailsComplaint.photoUrl}
                    alt={detailsComplaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2 break-words" style={{ fontWeight: '600' }}>
                  {detailsComplaint.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal">
                    {detailsComplaint.category}
                  </Badge>
                  {getStatusBadge(detailsComplaint.status)}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Description</h4>
                <p className="text-civix-dark-brown dark:text-civix-sandal break-words">
                  {detailsComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Location</h4>
                  <p className="text-civix-dark-brown dark:text-civix-sandal flex items-center break-words">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="break-words">{detailsComplaint.location}</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Submitted By</h4>
                  <p className="text-civix-dark-brown dark:text-civix-sandal break-words">
                    {detailsComplaint.submittedBy}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Date Submitted</h4>
                  <p className="text-civix-dark-brown dark:text-civix-sandal flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(detailsComplaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Assigned Date</h4>
                  <p className="text-civix-dark-brown dark:text-civix-sandal flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(detailsComplaint.assignedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {detailsComplaint.latitude && detailsComplaint.longitude && (
                <div>
                  <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Coordinates</h4>
                  <p className="text-civix-dark-brown dark:text-civix-sandal text-sm">
                    Lat: {detailsComplaint.latitude.toFixed(4)}, Long: {detailsComplaint.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setViewDetailsDialogOpen(false)}
              className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
