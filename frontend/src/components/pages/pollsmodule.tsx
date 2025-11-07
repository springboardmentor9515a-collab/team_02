// PollsModule.tsx (Corrected for Validation Error - Frontend-Only Fix)

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
  CheckCheck,
  Loader2
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import ThemeToggle from "./ThemeToggle";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from "sonner";

// --- TYPESCRIPT INTERFACES (Aligned with Backend) ---

interface BackendPoll {
  _id: string;
  title: string;
  description: string;
  options: string[];
  category: string;
  duration: number;
  created_by: {
    _id: string;
    name: string;
    email: string;
  };
  target_location: string;
  targetAuthority: string;
  createdAt: string;
  updatedAt: string;
}

interface PollResults {
  counts: { [key: string]: number };
  percentages: { [key: string]: number };
  total: number;
}

interface DisplayPoll extends BackendPoll {
  results?: PollResults; 
  hasVoted?: boolean; 
  status: 'active' | 'closed';
  endsIn: string;
}

interface PollsModuleProps {
  onNavigate: (page: 'dashboard' | 'petitions' | 'polls' | 'messages' | 'landing' | 'reports', itemId?: string) => void;
  userName: string;
  userId: string; 
}


// --- API HELPER FUNCTIONS ---
const getAuthToken = () => {
    // IMPORTANT: Make sure you are saving the token to localStorage after login.
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Authentication Error: Not logged in.");
    }
    return token;
};

const api = {
  createPoll: async (pollData: any) => {
    const response = await fetch('/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(pollData),
    });
    
    if (!response.ok) {
      const responseClone = response.clone();
      try {
        const errorData = await responseClone.json();
        throw new Error(errorData.message || `Server responded with status: ${response.status}`);
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || `An unknown server error occurred: ${response.status}`);
      }
    }
    return response.json();
  },
  getAllPolls: async (): Promise<BackendPoll[]> => {
    const response = await fetch('/api/polls', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error('Failed to fetch polls');
    return response.json();
  },
  voteOnPoll: async (pollId: string, selected_option: string) => {
    const response = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ selected_option }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit vote');
    }
    return response.json();
  },
  getPollResults: async (pollId: string): Promise<PollResults> => {
    const response = await fetch(`/api/polls/${pollId}/results`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    if (!response.ok) throw new Error('Failed to fetch poll results');
    return response.json();
  },
};


// --- REUSABLE COMPONENTS ---

