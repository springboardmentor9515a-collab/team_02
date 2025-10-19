import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
// CORRECTED: Path is now lowercase as you specified.
import { ThemeProvider } from "@/components/theme-provider"; 
import { Page, UserData } from "@/types";

// --- COMPONENT IMPORTS ---
// CORRECTED: Filename casing for LandingPage must be exact.
import LandingPage from "@/components/pages/Landingpage"; // Changed to uppercase 'L'
import SignUpPage from "@/components/pages/SignUpPage";
import LoginPage from "@/components/pages/LoginPage";
import Dashboard from "@/components/pages/Dashboard";
import PetitionsModule from "@/components/pages/PetitionsModule";
import PollsModule from "@/components/pages/pollsmodule";
import ReportsModule from "@/components/pages/ReportsModule";
import MessagesModule from "@/components/pages/MessageModule";
import ComplaintsModule from "@/components/pages/ComplaintsModule";
import AdminDashboard from "@/components/pages/AdminDashboard";
import VolunteerDashboard from "@/components/pages/VolunteerDashboard";
import RequestPasswordReset from './components/pages/RequestPasswordReset';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const navigate = (page: Page, itemId?: string) => {
    setCurrentPage(page);
    setSelectedItemId(itemId || null);
  };

  const handleLogin = (user: UserData) => {
    setUserData(user);
    // After successful login, always navigate to the dashboard.
    if (user) {
      setCurrentPage('dashboard');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'signup':
        return <SignUpPage onNavigate={navigate} onSignUp={handleLogin} />;
      case 'login':
        return <LoginPage onNavigate={navigate} onLogin={handleLogin} />;
      case 'request-password-reset':
        return <RequestPasswordReset onNavigate={navigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigate} userName={userData?.fullName || 'User'} />;
      case 'petitions':
        return <PetitionsModule onNavigate={navigate} selectedItemId={selectedItemId} userName={userData?.fullName || 'User'} />;
      case 'polls':
        return <PollsModule onNavigate={navigate} selectedItemId={selectedItemId} userName={userData?.fullName || 'User'} />;
      case 'reports':
        return <ReportsModule onNavigate={navigate} selectedItemId={selectedItemId} userName={userData?.fullName || 'User'} />;
      case 'messages':
        return <MessagesModule onNavigate={navigate} selectedItemId={selectedItemId} userName={userData?.fullName || 'User'} />;
      case 'complaints':
        return <ComplaintsModule onNavigate={navigate} userName={userData?.fullName || 'User'} />;
      case 'admin':
        return <AdminDashboard onNavigate={navigate} userName={userData?.fullName || 'Admin'} />;
      case 'volunteer':
        return <VolunteerDashboard onNavigate={navigate} userName={userData?.fullName || 'User'} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    // CORRECTED: Using the props that match your custom ThemeProvider
    <ThemeProvider defaultTheme="system" storageKey="civix-theme">
      <div className="min-h-screen bg-background">
        {renderPage()}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
