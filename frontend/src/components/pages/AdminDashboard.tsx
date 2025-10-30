import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Filter,
  Search,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Eye,
  Loader2
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";
import { complaintsAPI } from "@/lib/api";
import { Complaint } from "@/types";

interface AdminDashboardProps {
  onNavigate: (page: 'dashboard') => void;
  userName: string;
}

interface Volunteer {
  id: string;
  name: string;
  assignedCount: number;
}

export default function AdminDashboard({ onNavigate, userName }: AdminDashboardProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // Real data from API
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Load complaints on component mount
  useEffect(() => {
    loadComplaints();
    loadVolunteers();
  }, []);

  // reload complaints when filters change
  useEffect(() => {
    loadComplaints();
  }, [filterCategory, filterStatus]);

  // debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchLocation), 300);
    return () => clearTimeout(t);
  }, [searchLocation]);

  const loadVolunteers = async () => {
    try {
      const res = await complaintsAPI.getVolunteers();
      if (res?.volunteers) {
        setVolunteers(res.volunteers.map((v: any) => ({ id: v.id, name: v.name || v.email || v.id, assignedCount: v.assignedCount})));
      }
    } catch (err: any) {
      console.error('Error loading volunteers:', err);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterCategory && filterCategory !== 'all') filters.category = filterCategory;
      if (filterStatus && filterStatus !== 'all') filters.status = filterStatus;
      const complaintsData = await complaintsAPI.getAllComplaints(filters);
      setComplaints(complaintsData);
    } catch (error: any) {
      console.error('Error loading complaints:', error);
      toast.error('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
    
  };

  const handleAssignComplaint = async () => {
    if (!selectedComplaint || !selectedVolunteer) {
      toast.error('Please select a volunteer');
      return;
    }

    try {
      setAssigning(true);
      await complaintsAPI.assignComplaint(selectedComplaint._id, { volunteerId: selectedVolunteer });
      toast.success('Complaint assigned successfully!');
      setAssignDialogOpen(false);
      setSelectedComplaint(null);
      setSelectedVolunteer('');
      loadComplaints(); // Refresh the list
    } catch (error: any) {
      console.error('Error assigning complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to assign complaint. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch = complaint.location.toLowerCase().includes(q) ||
                         complaint.title.toLowerCase().includes(q);
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
                Admin Dashboard
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Total Complaints</p>
                  <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>{complaints.length}</p>
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
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Pending</p>
                  <p className="text-3xl text-yellow-600" style={{ fontWeight: '700' }}>
                    {complaints.filter(c => c.status === 'received').length}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">In Review</p>
                  <p className="text-3xl text-orange-600" style={{ fontWeight: '700' }}>
                    {complaints.filter(c => c.status === 'in_review').length}
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
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Resolved</p>
                  <p className="text-3xl text-green-600" style={{ fontWeight: '700' }}>
                    {complaints.filter(c => c.status === 'resolved').length}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-civix-dark-brown/50 dark:text-civix-sandal/50 w-4 h-4" />
                  <Input
                    placeholder="Search by location or title..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10 border-civix-warm-beige dark:border-gray-600"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 border-civix-warm-beige dark:border-gray-600">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Roads">Roads</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Vandalism">Vandalism</SelectItem>
                  <SelectItem value="Sanitation">Sanitation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48 border-civix-warm-beige dark:border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-civix-dark-brown dark:text-civix-sandal">All Complaints</CardTitle>
            <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              Manage and assign complaints to volunteers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-civix-civic-green" />
                <span className="ml-2 text-civix-dark-brown dark:text-civix-sandal">Loading complaints...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell className="font-medium">{complaint.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal">
                          {complaint.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                          {complaint.location}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>
                        {complaint.assigned_to ? (
                          <Badge className="bg-civix-civic-green text-white">
                            {typeof complaint.assigned_to === 'string'
                              ? complaint.assigned_to
                              : complaint.assigned_to.name || 'Volunteer'}
                          </Badge>
                        ) : (
                          <span className="text-civix-dark-brown/50 dark:text-civix-sandal/50">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                            View
                          </Button>
                          {!complaint.assigned_to && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setAssignDialogOpen(true);
                              }}
                              className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Assign Complaint</DialogTitle>
              <DialogDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                Select a volunteer to assign this complaint to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-civix-dark-brown dark:text-civix-sandal">Complaint</Label>
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mt-1">
                  {selectedComplaint?.title}
                </p>
              </div>
              <div>
                <Label className="text-civix-dark-brown dark:text-civix-sandal">Select Volunteer</Label>
                <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
                  <SelectTrigger className="mt-2 border-civix-warm-beige dark:border-gray-600">
                    <SelectValue placeholder="Choose a volunteer" />
                  </SelectTrigger>
                  <SelectContent>
                    {volunteers.map((volunteer) => (
                      <SelectItem key={volunteer.id} value={volunteer.id}>
                        {volunteer.name} ({volunteer.assignedCount} assigned)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAssignDialogOpen(false);
                  setSelectedComplaint(null);
                  setSelectedVolunteer('');
                }}
                className="border-civix-warm-beige dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignComplaint}
                disabled={assigning}
                className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Complaint'
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
                  <Label className="text-civix-dark-brown dark:text-civix-sandal">Description</Label>
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
                    <Label className="text-civix-dark-brown dark:text-civix-sandal">Photo</Label>
                    <div className="mt-2">
                      <img
                        src={detailsComplaint.photo_url}
                        alt={detailsComplaint.title}
                        loading="lazy"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                  <span className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                    Submitted: {new Date(detailsComplaint.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {detailsComplaint.assigned_to && (
                  <div>
                    <Label className="text-civix-dark-brown dark:text-civix-sandal">Assigned To</Label>
                    <Badge className="bg-civix-civic-green text-white mt-1">
                      {typeof detailsComplaint.assigned_to === 'string'
                        ? detailsComplaint.assigned_to
                        : detailsComplaint.assigned_to.name || 'Volunteer'}
                    </Badge>
                  </div>
                )}
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