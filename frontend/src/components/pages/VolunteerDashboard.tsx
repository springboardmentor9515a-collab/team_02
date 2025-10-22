import { useState, useEffect } from "react";
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
  RefreshCw,
  Loader2
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";
import { complaintsAPI } from "@/lib/api";
import { Complaint } from "@/types";

interface VolunteerDashboardProps {
  onNavigate: (page: 'dashboard') => void;
  userName: string;
}

export default function VolunteerDashboard({ onNavigate, userName }: VolunteerDashboardProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Real data from API
  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);

  // Load assigned complaints on component mount
  useEffect(() => {
    loadAssignedComplaints();
  }, []);

  const loadAssignedComplaints = async () => {
    try {
      setLoading(true);
      const complaintsData = await complaintsAPI.getVolunteerComplaints();
      setAssignedComplaints(complaintsData);
    } catch (error: any) {
      console.error('Error loading assigned complaints:', error);
      toast.error('Failed to load assigned complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      await complaintsAPI.updateComplaintStatus(selectedComplaint._id, { status: newStatus as 'in_review' | 'resolved' });
      toast.success('Status updated successfully!');
      setUpdateDialogOpen(false);
      setSelectedComplaint(null);
      setNewStatus('');
      loadAssignedComplaints(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />Received</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400"><AlertCircle className="w-3 h-3 mr-1" />In Review</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-600 dark:text-gray-400"><Clock className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
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
                Volunteer Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={loadAssignedComplaints}
                disabled={loading}
                className="border-civix-warm-beige dark:border-gray-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Assigned to Me</p>
                  <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>{assignedComplaints.length}</p>
                </div>
                <div className="bg-civix-civic-green/10 dark:bg-civix-civic-green/20 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-civix-civic-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">In Progress</p>
                  <p className="text-3xl text-orange-600" style={{ fontWeight: '700' }}>
                    {assignedComplaints.filter(c => c.status === 'in_review').length}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Completed</p>
                  <p className="text-3xl text-green-600" style={{ fontWeight: '700' }}>
                    {assignedComplaints.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Complaints */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-civix-dark-brown dark:text-civix-sandal">My Assigned Complaints</CardTitle>
            <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              View and update the status of complaints assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-civix-civic-green" />
                <span className="ml-2 text-civix-dark-brown dark:text-civix-sandal">Loading assigned complaints...</span>
              </div>
            ) : assignedComplaints.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-civix-dark-brown/30 dark:text-civix-sandal/30" />
                <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
                  No Assigned Complaints
                </h3>
                <p className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                  You don't have any complaints assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedComplaints.map((complaint) => (
                  <Card key={complaint._id} className="bg-civix-warm-beige/30 dark:bg-gray-700/30 border-0">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Photo */}
                        {complaint.photo_url && (
                          <div className="md:w-48 h-48 rounded-lg overflow-hidden bg-civix-warm-beige dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={complaint.photo_url}
                              alt={complaint.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
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

                          <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80 mb-4">
                            {complaint.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {complaint.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Assigned: {new Date(complaint.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDetailsComplaint(complaint);
                                setViewDetailsDialogOpen(true);
                              }}
                              className="border-civix-civic-green text-civix-civic-green hover:bg-civix-civic-green hover:text-white"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            {complaint.status !== 'resolved' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setUpdateDialogOpen(true);
                                }}
                                className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Update Status
                              </Button>
                            )}
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

        {/* Update Status Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Update Complaint Status</DialogTitle>
              <DialogDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                Update the status of this complaint.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-civix-dark-brown dark:text-civix-sandal">Complaint</label>
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mt-1">
                  {selectedComplaint?.title}
                </p>
              </div>
              <div>
                <label className="text-civix-dark-brown dark:text-civix-sandal">Current Status</label>
                <div className="mt-1">
                  {selectedComplaint && getStatusBadge(selectedComplaint.status)}
                </div>
              </div>
              <div>
                <label className="text-civix-dark-brown dark:text-civix-sandal">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-2 border-civix-warm-beige dark:border-gray-600">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                onClick={handleStatusUpdate}
                disabled={updating}
                className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
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
                <div>
                  <h3 className="text-lg font-semibold text-civix-dark-brown dark:text-civix-sandal mb-2">
                    {detailsComplaint.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal">
                      {detailsComplaint.category}
                    </Badge>
                    {getStatusBadge(detailsComplaint.status)}
                  </div>
                </div>
                
                <div>
                  <label className="text-civix-dark-brown dark:text-civix-sandal">Description</label>
                  <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80 mt-1">
                    {detailsComplaint.description}
                  </p>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                  <span className="text-civix-dark-brown dark:text-civix-sandal">{detailsComplaint.location}</span>
                </div>

                {detailsComplaint.photo_url && (
                  <div>
                    <label className="text-civix-dark-brown dark:text-civix-sandal">Photo</label>
                    <div className="mt-2">
                      <img
                        src={detailsComplaint.photo_url}
                        alt={detailsComplaint.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                  <span className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                    Assigned: {new Date(detailsComplaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setViewDetailsDialogOpen(false)}
                className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}