import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Page } from '../../App';
interface SignUpPageProps {
  onNavigate: (page: Page) => void;
}

export default function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up form submitted:', formData);
    onNavigate('dashboard');
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
                    <Label htmlFor="password" className="text-civix-dark-brown">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleInputChange} required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-civix-dark-brown">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} required />
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

