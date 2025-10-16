import React, { useState } from 'react';
import { Home, FileText, Vote, BarChart3, MessageSquare, Bell, LogOut, ArrowLeft, MailCheck, TrendingUp, MapPin, Clock, ThumbsUp, Plus, Search, Eye, Share2, Target, Phone, Video, Send, Settings, CheckCircle, AlertCircle, XCircle, Camera, ShieldCheck } from "lucide-react";

// --- UI Component Definitions (Styled to match your design) ---
const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string; }) => <button className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-civix-civic-green ${className}`} {...props}>{children}</button>;
const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl text-civix-dark-brown transition-all hover:shadow-2xl ${className}`} {...props}>{children}</div>;
const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`p-6 ${className}`} {...props}>{children}</div>;
const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className={`text-xl font-bold text-civix-dark-brown ${className}`} {...props}>{children}</h2>;
const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-gray-500" {...props}>{children}</p>;
const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`p-6 ${className}`} {...props}>{children}</div>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="w-full p-2 border rounded-md bg-civix-light-gray border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green text-civix-dark-brown" {...props} />;
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label className="block text-sm font-medium text-left text-civix-dark-brown mb-1" {...props}>{children}</label>;
const Badge = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`} {...props}>{children}</span>;
const Progress = ({ value }: { value: number }) => (
    <div className="w-full bg-civix-warm-beige rounded-full h-2 overflow-hidden"><div className="bg-civix-civic-green h-2 rounded-full transition-all" style={{ width: `${value}%` }}></div></div>
);
const Avatar = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center ${className}`} {...props}>{children}</div>;
const AvatarImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img className="aspect-square h-full w-full" {...props} />;
const AvatarFallback = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={`flex h-full w-full items-center justify-center rounded-full text-white font-semibold ${className}`} {...props}>{children}</span>;
const ResizablePanelGroup = (props: any) => <div className="flex h-full w-full rounded-xl overflow-hidden" {...props} />;
const ResizablePanel = (props: any) => <div {...props} />;
const ResizableHandle = (props: any) => <div className="w-px bg-civix-warm-beige cursor-col-resize" {...props} />;
const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => onOpenChange && onOpenChange(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl text-civix-dark-brown animate-scale-in" onClick={e => e.stopPropagation()}>{children}</div>
        </div>
    );
};
const DialogContent = ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>;
const DialogHeader = ({ children, ...props }: { children: React.ReactNode }) => <div className="p-6 border-b" {...props}>{children}</div>;
const DialogTitle = ({ children, ...props }: { children: React.ReactNode }) => <h2 className="text-lg font-semibold text-civix-dark-brown" {...props}>{children}</h2>;
const DialogDescription = ({ children, ...props }: { children: React.ReactNode }) => <p className="text-sm text-gray-500" {...props}>{children}</p>;
const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className="w-full p-2 border rounded-md bg-civix-light-gray border-civix-warm-beige" {...props}>{children}</select>;
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="w-full p-2 border rounded-md bg-civix-light-gray border-civix-warm-beige" {...props} />;


// --- Type Definition ---
export type Page = 'landing' | 'signup' | 'login' | 'dashboard' | 'petitions' | 'polls' | 'reports' | 'messages';


