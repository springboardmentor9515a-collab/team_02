import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  FileText, 
  Vote, 
  BarChart3, 
  MessageSquare, 
  Bell, 
  LogOut,
  MapPin,
  TrendingUp,
  Users,
  Calendar,
  ThumbsUp,
  Share2,
  Eye,
  Filter,
  Search,
  Plus,
  Clock,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Page } from '@/types';

interface PetitionsModuleProps {
  onNavigate: (page: Page, itemId?: string) => void;
  selectedItemId?: string | null;
  userName: string;
}

import { CreatePetitionForm, PetitionList } from './PetitionComponents';

interface Petition {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  location: string;
  targetAuthority: string;
  signatureGoal: number;
  currentSignatures: number;
  status: string;
  createdBy: string;
  createdDate: string;
  endDate: string;
  isSignedByUser: boolean;
}

export default function PetitionsModule({ onNavigate, selectedItemId, userName }: PetitionsModuleProps) {
  const [activeSection, setActiveSection] = useState('petitions');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reloadPetitions();
    // eslint-disable-next-line
  }, []);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => onNavigate('dashboard') },
    { id: 'petitions', label: 'Petitions', icon: FileText, onClick: () => setActiveSection('petitions') },
    { id: 'polls', label: 'Polls & Voting', icon: Vote, onClick: () => onNavigate('polls') },
    { id: 'reports', label: 'Reports', icon: BarChart3, onClick: () => onNavigate('reports') },
    { id: 'messages', label: 'Messages', icon: MessageSquare, onClick: () => onNavigate('messages') }
  ];

  const filteredPetitions = Array.isArray(petitions) ? petitions.filter(petition => {
    if (!petition || !petition.title || !petition.summary || !petition.category || !petition.status) return false;
    const matchesSearch = petition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || petition.category.toLowerCase() === filterCategory;
    const matchesStatus = filterStatus === 'all' || petition.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }) : [];

  const handleViewPetition = (petition: any) => {
    setSelectedPetition(petition);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPetition(null);
  };

  const reloadPetitions = async () => {
    try {
      const data = await import('@/lib/api').then(mod => mod.petitionsAPI.getAllPetitions());
      setPetitions(Array.isArray(data) ? data : (data.petitions || []));
      setError(null);
    } catch (err) {
      console.error('Error loading petitions:', err);
      setError('Failed to load petitions');
      toast.error('Failed to load petitions');
    }
  };

  // --- DETAIL VIEW COMPONENT ---
  const PetitionDetail = ({ petition }: { petition: any }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<any[]>(petition.comments || []);
    const [submitting, setSubmitting] = useState(false);

    const handleComment = async () => {
      if (!commentText.trim()) return;
      setSubmitting(true);
      try {
        const { commentPetition } = await import("@/lib/api").then(mod => mod.petitionsAPI);
        const res = await commentPetition(petition._id || petition.id, commentText);
        setComments(res.comments || []);
        setCommentText("");
        toast.success("Comment added");
      } catch (err) {
        toast.error("Failed to add comment");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToList}>
            ← Back to Petitions
          </Button>
          <div className="flex items-center space-x-2">
            <Button size="sm" className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Sign Petition
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-3xl font-bold text-civix-dark-brown dark:text-white">
                    {petition.title}
                  </h1>
                  {petition.status === 'trending' && (
                    <Badge className="bg-civix-civic-green text-white"><TrendingUp className="w-4 h-4 mr-1" />Trending</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <span className="bg-civix-warm-beige dark:bg-gray-700 px-3 py-1 rounded-full">{petition.category}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{petition.location}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{petition.daysLeft} days left</span>
                  <span className="flex items-center"><Target className="w-4 h-4 mr-1" />Goal: {petition.goal?.toLocaleString?.() ?? ''}</span>
                </div>
                <div className="space-y-2 mb-6">
                  <Progress value={petition.goal && petition.signatures ? (petition.signatures / petition.goal) * 100 : 0} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{petition.signatures?.toLocaleString?.() ?? 0} signatures</span>
                    <span>{petition.goal && petition.signatures ? Math.round((petition.signatures / petition.goal) * 100) : 0}% complete</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{petition.description}</p>
              </div>
              {/* Comments Section */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-2">Comments</h4>
                <div className="space-y-2 mb-4">
                  {comments.length === 0 && <div className="text-gray-500">No comments yet.</div>}
                  {comments.map((c, idx) => (
                    <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                      <span className="font-semibold">{c.by?.name || c.by || 'User'}:</span> {c.text}
                      <span className="ml-2 text-xs text-gray-400">{c.at ? new Date(c.at).toLocaleString() : ''}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    disabled={submitting}
                  />
                  <Button onClick={handleComment} disabled={submitting || !commentText.trim()}>
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- LIST VIEW JSX ---
  const listView = (
    <div className="space-y-6 p-6">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700">
        ← Back to Dashboard
      </Button>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Petitions</h2>
          {/* ADDED: Welcome message using the userName prop */}
          <p className="text-gray-500 dark:text-gray-400">Welcome, {userName}. Make your voice heard on issues that matter.</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Petition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Create New Petition</DialogTitle>
              <DialogDescription>Start a petition to advocate for change in your community.</DialogDescription>
            </DialogHeader>
            <CreatePetitionForm
              onClose={() => setIsCreateModalOpen(false)}
              onPetitionCreated={reloadPetitions}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search petitions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-civix-light-gray dark:bg-gray-700" />
            </div>
            <div className="flex gap-4">
              <Select defaultValue="all" onValueChange={setFilterCategory}><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="transportation">Transportation</SelectItem><SelectItem value="environment">Environment</SelectItem></SelectContent></Select>
              <Select defaultValue="all" onValueChange={setFilterStatus}><SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="trending">Trending</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPetitions.map((petition) => (
          <Card key={petition.id || petition._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-civix-dark-brown dark:text-white cursor-pointer hover:text-civix-civic-green" onClick={() => handleViewPetition(petition)}>{petition.title}</h3>
                    {petition.status === 'trending' && <Badge className="bg-civix-civic-green text-white"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Badge variant="outline" className="border-civix-dark-brown">{petition.category}</Badge>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{petition.location}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{petition.daysLeft}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{petition.summary}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={petition.goal && petition.signatures ? (petition.signatures / petition.goal) * 100 : 0} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{petition.signatures?.toLocaleString?.() ?? 0} signatures</span>
                  <span>Goal: {petition.goal?.toLocaleString?.() ?? ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) {
    return <div style={{ color: 'red', padding: 24 }}>An error occurred in PetitionsModule: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civix-sandal to-civix-warm-beige dark:from-gray-900 dark:to-gray-800">
      {viewMode === 'list' ? listView : <PetitionDetail petition={selectedPetition} />}
    </div>
  );
}
// removed duplicate component definitions