const CreatePollForm = ({ onClose, onPollCreated }: { onClose: () => void; onPollCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(7);
  const [targetLocation, setTargetLocation] = useState('');
  const [targetAuthority, setTargetAuthority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const addOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (!title || !description || !category || !targetLocation || !targetAuthority || validOptions.length < 2) {
      toast.error("Please fill all required fields and provide at least two options.");
      setIsSubmitting(false);
      return;
    }

    // ============================= THE FIX IS HERE =============================
    // To satisfy the inconsistent backend, we send BOTH key formats.
    // - `target_authority` is read by the backend router.
    // - `targetAuthority` is required by the backend model for validation.
    const pollData = {
      title,
      description,
      options: validOptions,
      category,
      duration,
      target_location: targetLocation,
      target_authority: targetAuthority, // For the router
      targetAuthority: targetAuthority,  // For the model
    };
    // ===========================================================================
    
    try {
      await api.createPoll(pollData);
      toast.success("Poll created successfully!");
      onPollCreated();
      onClose();
    } catch (error: any) {
      toast.error(`Creation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
       <div className="grid gap-2">
        <Label htmlFor="title">Poll Question (Title)</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Should we install new street lights?" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide more context for your poll..." required />
      </div>
       <div className="grid gap-2">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} required />
            {options.length > 2 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><X className="h-4 w-4" /></Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addOption} className="mt-2"><Plus className="w-4 h-4 mr-2" />Add Option</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Infrastructure" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="duration">Duration (Days)</Label>
          <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min="1" required />
        </div>
      </div>
      <div className="grid gap-2">
          <Label htmlFor="targetLocation">Target Location</Label>
          <Input id="targetLocation" value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)} placeholder="e.g., Downtown, Ward 5" required />
      </div>
       <div className="grid gap-2">
          <Label htmlFor="targetAuthority">Target Authority</Label>
          <Input id="targetAuthority" value={targetAuthority} onChange={(e) => setTargetAuthority(e.target.value)} placeholder="e.g., City Council, Parks Department" required />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Poll
        </Button>
      </div>
    </form>
  );
};


// ... The rest of the file (PollCard, PollDetail, PollsModule, etc.) is unchanged ...
// They are included below for completeness.

const PollCard = ({ poll, onVoteClick }: { poll: DisplayPoll, onVoteClick: (poll: DisplayPoll) => void }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
             <Badge variant="secondary" className="mb-2">{poll.category}</Badge>
             <CardTitle className="text-lg">{poll.title}</CardTitle>
          </div>
          <Badge variant={poll.status === 'active' ? 'default' : 'outline'} className={poll.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
            {poll.status === 'active' ? 'Active' : 'Closed'}
          </Badge>
        </div>
        <CardDescription>{poll.description.substring(0, 100)}...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{poll.status === 'active' ? `Ends in ${poll.endsIn}` : `Ended`}</span>
          </div>
          <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{poll.results?.total ?? 0} votes</span>
          </div>
        </div>
        <Button className="w-full mt-4 bg-civix-dark-brown text-white" onClick={() => onVoteClick(poll)}>
          {poll.hasVoted ? 'View Results' : 'Vote Now'}
        </Button>
      </CardContent>
    </Card>
);
  
const PollDetail = ({ poll, onBack, onVoteSuccess, userId }: { poll: DisplayPoll; onBack: () => void; onVoteSuccess: (pollId: string) => void; userId: string; }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<PollResults | undefined>(poll.results);
    const [hasVoted, setHasVoted] = useState(poll.hasVoted);

    useEffect(() => {
        const fetchResults = async () => {
            if (!results && hasVoted) {
                try {
                    const res = await api.getPollResults(poll._id);
                    setResults(res);
                } catch (error) {
                    toast.error("Could not load poll results.");
                }
            }
        };
        fetchResults();
    }, [poll._id, results, hasVoted]);

    const handleVote = async () => {
        if (!selectedOption) {
            toast.error("Please select an option to vote.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.voteOnPoll(poll._id, selectedOption);
            toast.success("Your vote has been recorded!");
            const newResults = await api.getPollResults(poll._id);
            setResults(newResults);
            setHasVoted(true);
            onVoteSuccess(poll._id);
        } catch (error: any) {
            toast.error(`Vote failed: ${error.message}`);
            if (error.message.includes('already voted')) {
                setHasVoted(true);
                onVoteSuccess(poll._id);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isMyPoll = poll.created_by._id === userId;

    const displayOptions = useMemo(() => {
        return poll.options.map(optionText => ({
            text: optionText,
            votes: results?.counts?.[optionText] ?? 0,
            percentage: results?.percentages?.[optionText] ?? 0,
        }));
    }, [poll.options, results]);

    const chartData = displayOptions.map(opt => ({ name: opt.text, value: opt.votes }));
    const COLORS = ['#4CAF50', '#5A3825', '#F5DEB3', '#EAD8C0', '#A98155'];

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Polls</Button>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            {isMyPoll && <Badge className="w-fit mb-2">My Poll</Badge>}
            <CardTitle className="text-3xl">{poll.title}</CardTitle>
            <CardDescription>{poll.description}</CardDescription>
             <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2">
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{poll.target_location}</span></div>
                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>Ends in {poll.endsIn}</span></div>
                <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>By: {poll.created_by.name}</span></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
             {!hasVoted && poll.status === 'active' ? (
              <div className="space-y-3">
                <h3 className="font-semibold">Cast Your Vote</h3>
                {poll.options.map((option) => (
                  <Button key={option} variant={selectedOption === option ? "default" : "outline"} className="w-full justify-start p-4 h-auto" onClick={() => setSelectedOption(option)}>{option}</Button>
                ))}
                <Button onClick={handleVote} disabled={isSubmitting || !selectedOption} className="w-full mt-4 bg-civix-civic-green text-white">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Vote
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-4">Results</h3>
                {!results ? (<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>) : (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            {displayOptions.map((option, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{option.text}</span>
                                <span className="text-gray-500">{option.percentage}% ({option.votes})</span>
                                </div>
                                <Progress value={option.percentage} className="h-2 [&>div]:bg-civix-civic-green" />
                            </div>
                            ))}
                        </div>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{chartData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie>
                                <Tooltip formatter={(value: number) => `${value} votes`} />
                            </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                <p className="text-center mt-4 text-sm text-gray-500">{results?.total.toLocaleString() ?? 0} total votes</p>
                {hasVoted && <div className="mt-4 flex items-center justify-center gap-2 text-green-600"><CheckCheck className="h-5 w-5" /> You have voted.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
};

export default function PollsModule({ onNavigate, userName, userId }: PollsModuleProps) {
  const [activeSection, setActiveSection] = useState('polls');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'active' | 'my-polls' | 'closed'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPoll, setSelectedPoll] = useState<DisplayPoll | null>(null);
  const [polls, setPolls] = useState<DisplayPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  const fetchPolls = async () => {
      setLoading(true);
      try {
        const backendPolls = await api.getAllPolls();
        const pollsWithDetails = await Promise.all(
            backendPolls.map(async (poll) => {
                let results: PollResults | undefined;
                let hasVoted = votedPolls.has(poll._id);
                try {
                    results = await api.getPollResults(poll._id);
                } catch { /* Fails silently if no results yet */ }

                if (!hasVoted) {
                    try {
                        await api.voteOnPoll(poll._id, 'CHECK_VOTE_STATUS_DUMMY_VALUE');
                    } catch(e: any) {
                         if(e.message.includes('already voted')) {
                            hasVoted = true;
                            setVotedPolls(prev => new Set(prev).add(poll._id));
                         }
                    }
                }
                
                const endDate = new Date(new Date(poll.createdAt).getTime() + poll.duration * 24 * 60 * 60 * 1000);
                const diffTime = endDate.getTime() - new Date().getTime();
                const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

                return {
                    ...poll,
                    results,
                    hasVoted,
                    status: diffTime > 0 ? 'active' : 'closed',
                    endsIn: `${diffDays} days`
                };
            })
        );
        setPolls(pollsWithDetails);
      } catch (err) {
        toast.error('Failed to load polls.');
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    fetchPolls();
  }, []);

  const handlePollCreated = () => fetchPolls();
  
  const filteredPolls = useMemo(() => polls.filter(poll => {
      const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) || poll.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterType === 'active') return matchesSearch && poll.status === 'active';
      if (filterType === 'my-polls') return matchesSearch && poll.created_by._id === userId;
      if (filterType === 'closed') return matchesSearch && poll.status === 'closed';
      return matchesSearch;
    }), [polls, searchQuery, filterType, userId]);

  const handleViewPoll = (poll: DisplayPoll) => {
    setSelectedPoll(poll);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPoll(null);
  };
  
  const handleVoteSuccess = (pollId: string) => {
    setVotedPolls(prev => new Set(prev).add(pollId));
    setPolls(prevPolls => prevPolls.map(p => p._id === pollId ? { ...p, hasVoted: true } : p));
    const pollToUpdate = polls.find(p => p._id === pollId);
    if (pollToUpdate) {
        handleViewPoll({ ...pollToUpdate, hasVoted: true });
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => onNavigate('dashboard') },
    { id: 'petitions', label: 'Petitions', icon: FileText, onClick: () => onNavigate('petitions') },
    { id: 'polls', label: 'Polls & Voting', icon: Vote, onClick: () => setActiveSection('polls') },
    { id: 'reports', label: 'Reports', icon: BarChart3, onClick: () => onNavigate('reports') },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-civix-warm-beige dark:border-gray-700 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent">Civix</h1>
              <nav className="hidden md:flex items-center space-x-6">
                {['dashboard', 'petitions', 'polls', 'reports'].map(page => (<button key={page} onClick={() => onNavigate(page as any)} className="text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green transition-colors capitalize">{page === 'polls' ? 'Polls & Voting' : page}</button>))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"><Bell className="w-5 h-5" /></Button>
              <div className="flex items-center space-x-2">
                <Avatar><AvatarImage src="/api/placeholder/40/40" /><AvatarFallback className="bg-civix-civic-green text-white">{userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="hidden md:block"><p className="text-sm text-civix-dark-brown dark:text-civix-sandal font-semibold">{userName}</p><p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">Civic Member</p></div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('landing')} className="text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"><LogOut className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (<Button key={item.id} variant={activeSection === item.id ? "default" : "ghost"} className={`w-full justify-start ${activeSection === item.id ? "bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white" : "text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"}`} onClick={item.onClick}><item.icon className="w-4 h-4 mr-3" />{item.label}</Button>))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-9">
            {viewMode === 'list' ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Polls & Voting</h2>
                    <p className="text-gray-500 dark:text-gray-400">Welcome, {userName}. Participate in community decision-making.</p>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild><Button className="bg-civix-civic-green text-white hover:bg-civix-civic-green/90"><Plus className="w-4 h-4 mr-2" />Create Poll</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Create New Poll</DialogTitle><DialogDescription>Gather community opinions on important topics.</DialogDescription></DialogHeader>
                      <CreatePollForm onClose={() => setIsCreateModalOpen(false)} onPollCreated={handlePollCreated} />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search polls..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                        <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="my-polls">My Polls</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {loading ? (<div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>) : filteredPolls.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPolls.map(poll => (<PollCard key={poll._id} poll={poll} onVoteClick={handleViewPoll} />))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Vote className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No polls found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new poll.</p>
                    </div>
                )}
              </div>
            ) : selectedPoll && (
              <PollDetail poll={selectedPoll} onBack={handleBackToList} onVoteSuccess={handleVoteSuccess} userId={userId}/>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}