// --- Shared Layout Component ---
const SharedLayout = ({ children, activePage, onNavigate }: { children: React.ReactNode; activePage: Page; onNavigate: (page: Page) => void; }) => {
    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' as Page },
        { id: 'petitions', label: 'My Petitions', icon: FileText, page: 'petitions' as Page },
        { id: 'polls', label: 'Polls & Voting', icon: Vote, page: 'polls' as Page },
        { id: 'reports', label: 'Reports', icon: BarChart3, page: 'reports' as Page },
        { id: 'messages', label: 'Messages', icon: MessageSquare, page: 'messages' as Page }
    ];
    return (
        <div className="min-h-screen bg-civix-sandal text-civix-dark-brown">
            <header className="bg-white/80 backdrop-blur-sm border-b border-civix-warm-beige shadow-sm sticky top-0 z-40">
                <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl font-bold text-civix-dark-brown">Civix</h1>
                        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                            {sidebarItems.map(item => (
                                <button key={item.id} onClick={() => onNavigate(item.page)} className={`pb-1 transition-colors ${activePage === item.page ? "text-civix-civic-green border-b-2 border-civix-civic-green" : "hover:text-civix-civic-green"}`}>
                                    {item.label === 'My Petitions' ? 'Petitions' : item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5 text-civix-dark-brown" />
                            <span className="absolute top-0 right-0 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </Button>
                        <Avatar><AvatarFallback className="bg-civix-civic-green">JD</AvatarFallback></Avatar>
                        <div className="hidden md:block"><p className="text-sm font-semibold text-civix-dark-brown">John Doe</p></div>
                        <Button variant="ghost" size="icon" onClick={() => onNavigate('landing')}><LogOut className="w-5 h-5 text-civix-dark-brown" /></Button>
                    </div>
                </div>
            </header>
            <main className="max-w-screen-xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    <aside className="lg:col-span-3">
                        <Card className="p-4">
                            <nav className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <Button key={item.id} variant={activePage === item.page ? "default" : "ghost"} className={`w-full justify-start text-base p-6 ${activePage === item.page ? "bg-civix-civic-green text-white" : "text-civix-dark-brown hover:bg-civix-warm-beige"}`} onClick={() => onNavigate(item.page)}>
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </Button>
                                ))}
                            </nav>
                        </Card>
                         <Card className="p-4 mt-6">
                            <CardHeader className="p-2 !pb-2"><CardTitle className="text-lg flex items-center"><ShieldCheck className="mr-2 text-civix-civic-green"/>Community Impact</CardTitle></CardHeader>
                            <CardContent className="p-2 !pt-0">
                                <p className="text-4xl font-bold text-civix-civic-green">750</p>
                                <p className="text-xs text-gray-500">Your engagement score this month</p>
                            </CardContent>
                        </Card>
                    </aside>
                    <section className="lg:col-span-9">{children}</section>
                </div>
            </main>
        </div>
    );
};

// --- Page Component Definitions (Fully Styled) ---

const LandingPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
    <div className="relative min-h-screen text-[#5A3825] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2000')` }} />
        <div className="absolute inset-0 bg-[#F5DEB3] opacity-80" />
        <div className="relative z-10 flex flex-col min-h-screen">
            <header className="flex justify-between items-center p-6"><h1 className="text-2xl font-bold">Civix</h1><nav className="flex items-center gap-4"><Button onClick={() => onNavigate('login')} variant="ghost">Login</Button><Button onClick={() => onNavigate('signup')} className="bg-[#4CAF50] text-white">Sign Up</Button></nav></header>
            <main className="flex-1 flex items-center justify-center text-center">
                <div>
                    <h1 className="text-7xl font-bold" style={{ lineHeight: '1.2' }}>Your Voice.<br/>Your Power.<br/>Your Civix.</h1>
                    <p className="mt-4 text-lg">Engage in petitions, polls, and civic discussions that matter to your community.</p>
                    <Button onClick={() => onNavigate('login')} className="mt-8 bg-[#5A3825] text-white px-8 py-3 text-lg">Get Started</Button>
                </div>
            </main>
        </div>
    </div>
);

const LoginPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
    const [view, setView] = useState<'login' | 'reset' | 'confirmation'>('login');
    const [email, setEmail] = useState('');
    const handleLoginSubmit = (e: React.FormEvent) => { e.preventDefault(); onNavigate('dashboard'); };
    const handleResetSubmit = (e: React.FormEvent) => { e.preventDefault(); setView('confirmation'); };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F5DEB3]">
            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="w-full px-6 py-4"><Button variant="ghost" size="sm" onClick={() => onNavigate('landing')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></header>
                <main className="flex-1 flex items-center justify-center px-6">
                    <Card className="w-full max-w-md">
                        {view === 'login' && <CardHeader className="text-center !pb-2"><CardTitle className="text-3xl">Welcome Back</CardTitle><CardDescription className="text-base !pt-0">Login to continue your civic journey.</CardDescription></CardHeader>}
                        {view === 'reset' && <CardHeader className="text-center !pb-2"><CardTitle className="text-3xl">Reset Password</CardTitle><CardDescription className="text-base !pt-0">Enter your email to receive a reset link.</CardDescription></CardHeader>}
                        
                        {view !== 'confirmation' ? (
                            <CardContent className="!pt-6">
                                {view === 'login' && (
                                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                                        <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="Enter your email" required onChange={(e) => setEmail(e.target.value)} /></div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><Label htmlFor="password">Password</Label><button type="button" onClick={() => setView('reset')} className="text-sm font-medium text-[#4CAF50] hover:underline">Forgot password?</button></div>
                                            <Input id="password" type="password" placeholder="Enter your password" required />
                                        </div>
                                        <Button type="submit" className="w-full text-white py-6 text-lg" style={{ background: 'linear-gradient(to right, #5A3825, #4CAF50)', fontWeight: 600 }}>Login</Button>
                                    </form>
                                )}
                                {view === 'reset' && (
                                    <form onSubmit={handleResetSubmit} className="space-y-6">
                                        <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="Enter your email" required onChange={(e) => setEmail(e.target.value)} /></div>
                                        <Button type="submit" className="w-full text-white py-6 text-lg" style={{ background: 'linear-gradient(to right, #5A3825, #4CAF50)', fontWeight: 600 }}>Send Reset Link</Button>
                                    </form>
                                )}
                                <div className="mt-6 text-center text-sm"><p className="text-gray-600">
                                    {view === 'login' ? "Don't have an account? " : "Remember your password? "}
                                    <a onClick={() => view === 'login' ? onNavigate('signup') : setView('login')} className="font-semibold text-[#4CAF50] hover:underline cursor-pointer">{view === 'login' ? 'Sign up here' : 'Back to Login'}</a>
                                </p></div>
                            </CardContent>
                        ) : (
                            <CardContent className="text-center py-12 !pt-12">
                                <MailCheck className="w-16 h-16 mx-auto text-[#4CAF50] mb-4" />
                                <h2 className="text-2xl font-bold text-[#5A3825] mb-2">Check Your Email</h2>
                                <p className="text-[#5A3825]/70 mb-6">We've sent a password reset link to <span className="font-semibold">{email}</span>.</p>
                                <Button variant="outline" onClick={() => setView('login')} className="w-full py-6 text-lg"><ArrowLeft className="w-4 h-4 mr-2" />Back to Login</Button>
                            </CardContent>
                        )}
                    </Card>
                </main>
            </div>
        </div>
    );
};

const SignUpPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F5DEB3]">
          <div className="relative z-10 flex flex-col min-h-screen">
            <header className="w-full px-6 py-4"><h1 className="text-3xl font-bold bg-gradient-to-r from-[#5A3825] to-[#4CAF50] bg-clip-text text-transparent" style={{ fontWeight: 700 }}>Civix</h1></header>
            <main className="flex-1 flex items-center justify-center px-6">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center !pb-2">
                  <CardTitle className="text-3xl">Create Your Account</CardTitle>
                  <CardDescription className="text-base !pt-0">Join Civix and start making change today.</CardDescription>
                </CardHeader>
                <CardContent className="!pt-6">
                    <form onSubmit={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="space-y-4">
                        <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Enter your full name" required/></div>
                        <div className="space-y-2"><Label>Email Address</Label><Input type="email" placeholder="Enter your email" required/></div>
                        <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Create a password" required/></div>
                        <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="Confirm your password" required/></div>
                        <Button type="submit" className="w-full text-white py-6 text-lg" style={{ background: 'linear-gradient(to right, #5A3825, #4CAF50)', fontWeight: 600 }}>Sign Up</Button>
                    </form>
                    <div className="mt-6 text-center text-sm"><p className="text-gray-600">Already have an account? <a onClick={() => onNavigate('login')} className="font-semibold text-[#4CAF50] hover:underline cursor-pointer">Login here</a></p></div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
    );
};

