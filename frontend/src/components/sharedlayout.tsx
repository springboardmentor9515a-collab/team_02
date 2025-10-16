import React from 'react';
import { Page } from '@/App';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, FileText, Vote, BarChart3, MessageSquare, Bell, LogOut } from "lucide-react";
import ThemeToggle from "@/components/pages/ThemeToggle";


interface SharedLayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children, activePage, onNavigate }) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, page: 'dashboard' as Page },
    { id: 'petitions', label: 'My Petitions', icon: FileText, page: 'petitions' as Page },
    { id: 'polls', label: 'Polls & Voting', icon: Vote, page: 'polls' as Page },
    { id: 'reports', label: 'Reports', icon: BarChart3, page: 'reports' as Page },
    { id: 'messages', label: 'Messages', icon: MessageSquare, page: 'messages' as Page }
  ];

  return (
    <div className="min-h-screen bg-civix-sandal dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-civix-warm-beige dark:border-gray-700 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-civix-dark-brown dark:text-white">Civix</h1>
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                {sidebarItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => onNavigate(item.page)}
                    className={`${
                      activePage === item.page
                        ? "text-civix-civic-green border-b-2 border-civix-civic-green"
                        : "text-civix-dark-brown dark:text-civix-sandal hover:text-civix-civic-green"
                    } transition-colors pb-1`}
                  >
                    {item.label === 'My Petitions' ? 'Petitions' : item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon"><Bell className="w-5 h-5 text-civix-dark-brown dark:text-civix-sandal" /></Button>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40/4CAF50/ffffff?text=JD" />
                  <AvatarFallback className="bg-civix-civic-green text-white">JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-civix-dark-brown dark:text-white">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Civic Member</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onNavigate('landing')}><LogOut className="w-5 h-5 text-civix-dark-brown dark:text-civix-sandal" /></Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activePage === item.page ? "default" : "ghost"}
                      className={`w-full justify-start text-base p-6 ${
                        activePage === item.page 
                          ? "bg-civix-civic-green text-white" 
                          : "text-civix-dark-brown dark:text-civix-sandal hover:bg-civix-warm-beige dark:hover:bg-gray-700"
                      }`}
                      onClick={() => onNavigate(item.page)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Page-specific content goes here */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedLayout;

