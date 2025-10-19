import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Page, UserData } from '@/types'; // Correctly import UserData

// FIXED: Added onSignUp to the component's expected props
interface SignUpPageProps {
  onNavigate: (page: Page) => void;
  onSignUp: (user: UserData) => void; 
}

export default function SignUpPage({ onNavigate, onSignUp }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      // In a real app, you would use a toast notification here
      alert("Passwords do not match!");
      return;
    }
    
    // FIXED: Call the onSignUp function passed from App.tsx
    // This passes the user data up to the main App component.
    onSignUp({
        fullName: formData.fullName,
        email: formData.email,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1604420022249-87e637722439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXZpYyUyMGVuZ2FnZW1lbnQlMjBoYW5kcyUyMHJhaXNlZCUyMHZvdGluZyUyMGRlbW9jcmFjeXxlbnwxfHx8fDE3NTg3MTgzMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }} />
      <div className="absolute inset-0 opacity-95" style={{ background: 'linear-gradient(180deg, #F5DEB3, #E6CBA8)' }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('landing')} className="text-civix-dark-brown hover:bg-civix-dark-brown/10 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent" style={{ fontWeight: '700' }}>
              Civix
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl text-civix-dark-brown" style={{ fontWeight: '700' }}>
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-lg text-civix-dark-brown/70" style={{ fontWeight: '400' }}>
                  Join Civix and start making change today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-civix-dark-brown">Full Name</Label>
                    <Input id="fullName" name="fullName" type="text" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="email" className="text-civix-dark-brown">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-civix-dark-brown">Create Password</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={handleInputChange} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-civix-dark-brown">Confirm Password</Label>
                     <div className="relative">
                      <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} required />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                   </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity" style={{ fontWeight: '600' }}>
                    Sign Up
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  <p className="text-civix-dark-brown/70">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="text-civix-civic-green hover:underline" style={{ fontWeight: '600' }}>
                      Login here
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