const Dashboard = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
    <div className="space-y-6">
        <Card className="bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white">
            <CardContent className="p-6 !pt-6">
                <h2 className="text-3xl font-bold">Welcome back, John!</h2>
                <p>Ready to make a difference in your community today?</p>
            </CardContent>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardHeader className="!pb-2"><CardTitle className="text-sm text-civix-dark-brown">Total Petitions</CardTitle></CardHeader><CardContent className="!pt-0"><p className="text-3xl font-bold text-civix-dark-brown">12</p></CardContent></Card>
            <Card><CardHeader className="!pb-2"><CardTitle className="text-sm text-civix-dark-brown">Active Polls</CardTitle></CardHeader><CardContent className="!pt-0"><p className="text-3xl font-bold text-civix-dark-brown">8</p></CardContent></Card>
            <Card><CardHeader className="!pb-2"><CardTitle className="text-sm text-civix-dark-brown">Reports Submitted</CardTitle></CardHeader><CardContent className="!pt-0"><p className="text-3xl font-bold text-civix-dark-brown">5</p></CardContent></Card>
             <Card><CardHeader className="!pb-2"><CardTitle className="text-sm text-civix-dark-brown">Messages</CardTitle></CardHeader><CardContent className="!pt-0"><p className="text-3xl font-bold text-civix-dark-brown">4</p></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 !pt-0">
                        <Button onClick={() => onNavigate('petitions')} className="bg-civix-civic-green text-white h-24 flex flex-col gap-2"><FileText /> Create Petition</Button>
                        <Button onClick={() => onNavigate('reports')} className="bg-civix-civic-green text-white h-24 flex flex-col gap-2"><BarChart3 /> Submit Report</Button>
                        <Button onClick={() => onNavigate('polls')} className="bg-civix-civic-green text-white h-24 flex flex-col gap-2"><Vote /> Start Poll</Button>
                        <Button onClick={() => onNavigate('messages')} className="bg-civix-civic-green text-white h-24 flex flex-col gap-2"><MessageSquare /> View Messages</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center"><TrendingUp className="mr-2"/>Trending Now</CardTitle></CardHeader>
                    <CardContent className="space-y-4 !pt-0">
                        <div className="flex justify-between items-center"><span className="font-medium text-civix-dark-brown">Solar Panel Schools</span><Badge className="bg-red-500 text-white">Hot</Badge></div>
                        <div className="flex justify-between items-center"><span className="font-medium text-civix-dark-brown">Bike Lane Expansion</span><Badge className="bg-green-500 text-white">Rising</Badge></div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="h-full">
                    <CardHeader><CardTitle>Quick Poll</CardTitle><CardDescription>How would you rate your city's response?</CardDescription></CardHeader>
                    <CardContent className="flex flex-col gap-2 !pt-0">
                        <Button variant="outline" className="w-full justify-start">Excellent</Button>
                        <Button variant="outline" className="w-full justify-start">Good</Button>
                        <Button variant="outline" className="w-full justify-start">Fair</Button>
                        <Button variant="outline" className="w-full justify-start">Poor</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
);

