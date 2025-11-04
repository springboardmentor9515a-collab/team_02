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
  ArrowLeft,
  Bell, 
  LogOut,
  TrendingUp,
  MapPin,
  Calendar,
  Search,
  Plus,
  Clock,
  Users,
  ThumbsUp,
  PieChart,
  X,
  CheckCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Page } from '@/types';
import { toast } from "sonner";
import { pollsAPI } from '@/lib/api';

interface PollsModuleProps {
  onNavigate: (page: 'dashboard' | 'petitions' | 'polls' | 'messages' | 'landing' | 'reports', itemId?: string) => void;
  selectedItemId?: string | null;
  userName: string;
}
interface ReportAttachment {
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
}

interface TimelineEvent {
  date: string;
  status: string;
  message: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  description: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  endsIn: string;
  endDate: string;
  createdBy: string;
  createdByCurrentUser: boolean;
  createdDate: string;
  status: string;
  isPublic: boolean;
  tags: string[];
}
interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: string;
  priority: 'High' | 'Medium' | 'Low';
  submittedBy: string;
  submittedDate: string;
  lastUpdate: string;
  upvotes: number;
  attachments: ReportAttachment[];
  timeline: TimelineEvent[];
  officialResponse: string | null;
  responseBy: string | null;
  responseDate: string | null;
}

// Import the new components
import { CreatePollForm, PollList } from './PollComponents';

interface Poll {
  id: string;
  question: string;
  description: string;
  category: string;
  options: { id: string; text: string; votes: number; percentage: number }[];
  totalVotes: number;
  endsIn: string;
  endDate: string;
  createdBy: string;
  createdByCurrentUser: boolean;
  createdDate: string;
  status: string;
  isPublic: boolean;
  tags: string[];
}

export default function PollsModule({ onNavigate, selectedItemId, userName }: PollsModuleProps) {
  const [activeSection, setActiveSection] = useState('polls');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<'active' | 'voted' | 'my-polls' | 'closed'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch polls from backend on mount
  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
  const data = await pollsAPI.getAllPolls();
  setPolls(Array.isArray(data) ? data : (data.polls || []));
      } catch (err) {
        toast.error('Failed to load polls');
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set(['2']));
  const [newPoll, setNewPoll] = useState({
    question: '',
    description: '',
    options: ['', '']
  });



  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => onNavigate('dashboard') },
    { id: 'petitions', label: 'Petitions', icon: FileText, onClick: () => onNavigate('petitions') },
    { id: 'polls', label: 'Polls & Voting', icon: Vote, onClick: () => setActiveSection('polls') },
    { id: 'reports', label: 'Reports', icon: BarChart3, onClick: () => onNavigate('reports') },
 ];

  const filteredPolls = polls.filter(poll =>
    {
      const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           poll.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || poll.category.toLowerCase() === filterCategory;
      
      let matchesType = true;
      if (filterType === 'active') {
        matchesType = poll.status === 'active' || poll.status === 'trending';
    } else if (filterType === 'voted') {
      matchesType = votedPolls.has(poll.id);
      } else if (filterType === 'my-polls') {
        matchesType = poll.createdByCurrentUser;
      } else if (filterType === 'closed') {
        matchesType = poll.status === 'closed';
      }
      
      return matchesSearch && matchesCategory && matchesType;
    }
  );

  const handleViewPoll = (poll: any) => {
    setSelectedPoll(poll);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPoll(null);
  };
  
  const handleVote = (pollId: string) => {
    setVotedPolls(prev => new Set(prev).add(pollId));
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newPoll.options.filter(opt => opt.trim() !== '');
    if (!newPoll.question || validOptions.length < 2) {
      toast.error("Please provide a question and at least two options.");
      return;
    }

    try {
      await pollsAPI.createPoll({
        title: newPoll.question,
        options: validOptions,
        description: newPoll.description
      });

      const createdPoll: Poll = {
        id: (polls.length + 1).toString(),
        question: newPoll.question,
        description: newPoll.description,
        category: "Community", // Default category
        options: validOptions.map((opt, i) => ({ id: String.fromCharCode(97 + i), text: opt, votes: 0, percentage: 0 })),
        totalVotes: 0,
        endsIn: "30 days",
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: userName,
        createdByCurrentUser: true,
        createdDate: new Date().toISOString().split('T')[0],
        status: "active",
        isPublic: true,
        tags: ["community-poll"],
      };

      setPolls([createdPoll, ...polls]);
      toast.success("Poll created successfully!");
      setIsCreateModalOpen(false);
      setNewPoll({ question: '', description: '', options: ['', ''] });
    } catch (error) {
      toast.error("Failed to create poll. Please try again.");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({ ...newPoll, options: newOptions });
  };

  const addOption = () => {
    if (newPoll.options.length < 5) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const newOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: newOptions });
    }
  };

  const PollDetail = ({ poll }: { poll: Poll }) => {
    const hasVoted = votedPolls.has(poll.id);
    const chartData = poll.options.map((option) => ({ name: option.text, value: option.votes }));
    const COLORS = ['#4CAF50', '#5A3825', '#F5DEB3', '#EAD8C0'];

    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Polls
        </Button>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-civix-dark-brown dark:text-white mb-2">{poll.question}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{poll.description}</p>
    
            {!hasVoted ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-civix-dark-brown dark:text-white">Cast Your Vote</h3>
                {poll.options.map((option: PollOption) => (
                  <Button key={option.id} variant="outline" className="w-full justify-start p-4 h-auto" onClick={() => handleVote(poll.id)}>
                    {option.text}
                  </Button>
                ))}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-civix-dark-brown dark:text-white mb-4">Results</h3>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    {poll.options.map((option: PollOption) => (
                      <div key={option.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-civix-dark-brown dark:text-gray-200">{option.text}</span>
                          <span className="text-gray-500 dark:text-gray-400">{option.percentage}%</span>
                        </div>
                        <Progress value={option.percentage} className="h-2 [&>div]:bg-civix-civic-green" />
                      </div>
                    ))}
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {chartData.map((_entry: { name: string; value: number }, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">{poll.totalVotes.toLocaleString()} total votes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-civix-warm-beige dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent">
                Civix
              </h1>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => onNavigate('petitions')}
                  className="text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green transition-colors"
                >
                  Petitions
                </button>
                <button 
                  onClick={() => onNavigate('polls')}
                  className="text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green transition-colors"
                >
                  Polls & Voting
                </button>
                <button onClick={() => onNavigate('reports')} className="text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green transition-colors">Reports</button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700">
                <Bell className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback className="bg-civix-civic-green text-white">
                    {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '600' }}>{userName}</p>
                  <p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">Civic Member</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('landing')}
                  className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeSection === item.id 
                          ? "bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white" 
                          : "text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"
                      }`}
                      onClick={item.onClick}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="space-y-6 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Polls & Voting</h2>
                  <p className="text-gray-500 dark:text-gray-400">Welcome, {userName}. Participate in community decision-making.</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Poll
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Poll</DialogTitle>
                      <DialogDescription>Gather community opinions on important topics.</DialogDescription>
                    </DialogHeader>
                    <CreatePollForm 
                      onClose={() => setIsCreateModalOpen(false)}
                      onPollCreated={() => setIsCreateModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <PollList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
