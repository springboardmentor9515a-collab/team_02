import React, { useState } from 'react';
import { Page } from '@/App';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  TrendingUp,
  Users,
  Clock,
  Vote,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PollsModuleProps {
  onNavigate: (page: Page, itemId?: string) => void;
  selectedItemId?: string | null;
}

const PollsModule: React.FC<PollsModuleProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPoll, setSelectedPoll] = useState<any>(null);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  const mockPolls = [
    {
      id: '1',
      question: "What should be the priority for next year's city budget?",
      description: "Help us decide where to allocate the majority of next year's municipal budget.",
      category: "Budget",
      options: [
        { id: 'a', text: "Infrastructure", votes: 342, percentage: 38 },
        { id: 'b', text: "Education", votes: 298, percentage: 33 },
        { id: 'c', text: "Healthcare", votes: 187, percentage: 21 },
        { id: 'd', text: "Environment", votes: 73, percentage: 8 }
      ],
      totalVotes: 900,
      endsIn: "3 days",
      status: "active",
    },
    {
      id: '2',
      question: "Should the city implement a bike-sharing program?",
      description: "We're considering launching a bike-sharing program for eco-friendly transportation.",
      category: "Transportation",
      options: [
        { id: 'a', text: "Yes, citywide", votes: 456, percentage: 52 },
        { id: 'b', text: "Yes, but pilot first", votes: 298, percentage: 34 },
        { id: 'c', text: "No", votes: 123, percentage: 14 }
      ],
      totalVotes: 877,
      endsIn: "1 week",
      status: "trending",
    },
  ];

  const filteredPolls = mockPolls.filter(poll =>
    poll.question.toLowerCase().includes(searchQuery.toLowerCase())
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

  const PollDetail = ({ poll }: { poll: any }) => {
    const hasVoted = votedPolls.has(poll.id);
    const chartData = poll.options.map((option: any) => ({ name: option.text, value: option.votes }));
    const COLORS = ['#4CAF50', '#5A3825', '#F5DEB3', '#EAD8C0'];

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackToList}>← Back to Polls</Button>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-civix-dark-brown dark:text-white mb-2">{poll.question}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{poll.description}</p>
            
            {!hasVoted ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-civix-dark-brown dark:text-white">Cast Your Vote</h3>
                {poll.options.map((option: any) => (
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
                    {poll.options.map((option: any) => (
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
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {/* This part is handled automatically by the Pie component */}
                          {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
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

  const listView = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Polls & Voting</h2>
          <p className="text-gray-500 dark:text-gray-400">Participate in community decision-making</p>
        </div>
        <Dialog>
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
            {/* Form to create a new poll would go here */}
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search polls..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-civix-light-gray dark:bg-gray-700" />
            </div>
            <div className="flex gap-4">
              <Select defaultValue="all"><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem></SelectContent></Select>
              <Select defaultValue="all"><SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem></SelectContent></Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {filteredPolls.map((poll) => (
          <Card key={poll.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleViewPoll(poll)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-civix-dark-brown dark:text-white">{poll.question}</h3>
                {poll.status === 'trending' && <Badge className="bg-civix-civic-green text-white"><TrendingUp className="w-3 h-3 mr-1"/>Trending</Badge>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{poll.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center"><Users className="w-4 h-4 mr-2"/>{poll.totalVotes.toLocaleString()} votes</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2"/>Ends in {poll.endsIn}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {viewMode === 'list' ? listView : <PollDetail poll={selectedPoll} />}
    </div>
  );
};

export default PollsModule;