const PetitionsModule = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-civix-dark-brown">Petitions</h2>
                <p className="text-gray-500">Make your voice heard on issues that matter</p>
            </div>
            <Button className="bg-civix-civic-green text-white" onClick={() => setIsCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2" />Create Petition</Button>
          </div>
          <Card><CardContent className="p-4 flex gap-4"><Input placeholder="Search petitions..." className="flex-grow"/><Select><option value="all">All Categories</option></Select><Select><option value="all">All Status</option></Select></CardContent></Card>
          <Card>
              <CardContent className="p-6 !pt-6">
                  <h3 className="text-lg font-semibold text-civix-dark-brown">Improve Public Transportation in Downtown</h3>
                  <p className="text-sm text-gray-600 my-2">Requesting more frequent bus routes...</p>
                  <Progress value={62} className="my-2" />
                  <div className="flex justify-between text-xs text-gray-500"><span>1,247 / 2,000</span><span>15 days left</span></div>
              </CardContent>
          </Card>
           <Card>
              <CardContent className="p-6 !pt-6">
                  <h3 className="text-lg font-semibold text-civix-dark-brown">Install Solar Panels in Public Schools</h3>
                  <p className="text-sm text-gray-600 my-2">Initiative to make our schools more sustainable...</p>
                  <Progress value={96} className="my-2" />
                  <div className="flex justify-between text-xs text-gray-500"><span>2,891 / 3,000</span><span>8 days left</span></div>
              </CardContent>
          </Card>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Create New Petition</DialogTitle>
                      <DialogDescription>Fill out the details below to start your petition.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2"><Label>Petition Title</Label><Input placeholder="A clear and concise title" /></div>
                      <div className="space-y-2"><Label>Summary</Label><Textarea placeholder="Briefly describe your petition's goal" /></div>
                      <div className="space-y-2"><Label>Category</Label>
                          <Select>
                              <option value="" disabled selected>Select a category</option>
                              <option value="transportation">Transportation</option>
                              <option value="environment">Environment</option>
                              <option value="community">Community</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="education">Education</option>
                          </Select>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                          <Button className="bg-civix-civic-green text-white">Create</Button>
                      </div>
                  </div>
              </DialogContent>
          </Dialog>
        </div>
    );
};
const PollsModule = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-civix-dark-brown">Polls & Voting</h2>
                    <p className="text-gray-500">Participate in community decision-making</p>
                </div>
                <Button className="bg-civix-civic-green text-white" onClick={() => setIsCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2" />Create Poll</Button>
            </div>
            <Card><CardContent className="p-4">{/* Search and Filter bar */}</CardContent></Card>
            <Card>
                <CardContent className="p-6 !pt-6">
                    <h3 className="text-lg font-semibold text-civix-dark-brown">What should be the priority for next year's city budget?</h3>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>900 votes</span>
                        <span>Ends in 3 days</span>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-6 !pt-6">
                    <h3 className="text-lg font-semibold text-civix-dark-brown">Should the city implement a bike-sharing program?</h3>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>877 votes</span>
                        <span>Ends in 1 week</span>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogContent>
                  <DialogHeader><DialogTitle>Create New Poll</DialogTitle><DialogDescription>Gather community opinions.</DialogDescription></DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2"><Label>Poll Question</Label><Input placeholder="What would you like to ask?" /></div>
                      <div className="space-y-2"><Label>Options</Label><Input placeholder="Option 1" /><Input placeholder="Option 2" /></div>
                      <div className="space-y-2"><Label>Category</Label>
                          <Select>
                              <option value="" disabled selected>Select a category</option>
                              <option value="budget">Budget</option>
                              <option value="transportation">Transportation</option>
                              <option value="community">Community</option>
                              <option value="other">Other</option>
                          </Select>
                      </div>
                      <div className="flex justify-end gap-2 mt-6"><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button className="bg-civix-civic-green text-white">Create</Button></div>
                  </div>
              </DialogContent>
            </Dialog>
        </div>
    );
};
const ReportsModule = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-civix-dark-brown">Community Reports</h2>
                    <p className="text-gray-500">Report issues and track progress in your community</p>
                </div>
                <Button className="bg-civix-civic-green text-white" onClick={() => setIsCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2" />Submit Report</Button>
            </div>
            <Card><CardContent className="p-4">{/* Search and Filter bar */}</CardContent></Card>
            <Card>
                <CardContent className="p-6 !pt-6">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-civix-dark-brown">Broken Streetlight on Main Street</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">The streetlight at the intersection of Main Street and Oak Avenue has been out for over a week...</p>
                </CardContent>
            </Card>
             <Card>
                <CardContent className="p-6 !pt-6">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-civix-dark-brown">Pothole on Elm Street</h3>
                        <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Large pothole near 123 Elm Street is causing damage to vehicles...</p>
                </CardContent>
            </Card>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Submit New Report</DialogTitle><DialogDescription>Report an issue to help improve your community.</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Report Title</Label><Input placeholder="Brief, descriptive title" /></div>
                        <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Provide detailed information about the issue" /></div>
                        <div className="space-y-2"><Label>Category</Label>
                            <Select>
                                <option value="" disabled selected>Select a category</option>
                                <option value="road-maintenance">Road Maintenance</option>
                                <option value="public-safety">Public Safety</option>
                                <option value="sanitation">Sanitation</option>
                                <option value="parks">Parks & Rec</option>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6"><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button className="bg-civix-civic-green text-white">Submit</Button></div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
const MessagesModule = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
    <div className="h-[calc(100vh-12rem)]">
        <Card className="h-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={30} minSize={25}>
                    <div className="p-4 border-r h-full">
                        <h2 className="text-xl font-bold">Messages</h2>
                        {/* Conversation List */}
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={70}>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b">Chat with Mayor Johnson</div>
                        <div className="flex-grow p-4">Messages here...</div>
                        <div className="p-4 border-t"><Input placeholder="Type your message..." /></div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </Card>
    </div>
);


// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={navigate} />;
      case 'signup': return <SignUpPage onNavigate={navigate} />;
      case 'login': return <LoginPage onNavigate={navigate} />;
      default:
        return (
          <SharedLayout activePage={currentPage} onNavigate={navigate}>
            {
              {
                'dashboard': <Dashboard onNavigate={navigate} />,
                'petitions': <PetitionsModule onNavigate={navigate} />,
                'polls': <PollsModule onNavigate={navigate} />,
                'reports': <ReportsModule onNavigate={navigate} />,
                'messages': <MessagesModule onNavigate={navigate} />
              }[currentPage]
            }
          </SharedLayout>
        );
    }
  };

  return (
    <div className="bg-[#F5DEB3]">
      {renderPage()}
    </div>
  );
}

