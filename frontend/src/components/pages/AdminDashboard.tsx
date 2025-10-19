import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  Eye
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";

interface AdminDashboardProps {
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
  status: 'pending' | 'assigned' | 'in-review' | 'resolved';
  assignedTo?: string;
  submittedBy: string;
  createdAt: string;
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
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(null);

  // Mock data for all complaints
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      title: 'Broken Street Light on Main Street',
      description: 'The street light at the corner of Main Street and 5th Avenue has been non-functional for over a week.',
      category: 'Infrastructure',
      location: 'Main Street & 5th Avenue',
      latitude: 40.7128,
      longitude: -74.0060,
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      status: 'assigned',
      assignedTo: 'John Smith',
      submittedBy: 'Jane Doe',
      createdAt: '2025-10-05'
    },
    {
      id: '2',
      title: 'Potholes on Highway 101',
      description: 'Multiple large potholes near exit 12 causing damage to vehicles.',
      category: 'Roads',
      location: 'Highway 101, Exit 12',
      latitude: 40.7580,
      longitude: -73.9855,
      photoUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400',
      status: 'in-review',
      assignedTo: 'Sarah Johnson',
      submittedBy: 'Mike Chen',
      createdAt: '2025-10-03'
    },
    {
      id: '3',
      title: 'Illegal Dumping at Park Entrance',
      description: 'Construction debris dumped at Central Park entrance.',
      category: 'Environment',
      location: 'Central Park, North Entrance',
      latitude: 40.7812,
      longitude: -73.9665,
      status: 'pending',
      submittedBy: 'Alice Williams',
      createdAt: '2025-10-07'
    },
    {
      id: '4',
      title: 'Graffiti on Public Building',
      description: 'Offensive graffiti on community center walls.',
      category: 'Vandalism',
      location: 'Community Center, Oak Street',
      latitude: 40.7489,
      longitude: -73.9680,
      photoUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400',
      status: 'resolved',
      assignedTo: 'Mike Chen',
      submittedBy: 'Robert Brown',
      createdAt: '2025-09-28'
    },
    {
      id: '5',
      title: 'Overflowing Garbage Bins',
      description: 'Public bins on Elm Street have been overflowing for days.',
      category: 'Sanitation',
      location: 'Elm Street',
      status: 'pending',
      submittedBy: 'Emily Davis',
      createdAt: '2025-10-08'
    },
    {
      id: '6',
      title: 'Damaged Playground Equipment',
      description: 'Swing set at Riverside Park has broken chains - safety hazard.',
      category: 'Parks & Recreation',
      location: 'Riverside Park',
      photoUrl: 'https://images.unsplash.com/photo-1594737625785-8a0f0bafc9f4?w=400',
      status: 'assigned',
      assignedTo: 'John Smith',
      submittedBy: 'Laura Martinez',
      createdAt: '2025-10-06'
    }
  ]);

  // Mock volunteers data
  const volunteers: Volunteer[] = [
    { id: '1', name: 'John Smith', assignedCount: 2 },
    { id: '2', name: 'Sarah Johnson', assignedCount: 1 },
    { id: '3', name: 'Mike Chen', assignedCount: 1 },
    { id: '4', name: 'Emily Rodriguez', assignedCount: 0 },
    { id: '5', name: 'David Lee', assignedCount: 0 }
  ];

  const categories = ['Infrastructure', 'Roads', 'Environment', 'Vandalism', 'Public Safety', 'Sanitation', 'Parks & Recreation', 'Other'];

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const categoryMatch = filterCategory === 'all' || complaint.category === filterCategory;
    const statusMatch = filterStatus === 'all' || complaint.status === filterStatus;
    const locationMatch = !searchLocation || complaint.location.toLowerCase().includes(searchLocation.toLowerCase());
    return categoryMatch && statusMatch && locationMatch;
  });

  const handleAssignVolunteer = () => {
    if (!selectedComplaint || !selectedVolunteer) {
      toast.error('Please select a volunteer');
      return;
    }

    const volunteer = volunteers.find(v => v.id === selectedVolunteer);
    if (!volunteer) return;

    setComplaints(complaints.map(c => 
      c.id === selectedComplaint.id 
        ? { ...c, status: 'assigned', assignedTo: volunteer.name }
        : c
    ));

    toast.success(`Complaint assigned to ${volunteer.name}`);
    setAssignDialogOpen(false);
    setSelectedComplaint(null);
    setSelectedVolunteer('');
  };

  const openAssignDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAssignDialogOpen(true);
  };

  const openViewDetails = (complaint: Complaint) => {
    setDetailsComplaint(complaint);
    setViewDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
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
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    inReview: complaints.filter(c => c.status === 'in-review').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
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
                Admin Dashboard - Complaints Management
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Total</p>
                <p className="text-3xl text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '700' }}>{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Pending</p>
                <p className="text-3xl text-yellow-600 dark:text-yellow-400" style={{ fontWeight: '700' }}>{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Assigned</p>
                <p className="text-3xl text-blue-600 dark:text-blue-400" style={{ fontWeight: '700' }}>{stats.assigned}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">In Review</p>
                <p className="text-3xl text-orange-600 dark:text-orange-400" style={{ fontWeight: '700' }}>{stats.inReview}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Resolved</p>
                <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>{stats.resolved}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-civix-dark-brown dark:text-civix-sandal flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-civix-dark-brown dark:text-civix-sandal">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="border-civix-warm-beige dark:border-gray-600">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-civix-dark-brown dark:text-civix-sandal">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-civix-warm-beige dark:border-gray-600">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-civix-dark-brown dark:text-civix-sandal">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                  <Input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Search by location..."
                    className="pl-10 border-civix-warm-beige dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-civix-dark-brown dark:text-civix-sandal">
              All Complaints ({filteredComplaints.length})
            </CardTitle>
            <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              Manage and assign complaints to volunteers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-civix-warm-beige dark:border-gray-700">
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-16">ID</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal min-w-[200px]">Title</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-32">Category</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal min-w-[150px]">Location</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-32">Status</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-32">Assigned To</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-32">Submitted By</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-32">Date</TableHead>
                    <TableHead className="text-civix-dark-brown dark:text-civix-sandal w-48">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id} className="border-civix-warm-beige dark:border-gray-700">
                      <TableCell className="text-civix-dark-brown dark:text-civix-sandal whitespace-nowrap">#{complaint.id}</TableCell>
                      <TableCell className="text-civix-dark-brown dark:text-civix-sandal">
                        <div className="truncate" title={complaint.title}>
                          {complaint.title}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal text-xs">
                          {complaint.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-civix-dark-brown dark:text-civix-sandal text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate" title={complaint.location}>{complaint.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell className="text-civix-dark-brown dark:text-civix-sandal">
                        <div className="truncate" title={complaint.assignedTo}>
                          {complaint.assignedTo || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-civix-dark-brown dark:text-civix-sandal">
                        <div className="truncate" title={complaint.submittedBy}>
                          {complaint.submittedBy}
                        </div>
                      </TableCell>
                      <TableCell className="text-civix-dark-brown dark:text-civix-sandal text-sm whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDetails(complaint)}
                            className="border-civix-civic-green text-civix-civic-green hover:bg-civix-civic-green hover:text-white text-xs px-2"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openAssignDialog(complaint)}
                            className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white text-xs px-2"
                            disabled={complaint.status === 'resolved'}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign Volunteer Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Assign Volunteer</DialogTitle>
            <DialogDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              Select a volunteer to assign to this complaint
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
                <label className="text-sm text-civix-dark-brown dark:text-civix-sandal">Select Volunteer</label>
                <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
                  <SelectTrigger className="border-civix-warm-beige dark:border-gray-600">
                    <SelectValue placeholder="Choose a volunteer..." />
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
          )}

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
              onClick={handleAssignVolunteer}
              className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white"
            >
              Assign Volunteer
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
                {detailsComplaint.assignedTo && (
                  <div>
                    <h4 className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Assigned To</h4>
                    <Badge className="bg-civix-civic-green text-white">
                      {detailsComplaint.assignedTo}
                    </Badge>
                  </div>
                )}
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
