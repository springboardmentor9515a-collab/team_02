import React, { useState } from 'react';
import { Page } from '../../App';
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
  MapPin,
  Clock,
  ThumbsUp,
  Share2,
  Target
} from "lucide-react";

interface PetitionsModuleProps {
  onNavigate: (page: Page, itemId?: string) => void;
  selectedItemId?: string | null;
}

const PetitionsModule: React.FC<PetitionsModuleProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPetition, setSelectedPetition] = useState<any>(null);

  // Your detailed mock data
  const mockPetitions = [
    {
      id: '1',
      title: "Improve Public Transportation in Downtown",
      summary: "Requesting more frequent bus routes and better maintenance of transit stops.",
      category: "Transportation",
      location: "Downtown District",
      signatures: 1247,
      goal: 2000,
      daysLeft: 15,
      description: "Our downtown area has seen tremendous growth, but our public transportation hasn't kept pace. This petition calls for increased frequency of bus routes, proper shelters, and real-time arrival information.",
      status: "active",
      updates: [{ date: "2025-01-20", message: "City Council has agreed to review this petition." }],
      comments: [{ author: "Mike Chen", comment: "This is exactly what we need!", date: "2025-01-22" }]
    },
    {
      id: '2',
      title: "Install Solar Panels in Public Schools",
      summary: "Initiative to make our schools more sustainable and reduce energy costs.",
      category: "Environment",
      location: "Citywide",
      signatures: 2891,
      goal: 3000,
      daysLeft: 8,
      description: "This petition proposes installing solar panel systems across all public schools. Benefits include significant reduction in energy costs, educational opportunities, and a reduced carbon footprint for our community.",
      status: "trending",
      updates: [{ date: "2025-01-18", message: "School board has requested a detailed cost analysis." }],
      comments: [{ author: "Teacher Mary", comment: "This would be amazing for our science curriculum!", date: "2025-01-20" }]
    },
  ];

  const filteredPetitions = mockPetitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || petition.category.toLowerCase() === filterCategory;
    const matchesStatus = filterStatus === 'all' || petition.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewPetition = (petition: any) => {
    setSelectedPetition(petition);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPetition(null);
  };

  // --- DETAIL VIEW COMPONENT ---
  const PetitionDetail = ({ petition }: { petition: any }) => (
    <div className="space-y-6">
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
                <span className="flex items-center"><Target className="w-4 h-4 mr-1" />Goal: {petition.goal.toLocaleString()}</span>
              </div>
              <div className="space-y-2 mb-6">
                <Progress value={(petition.signatures / petition.goal) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{petition.signatures.toLocaleString()} signatures</span>
                  <span>{Math.round((petition.signatures / petition.goal) * 100)}% complete</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{petition.description}</p>
            </div>
            {/* Updates and Comments can be added here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // --- LIST VIEW JSX ---
  const listView = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-civix-dark-brown dark:text-white">Petitions</h2>
          <p className="text-gray-500 dark:text-gray-400">Make your voice heard on issues that matter</p>
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" placeholder="A clear, compelling title" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="summary" className="text-right">Summary</Label>
                <Textarea id="summary" placeholder="A brief overview of your petition" className="col-span-3" rows={3}/>
              </div>
            </div>
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
          <Card key={petition.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
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
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{petition.daysLeft} days left</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{petition.summary}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={(petition.signatures / petition.goal) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{petition.signatures.toLocaleString()} signatures</span>
                  <span>Goal: {petition.goal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {viewMode === 'list' ? listView : <PetitionDetail petition={selectedPetition} />}
    </div>
  );
};

export default PetitionsModule;

