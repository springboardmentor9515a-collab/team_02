import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  AlertTriangle,
  Shield,
  UserCheck,
  UserPlus,
  PartyPopper,
  Wrench,
  Megaphone,
  Siren,
  GraduationCap,
  Heart,
  Briefcase,
  Check,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";
import { 
  Activity,
} from "lucide-react";
import { Page } from "@/types";

interface DashboardProps {
  onNavigate: (page: Page, itemId?: string) => void;
  userName: string;
}

export default function Dashboard({ onNavigate, userName }: DashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Volunteer registration state
  const [volunteerSheetOpen, setVolunteerSheetOpen] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Mock data for petitions
  const mockPetitions = [
    {
      id: '1',
      title: "Improve Public Transportation",
      description: "Increase bus frequency in downtown area during peak hours",
      signatures: 1247,
      goal: 2000,
      location: "Downtown",
      daysLeft: 15
    },
    {
      id: '2',
      title: "Install Solar Panels in Schools",
      description: "Make our schools more sustainable and reduce energy costs",
      signatures: 2891,
      goal: 3000,
      location: "Citywide",
      daysLeft: 8
    },
    {
      id: '3',
      title: "Create More Community Parks",
      description: "Convert vacant lots into green spaces for families",
      signatures: 856,
      goal: 1500,
      location: "North Side",
      daysLeft: 22
    }
  ];

  // Mock data for polls
  const mockPolls = [
    {
      id: '1',
      question: "What should be the priority for city budget?",
      options: [
        { text: "Infrastructure", percentage: 38 },
        { text: "Education", percentage: 33 },
        { text: "Healthcare", percentage: 21 },
        { text: "Environment", percentage: 8 }
      ],
      totalVotes: 900,
      endsIn: "3 days"
    },
    {
      id: '2',
      question: "Should we implement a bike-sharing program?",
      options: [
        { text: "Yes, citywide", percentage: 52 },
        { text: "Yes, pilot program", percentage: 34 },
        { text: "No", percentage: 14 }
      ],
      totalVotes: 877,
      endsIn: "1 week"
    }
  ];

  // Mock data for official updates
  const mockOfficialUpdates = [
    {
      id: '1',
      official: "Mayor Johnson",
      avatar: "/api/placeholder/40/40",
      title: "Transportation Improvements Approved",
      content: "The city council has approved funding for enhanced bus routes in the downtown area. Implementation begins next month.",
      timestamp: "2 hours ago"
    },
    {
      id: '2',
      official: "City Council",
      avatar: "/api/placeholder/40/40",
      title: "Solar Panel Initiative Update",
      content: "We're reviewing the proposal for solar panels in schools. A decision will be made at the next council meeting on Feb 15th.",
      timestamp: "1 day ago"
    }
  ];

  // Volunteer work categories
  const volunteerCategories = [
    { id: 'event-help', name: 'Event Help', icon: PartyPopper, description: 'Assist with community events and gatherings' },
    { id: 'technical-support', name: 'Technical Support', icon: Wrench, description: 'Help with tech-related issues and infrastructure' },
    { id: 'community-outreach', name: 'Community Outreach', icon: Megaphone, description: 'Engage with community members and spread awareness' },
    { id: 'emergency-response', name: 'Emergency Response', icon: Siren, description: 'Respond to urgent community needs' },
    { id: 'education', name: 'Education & Tutoring', icon: GraduationCap, description: 'Support educational programs and mentoring' },
    { id: 'health-wellness', name: 'Health & Wellness', icon: Heart, description: 'Promote health initiatives and wellness programs' },
    { id: 'administrative', name: 'Administrative Support', icon: Briefcase, description: 'Help with paperwork and organizational tasks' }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleVolunteerRegistration = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one work category');
      return;
    }

    // Simulate API call
    toast.success('Successfully registered as a volunteer!');
    
    // Reset and close
    setVolunteerSheetOpen(false);
    setTimeout(() => {
      setRegistrationStep(1);
      setSelectedCategories([]);
      setEmailNotifications(true);
    }, 300);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => setActiveSection('dashboard') },
    { id: 'petitions', label: 'My Petitions', icon: FileText, onClick: () => onNavigate('petitions' as Page) },
    { id: 'polls', label: 'Polls & Voting', icon: Vote, onClick: () => onNavigate('polls' as Page) },
    { id: 'complaints', label: 'My Complaints', icon: AlertTriangle, onClick: () => onNavigate('complaints' as Page) },
    { id: 'reports', label: 'Reports', icon: BarChart3, onClick: () => onNavigate('reports' as Page) },
    { id: 'messages', label: 'Messages', icon: MessageSquare, onClick: () => onNavigate('messages' as Page) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-civix-sandal to-civix-warm-beige dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-civix-warm-beige dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-8">
              <h1 
                className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent"
                style={{ fontWeight: '700' }}
              >
                Civix
              </h1>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => onNavigate('dashboard')} className="text-civix-civic-green border-b-2 border-civix-civic-green">
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
                  Polls
                </button>
                <button onClick={() => onNavigate('reports')} className="text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green transition-colors">
                  Reports
                </button>
              </nav>
            </div>

            {/* Right side */}
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
                  onClick={() => onNavigate('landing' as Page)}
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
          <div className="lg:col-span-6 space-y-8">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl mb-2" style={{ fontWeight: '700' }}>Welcome back, {userName}!</h2>
                <p className="text-white/90 text-lg">Ready to make a difference in your community today?</p>
              </CardContent>
            </Card>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => onNavigate('petitions' as Page)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Total Petitions</p>
                      <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>12</p>
                      <p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">3 signed this week</p>
                    </div>
                    <div className="bg-civix-civic-green/10 dark:bg-civix-civic-green/20 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-civix-civic-green" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => onNavigate('polls' as Page)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Active Polls</p>
                      <p className="text-3xl text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '700' }}>8</p>
                      <p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">2 voted today</p>
                    </div>
                    <div className="bg-civix-dark-brown/10 dark:bg-civix-sandal/20 p-3 rounded-lg">
                      <Vote className="w-6 h-6 text-civix-dark-brown dark:text-civix-sandal" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => onNavigate('complaints' as Page)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">My Complaints</p>
                      <p className="text-3xl text-civix-civic-green" style={{ fontWeight: '700' }}>4</p>
                      <p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">2 assigned</p>
                    </div>
                    <div className="bg-civix-civic-green/10 dark:bg-civix-civic-green/20 p-3 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-civix-civic-green" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => onNavigate('messages' as Page)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-1">Messages Received</p>
                      <p className="text-3xl text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '700' }}>4</p>
                      <p className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">1 unread</p>
                    </div>
                    <div className="bg-civix-dark-brown/10 dark:bg-civix-sandal/20 p-3 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-civix-dark-brown dark:text-civix-sandal" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Buttons */}
            <div>
              <h3 className="text-2xl text-civix-dark-brown dark:text-civix-sandal mb-6" style={{ fontWeight: '700' }}>Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={() => onNavigate('petitions' as Page)}
                  className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white p-6 h-auto flex flex-col items-center space-y-2 hover:opacity-90"
                >
                  <FileText className="w-8 h-8" />
                  <span className="text-lg" style={{ fontWeight: '600' }}>Create Petition</span>
                  <span className="text-sm opacity-90">Start a new petition</span>
                </Button>

                <Button 
                  onClick={() => onNavigate('complaints' as Page)}
                  className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white p-6 h-auto flex flex-col items-center space-y-2 hover:opacity-90"
                >
                  <AlertTriangle className="w-8 h-8" />
                  <span className="text-lg" style={{ fontWeight: '600' }}>Submit Complaint</span>
                  <span className="text-sm opacity-90">Report an issue</span>
                </Button>

                <Button 
                  onClick={() => onNavigate('polls' as Page)}
                  className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white p-6 h-auto flex flex-col items-center space-y-2 hover:opacity-90"
                >
                  <Vote className="w-8 h-8" />
                  <span className="text-lg" style={{ fontWeight: '600' }}>Start Poll</span>
                  <span className="text-sm opacity-90">Create a new poll</span>
                </Button>

                <Button 
                  onClick={() => onNavigate('messages' as Page)}
                  className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white p-6 h-auto flex flex-col items-center space-y-2 hover:opacity-90"
                >
                  <MessageSquare className="w-8 h-8" />
                  <span className="text-lg" style={{ fontWeight: '600' }}>View Messages</span>
                  <span className="text-sm opacity-90">Check your inbox</span>
                </Button>
              </div>
            </div>

            {/* Admin & Volunteer Access */}
            <div>
              <h3 className="text-2xl text-civix-dark-brown dark:text-civix-sandal mb-6" style={{ fontWeight: '700' }}>Admin & Volunteer Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => onNavigate('admin' as Page)}
                  className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white p-6 h-auto flex items-center justify-between hover:opacity-90"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl" style={{ fontWeight: '600' }}>Admin Dashboard</div>
                      <div className="text-sm opacity-90">Manage all complaints & assign volunteers</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => onNavigate('volunteer' as Page)}
                  className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white p-6 h-auto flex items-center justify-between hover:opacity-90"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <div className="text-xl" style={{ fontWeight: '600' }}>Volunteer Dashboard</div>
                      <div className="text-sm opacity-90">View & update assigned complaints</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Volunteer Registration Section */}
            <Card className="bg-gradient-to-br from-civix-civic-green/10 to-civix-sandal/20 dark:from-civix-civic-green/20 dark:to-gray-700/50 border-2 border-civix-civic-green/30 dark:border-civix-civic-green/40 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-6 flex-1">
                    <div className="bg-civix-civic-green/20 dark:bg-civix-civic-green/30 p-6 rounded-full">
                      <UserPlus className="w-12 h-12 text-civix-civic-green" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '700' }}>
                        Become a Volunteer
                      </h3>
                      <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80">
                        Help your community by volunteering for various causes and initiatives
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setVolunteerSheetOpen(true)}
                    className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white px-8 py-6 text-lg hover:opacity-90 shadow-lg"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Register as Volunteer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Petitions */}
            <div>
              <h3 className="text-2xl text-civix-dark-brown dark:text-civix-sandal mb-6" style={{ fontWeight: '700' }}>Active Petitions</h3>
              <div className="space-y-6">
                {mockPetitions.map((petition) => (
                  <Card key={petition.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>{petition.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-2">
                            <span className="bg-civix-warm-beige dark:bg-gray-700 px-2 py-1 rounded">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {petition.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {petition.daysLeft} days left
                            </span>
                          </div>
                          <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80 mb-4">{petition.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-civix-dark-brown/70 dark:text-civix-sandal/70">{petition.signatures.toLocaleString()} signatures</span>
                          <span className="text-civix-dark-brown/70 dark:text-civix-sandal/70">Goal: {petition.goal.toLocaleString()}</span>
                        </div>
                        <Progress value={(petition.signatures / petition.goal) * 100} className="h-2" />
                        
                        <div className="flex items-center space-x-3 pt-2">
                          <Button size="sm" className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-civix-civic-green text-civix-civic-green hover:bg-civix-civic-green hover:text-white">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Sign
                          </Button>
                          <Button size="sm" variant="outline" className="border-civix-dark-brown text-civix-dark-brown dark:border-civix-sandal dark:text-civix-sandal hover:bg-civix-dark-brown hover:text-white dark:hover:bg-civix-sandal dark:hover:text-civix-dark-brown">
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Public Sentiment Polls */}
            <div>
              <h3 className="text-2xl text-civix-dark-brown dark:text-civix-sandal mb-6" style={{ fontWeight: '700' }}>Public Sentiment Polls</h3>
              <div className="space-y-6">
                {mockPolls.map((poll) => (
                  <Card key={poll.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg text-civix-dark-brown dark:text-civix-sandal flex-1" style={{ fontWeight: '600' }}>{poll.question}</h4>
                        <Badge variant="outline" className="border-civix-civic-green text-civix-civic-green">
                          <Calendar className="w-3 h-3 mr-1" />
                          Ends in {poll.endsIn}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {poll.options.map((option, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-civix-dark-brown dark:text-civix-sandal">{option.text}</span>
                              <span className="text-civix-dark-brown/70 dark:text-civix-sandal/70">{option.percentage}%</span>
                            </div>
                            <Progress value={option.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">{poll.totalVotes.toLocaleString()} total votes</span>
                        <Button size="sm" className="bg-civix-civic-green hover:bg-civix-civic-green/90 text-white">
                          <Vote className="w-3 h-3 mr-1" />
                          Vote Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Official Updates */}
            <div>
              <h3 className="text-2xl text-civix-dark-brown dark:text-civix-sandal mb-6" style={{ fontWeight: '700' }}>Official Updates</h3>
              <div className="space-y-4">
                {mockOfficialUpdates.map((update) => (
                  <Card key={update.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={update.avatar} />
                          <AvatarFallback className="bg-civix-dark-brown text-white">
                            {update.official.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '600' }}>{update.official}</h5>
                            <Badge className="bg-civix-civic-green text-white text-xs">Verified</Badge>
                          </div>
                          <h6 className="text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>{update.title}</h6>
                          <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80 mb-2">{update.content}</p>
                          <span className="text-xs text-civix-dark-brown/60 dark:text-civix-sandal/60">{update.timestamp}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Poll Widget */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-civix-dark-brown dark:text-civix-sandal">Quick Poll</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-civix-dark-brown/80 dark:text-civix-sandal/80 mb-4">How would you rate your city's response to citizen concerns?</p>
                <div className="space-y-2">
                  {['Excellent', 'Good', 'Fair', 'Poor'].map((rating) => (
                    <Button 
                      key={rating} 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start border-civix-warm-beige dark:border-gray-600 text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Petitions Widget */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-civix-dark-brown dark:text-civix-sandal flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-civix-dark-brown dark:text-civix-sandal">Solar Panel Schools</span>
                    <Badge className="bg-civix-civic-green text-white text-xs">Hot</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-civix-dark-brown dark:text-civix-sandal">Bike Lane Expansion</span>
                    <Badge variant="outline" className="border-civix-civic-green text-civix-civic-green text-xs">Rising</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-civix-dark-brown dark:text-civix-sandal">Library Hours Extension</span>
                    <Badge variant="outline" className="border-civix-warm-beige dark:border-civix-sandal text-civix-dark-brown dark:text-civix-sandal text-xs">New</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transparency Stats */}
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-civix-dark-brown dark:text-civix-sandal">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl text-civix-civic-green" style={{ fontWeight: '700' }}>147</div>
                    <div className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">Petitions Created</div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '700' }}>23</div>
                    <div className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">Official Responses</div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl text-civix-civic-green" style={{ fontWeight: '700' }}>89%</div>
                    <div className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">Citizen Participation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-civix-warm-beige dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-civix-dark-brown/70 dark:text-civix-sandal/70">
            <p>Civix – Empowering Citizens | © 2025</p>
          </div>
        </div>
      </footer>

      {/* Volunteer Registration Sheet */}
      <Sheet open={volunteerSheetOpen} onOpenChange={setVolunteerSheetOpen}>
        <SheetContent 
          side="right" 
          className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-2xl text-civix-dark-brown dark:text-civix-sandal flex items-center">
              <UserPlus className="w-6 h-6 mr-2 text-civix-civic-green" />
              Volunteer Registration
            </SheetTitle>
            <SheetDescription className="text-civix-dark-brown/70 dark:text-civix-sandal/70">
              Join our volunteer network and help make a difference in your community
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    registrationStep >= step 
                      ? 'bg-civix-civic-green text-white' 
                      : 'bg-civix-warm-beige dark:bg-gray-700 text-civix-dark-brown dark:text-civix-sandal'
                  }`}>
                    {registrationStep > step ? <Check className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      registrationStep > step 
                        ? 'bg-civix-civic-green' 
                        : 'bg-civix-warm-beige dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Select Work Categories */}
            {registrationStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
                    Select Your Preferred Volunteer Work
                  </h3>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-6">
                    Choose one or more categories that match your interests and skills
                  </p>
                </div>

                <div className="space-y-3">
                  {volunteerCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCategories.includes(category.id)
                            ? 'border-civix-civic-green bg-civix-civic-green/10 dark:bg-civix-civic-green/20'
                            : 'border-civix-warm-beige dark:border-gray-600 hover:border-civix-civic-green/50 dark:hover:border-civix-civic-green/50'
                        }`}
                      >
                        <Checkbox 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <div className={`p-2 rounded-lg ${
                              selectedCategories.includes(category.id)
                                ? 'bg-civix-civic-green/20'
                                : 'bg-civix-warm-beige dark:bg-gray-700'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                selectedCategories.includes(category.id)
                                  ? 'text-civix-civic-green'
                                  : 'text-civix-dark-brown dark:text-civix-sandal'
                              }`} />
                            </div>
                            <h4 className="text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '600' }}>
                              {category.name}
                            </h4>
                          </div>
                          <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => {
                      if (selectedCategories.length === 0) {
                        toast.error('Please select at least one category');
                        return;
                      }
                      setRegistrationStep(2);
                    }}
                    className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Notification Preferences */}
            {registrationStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-6">
                    Choose how you'd like to receive updates about volunteer opportunities
                  </p>
                </div>

                <Card className="bg-civix-warm-beige/50 dark:bg-gray-700/50 border-civix-warm-beige dark:border-gray-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="bg-civix-civic-green/20 p-3 rounded-lg">
                          <Bell className="w-6 h-6 text-civix-civic-green" />
                        </div>
                        <div>
                          <Label htmlFor="email-notifications" className="text-lg text-civix-dark-brown dark:text-civix-sandal cursor-pointer" style={{ fontWeight: '600' }}>
                            Email Notifications
                          </Label>
                          <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mt-1">
                            Receive Gmail notifications when new work assignments are available
                          </p>
                        </div>
                      </div>
                      <Switch 
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        className="ml-4"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm text-blue-900 dark:text-blue-300 mb-1" style={{ fontWeight: '600' }}>
                        Stay Informed
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        We'll only send you relevant notifications for assignments matching your selected categories. You can change this anytime.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    onClick={() => setRegistrationStep(1)}
                    variant="outline"
                    className="border-civix-warm-beige dark:border-gray-600"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setRegistrationStep(3)}
                    className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {registrationStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
                    Confirm Your Registration
                  </h3>
                  <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70 mb-6">
                    Review your selections before completing registration
                  </p>
                </div>

                <Card className="bg-civix-warm-beige/50 dark:bg-gray-700/50 border-civix-warm-beige dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-civix-dark-brown dark:text-civix-sandal">
                      Selected Work Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {volunteerCategories
                        .filter(cat => selectedCategories.includes(cat.id))
                        .map((category) => {
                          const Icon = category.icon;
                          return (
                            <div 
                              key={category.id} 
                              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                            >
                              <div className="bg-civix-civic-green/20 p-2 rounded-lg">
                                <Icon className="w-5 h-5 text-civix-civic-green" />
                              </div>
                              <div>
                                <h4 className="text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '600' }}>
                                  {category.name}
                                </h4>
                                <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-civix-warm-beige/50 dark:bg-gray-700/50 border-civix-warm-beige dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-civix-dark-brown dark:text-civix-sandal">
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        emailNotifications 
                          ? 'bg-civix-civic-green/20' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Bell className={`w-5 h-5 ${
                          emailNotifications 
                            ? 'text-civix-civic-green' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-civix-dark-brown dark:text-civix-sandal" style={{ fontWeight: '600' }}>
                          Email Notifications: {emailNotifications ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-sm text-civix-dark-brown/70 dark:text-civix-sandal/70">
                          {emailNotifications 
                            ? 'You will receive email updates for new assignments'
                            : 'You will not receive email notifications'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-civix-civic-green/10 dark:bg-civix-civic-green/20 border border-civix-civic-green/30 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-civix-civic-green/20 p-3 rounded-lg">
                      <Check className="w-6 h-6 text-civix-civic-green" />
                    </div>
                    <div>
                      <h4 className="text-lg text-civix-dark-brown dark:text-civix-sandal mb-2" style={{ fontWeight: '600' }}>
                        You're Almost Ready!
                      </h4>
                      <p className="text-civix-dark-brown/80 dark:text-civix-sandal/80">
                        Click "Complete Registration" to finish and start receiving volunteer assignments that match your preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    onClick={() => setRegistrationStep(2)}
                    variant="outline"
                    className="border-civix-warm-beige dark:border-gray-600"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleVolunteerRegistration}
                    className="bg-gradient-to-r from-civix-civic-green to-civix-dark-brown text-white px-8"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Complete Registration
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
