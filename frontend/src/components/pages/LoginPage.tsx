import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MailCheck } from "lucide-react";
import React, { useState } from "react";
import { Page } from '../../App';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [view, setView] = useState<'login' | 'reset' | 'confirmation'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
    onNavigate('dashboard');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset requested for:', formData.email);
    setView('confirmation');
  };

  const renderLoginView = () => (
    <CardHeader className="text-center space-y-2">
      <CardTitle 
        className="text-3xl text-civix-dark-brown"
        style={{ fontWeight: '700' }}
      >
        Welcome Back
      </CardTitle>
      <CardDescription 
        className="text-lg text-civix-dark-brown/70"
        style={{ fontWeight: '400' }}
      >
        Login to continue your civic journey.
      </CardDescription>
    </CardHeader>
  );
  
  const renderResetView = () => (
    <CardHeader className="text-center space-y-2">
      <CardTitle 
        className="text-3xl text-civix-dark-brown"
        style={{ fontWeight: '700' }}
      >
        Reset Password
      </CardTitle>
      <CardDescription 
        className="text-lg text-civix-dark-brown/70"
        style={{ fontWeight: '400' }}
      >
        Enter your email to receive a reset link.
      </CardDescription>
    </CardHeader>
  );

  const renderConfirmationView = () => (
    <CardContent className="text-center py-12">
        <MailCheck className="w-16 h-16 mx-auto text-civix-civic-green mb-4" />
        <h2 
            className="text-2xl text-civix-dark-brown mb-2"
            style={{ fontWeight: '700' }}
        >
            Check Your Email
        </h2>
        <p className="text-civix-dark-brown/70 mb-6">
            We've sent a password reset link to <span className="font-semibold">{formData.email}</span>.
        </p>
        <Button 
            variant="outline"
            onClick={() => setView('login')}
            className="w-full border-civix-warm-beige text-civix-dark-brown hover:bg-civix-light-gray py-6 text-lg"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
        </Button>
    </CardContent>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1604420022249-87e637722439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXZpYyUyMGVuZ2FnZW1lbnQlMjBoYW5kcyUyMHJhaXNlZCUyMHZvdGluZyUyMGRlbW9jcmFjeXxlbnwxfHx8fDE3NTg3MTgzMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-95"
        style={{
          background: 'linear-gradient(180deg, #F5DEB3, #E6CBA8)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('landing')}
              className="text-civix-dark-brown hover:bg-civix-dark-brown/10 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 
              className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent"
              style={{ fontWeight: '700' }}
            >
              Civix
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              {view === 'login' && renderLoginView()}
              {view === 'reset' && renderResetView()}

              {view !== 'confirmation' ? (
                <CardContent>
                  {view === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-civix-dark-brown">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-civix-dark-brown">Password</Label>
                            <button type="button" onClick={() => setView('reset')} className="text-sm font-medium text-civix-civic-green hover:underline">Forgot password?</button>
                        </div>
                        <Input id="password" name="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity" style={{ fontWeight: '600' }}>Login</Button>
                    </form>
                  )}

                  {view === 'reset' && (
                    <form onSubmit={handleResetSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-civix-dark-brown">Email Address</Label>
                            <Input id="email" name="email" type="email" placeholder="Enter your email to reset" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity" style={{ fontWeight: '600' }}>Send Reset Link</Button>
                    </form>
                  )}

                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-civix-warm-beige" /></div>
                      <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-civix-dark-brown/60">or</span></div>
                    </div>
                    <Button type="button" variant="outline" className="w-full border-civix-warm-beige text-civix-dark-brown hover:bg-civix-light-gray py-6 text-lg">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Continue with Google
                    </Button>
                    <div className="text-center">
                        <p className="text-civix-dark-brown/70">
                            {view === 'login' ? "Don't have an account? " : "Remember your password? "}
                            <button onClick={() => view === 'login' ? onNavigate('signup') : setView('login')} className="text-civix-civic-green hover:underline" style={{ fontWeight: '600' }}>
                                {view === 'login' ? 'Sign up here' : 'Back to Login'}
                            </button>
                        </p>
                    </div>
                  </div>
                </CardContent>
              ) : (
                renderConfirmationView()
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

