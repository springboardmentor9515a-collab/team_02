import React, { useState, useEffect } from "react";
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
  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || '';

  // Petition details dialog state (admin)
  const [petitionDetailsDialogOpen, setPetitionDetailsDialogOpen] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState<any>(null);
  const [adminComment, setAdminComment] = useState("");
  const [adminCommentLoading, setAdminCommentLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [petitionComments, setPetitionComments] = useState<any[]>([]);

  // Load comments when dialog opens
  useEffect(() => {
    if (petitionDetailsDialogOpen && selectedPetition) {
      setPetitionComments(selectedPetition.comments || []);
    }
  }, [petitionDetailsDialogOpen, selectedPetition]);

  const handleAdminComment = async () => {
    if (!adminComment.trim() || !selectedPetition) return;
    setAdminCommentLoading(true);
    try {
      const { commentPetition } = await import("@/lib/api").then(mod => mod.petitionsAPI);
      const res = await commentPetition(selectedPetition._id, adminComment);
      setPetitionComments(res.comments || []);
      setAdminComment("");
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setAdminCommentLoading(false);
    }
  };

  const handleResolvePetition = async () => {
    if (!selectedPetition) return;
    setResolving(true);
    try {
      const { resolvePetition } = await import("@/lib/api").then(mod => mod.petitionsAPI);
      await resolvePetition(selectedPetition._id, adminComment);
      toast.success("Petition resolved");
      setPetitionDetailsDialogOpen(false);
      // Refresh petitions list
      const { getAllPetitions } = await import("@/lib/api").then(mod => mod.petitionsAPI);
      const data = await getAllPetitions();
      setPetitions(Array.isArray(data) ? data : (data.petitions || []));
    } catch (err) {
      toast.error("Failed to resolve petition");
    } finally {
      setResolving(false);
    }
  };

  // Handle voting on a poll
  const handleVotePoll = async (pollId: string) => {
    try {
      // For demo: always vote for first option
      const poll = polls.find(p => p._id === pollId);
      if (!poll) return;
      const optionIndex = 0;
      const { vote } = await import("@/lib/api").then(mod => mod.pollsAPI);
      await vote(pollId, optionIndex.toString());
      toast.success('Vote submitted!');
    } catch (err) {
      toast.error('Failed to vote');
    }
  };

  // Handle signing a petition
  const handleSignPetition = async (petitionId: string) => {
    try {
      const { signPetition } = await import("@/lib/api").then(mod => mod.petitionsAPI);
      await signPetition(petitionId);
      toast.success('Petition signed!');
    } catch (err) {
      toast.error('Failed to sign petition');
    }
  };
  // Dialog state for create poll/petition
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [createPetitionOpen, setCreatePetitionOpen] = useState(false);
  // ...existing code...
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
  const [polls, setPolls] = useState<any[]>([]);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'complaints' | 'polls' | 'petitions'>('complaints');

  // Real data from API
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Load polls and petitions on mount and when search changes
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        // @ts-ignore
        const { getAllPolls } = await import("@/lib/api").then(mod => mod.pollsAPI);
        const filters = debouncedSearch ? { target_location: debouncedSearch } : {};
        const data = await getAllPolls(filters);
        setPolls(Array.isArray(data) ? data : (data.polls || []));
      } catch (err) {
        console.error("Error loading polls:", err);
      }
    };
    fetchPolls();
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        // @ts-ignore
        const { getAllPetitions } = await import("@/lib/api").then(mod => mod.petitionsAPI);
        const filters = debouncedSearch ? { location: debouncedSearch } : {};
        const data = await getAllPetitions(filters);
        setPetitions(Array.isArray(data) ? data : (data.petitions || []));
      } catch (err) {
        console.error("Error loading petitions:", err);
      }
    };
    fetchPetitions();
  }, [debouncedSearch]);

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
        {/* Tabs above all content */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <Button
                variant={activeTab === 'complaints' ? 'default' : 'outline'}
                onClick={() => setActiveTab('complaints')}
                className="flex-1"
              >
                Complaints
              </Button>
              <Button
                variant={activeTab === 'polls' ? 'default' : 'outline'}
                onClick={() => setActiveTab('polls')}
                className="flex-1"
              >
                Polls
              </Button>
              <Button
                variant={activeTab === 'petitions' ? 'default' : 'outline'}
                onClick={() => setActiveTab('petitions')}
                className="flex-1"
              >
                Petitions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards for active tab */}
        {activeTab === 'complaints' && (
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
        )}
        {activeTab === 'polls' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Total Polls</p>
                    <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>{polls.length}</p>
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
                      {polls.filter(p => p.status === 'received' || p.status === 'pending').length}
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
                    <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Active</p>
                    <p className="text-3xl text-orange-600" style={{ fontWeight: '700' }}>
                      {polls.filter(p => p.status === 'active' || p.status === 'in_review').length}
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
                      {polls.filter(p => p.status === 'completed' || p.status === 'resolved').length}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'petitions' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Total Petitions</p>
                    <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>{petitions.length}</p>
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
                      {petitions.filter(p => p.status === 'received' || p.status === 'pending').length}
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
                    <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Active</p>
                    <p className="text-3xl text-orange-600" style={{ fontWeight: '700' }}>
                      {petitions.filter(p => p.status === 'active' || p.status === 'in_review').length}
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
                      {petitions.filter(p => p.status === 'completed' || p.status === 'resolved').length}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and search for each tab */}
        {activeTab === 'complaints' && (
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
        )}
        {activeTab === 'polls' && (
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
                {/* You can add more filters for polls if needed */}
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'petitions' && (
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
                {/* You can add more filters for petitions if needed */}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complaints Table */}
        {activeTab === 'complaints' && (
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
        )}

        {/* Polls Table and Create Poll Button */}
        {activeTab === 'polls' && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-civix-dark-brown dark:text-civix-sandal">All Polls</CardTitle>
                  <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                    View all submitted polls
                  </CardDescription>
                </div>
                <Button onClick={() => setCreatePollOpen(true)} className="bg-civix-civic-green text-white">Create Poll</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polls.map((poll) => (
                    <TableRow key={poll._id}>
                      <TableCell>{poll.title}</TableCell>
                      <TableCell>{poll.category}</TableCell>
                      <TableCell>{poll.target_location}</TableCell>
                      <TableCell>{poll.duration} hr</TableCell>
                      <TableCell>{poll.status || 'active'}</TableCell>
                      <TableCell>{poll.createdAt ? new Date(poll.createdAt).toLocaleDateString() : ''}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Details</Button>
                        {userRole === 'citizen' && (
                          <Button size="sm" className="ml-2" onClick={() => handleVotePoll(poll._id)}>
                            Vote
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Petitions Table and Create Petition Button */}
        {activeTab === 'petitions' && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-civix-dark-brown dark:text-civix-sandal">All Petitions</CardTitle>
                  <CardDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                    View all submitted petitions
                  </CardDescription>
                </div>
                <Button onClick={() => setCreatePetitionOpen(true)} className="bg-civix-civic-green text-white">Create Petition</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {petitions.map((petition) => (
                    <TableRow key={petition._id}>
                      <TableCell>{petition.title}</TableCell>
                      <TableCell>{petition.category}</TableCell>
                      <TableCell>{petition.location}</TableCell>
                      <TableCell>{petition.status}</TableCell>
                      <TableCell>{petition.createdAt ? new Date(petition.createdAt).toLocaleDateString() : ''}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedPetition(petition);
                          setPetitionDetailsDialogOpen(true);
                        }}>View Details</Button>
                        {userRole === 'citizen' && (
                          <Button size="sm" className="ml-2" onClick={() => handleSignPetition(petition._id)}>
                            Sign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
        {/* Petition Details Dialog (Admin) */}
        <Dialog open={petitionDetailsDialogOpen} onOpenChange={setPetitionDetailsDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Petition Details</DialogTitle>
            </DialogHeader>
            {selectedPetition && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-civix-dark-brown dark:text-civix-sandal mb-2">
                    {selectedPetition.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal">
                      {selectedPetition.category}
                    </Badge>
                    <span className="ml-2">Status: {selectedPetition.status}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-civix-dark-brown dark:text-civix-sandal">Description</Label>
                  <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80 mt-1">
                    {selectedPetition.description}
                  </p>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                  <span className="text-civix-dark-brown dark:text-civix-sandal">{selectedPetition.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-civix-dark-brown/50 dark:text-civix-sandal/50" />
                  <span className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
                    Submitted: {selectedPetition.createdAt ? new Date(selectedPetition.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {/* Comments Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-2">Comments</h4>
                  <div className="space-y-2 mb-4">
                    {petitionComments.length === 0 && <div className="text-gray-500">No comments yet.</div>}
                    {petitionComments.map((c, idx) => (
                      <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                        <span className="font-semibold">{c.by?.name || c.by || 'User'}:</span> {c.text}
                        <span className="ml-2 text-xs text-gray-400">{c.at ? new Date(c.at).toLocaleString() : ''}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={adminComment}
                      onChange={e => setAdminComment(e.target.value)}
                      disabled={adminCommentLoading || resolving}
                    />
                    <Button onClick={handleAdminComment} disabled={adminCommentLoading || !adminComment.trim()}>
                      {adminCommentLoading ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setPetitionDetailsDialogOpen(false)}
                className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={handleResolvePetition}
                disabled={resolving || !selectedPetition}
                className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white"
              >
                {resolving ? 'Resolving...' : 'Resolve Petition'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        {/* Create Poll Dialog */}
        <Dialog open={createPollOpen} onOpenChange={setCreatePollOpen}>
          <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Create Poll</DialogTitle>
            </DialogHeader>
            {/* Dynamically import CreatePollForm to avoid circular imports */}
            {createPollOpen && (
              <React.Suspense fallback={<div>Loading...</div>}>
                {React.createElement(
                  React.lazy(() => import("./PollComponents").then(mod => ({ default: mod.CreatePollForm }))),
                  {
                    onClose: () => setCreatePollOpen(false),
                    onPollCreated: async () => {
                      // Reload polls after creation
                      try {
                        // @ts-ignore
                        const { getPolls } = await import("@/lib/api").then(mod => mod.pollsAPI);
                        const data = await getPolls();
                        setPolls(Array.isArray(data) ? data : (data.polls || []));
                      } catch (err) {
                        toast.error("Failed to reload polls");
                      }
                    }
                  }
                )}
              </React.Suspense>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Petition Dialog */}
        <Dialog open={createPetitionOpen} onOpenChange={setCreatePetitionOpen}>
          <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-civix-dark-brown dark:text-civix-sandal">Create Petition</DialogTitle>
            </DialogHeader>
            {createPetitionOpen && (
              <React.Suspense fallback={<div>Loading...</div>}>
                {React.createElement(
                  React.lazy(() => import("./PetitionComponents").then(mod => ({ default: mod.CreatePetitionForm }))),
                  {
                    onClose: () => setCreatePetitionOpen(false),
                    onPetitionCreated: async () => {
                      // Reload petitions after creation
                      try {
                        // @ts-ignore
                        const { getPetitions } = await import("@/lib/api").then(mod => mod.petitionsAPI);
                        const data = await getPetitions();
                        setPetitions(Array.isArray(data) ? data : (data.petitions || []));
                      } catch (err) {
                        toast.error("Failed to reload petitions");
                      }
                    }
                  }
                )}
              </React.Suspense>
            )}
          </DialogContent>
        </Dialog>

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