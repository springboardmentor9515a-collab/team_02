import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Page } from '@/types';
import { toast } from 'sonner';
import axios from 'axios';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
    onLogin: (user: { fullName: string; email: string; token: string; }) => void;
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate a successful login for frontend development
        // We will call onLogin directly without a real API call.
        // The backend developer can uncomment the try/catch block later.
        setTimeout(() => {
            const mockUser = { fullName: fullName || 'Logged In User', email: email, token: 'fake-jwt-token' };
            onLogin(mockUser);
            toast.success('Login successful! (Simulated)');
            setIsLoading(false);
        }, 1000); // Simulate network delay
    };

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
                            
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-civix-dark-brown">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-civix-dark-brown">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-civix-dark-brown">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => onNavigate('request-password-reset')}
                                            className="text-sm text-civix-dark-brown hover:text-civix-civic-green hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <Button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                        style={{ fontWeight: '600' }}
                                    >
                                        {isLoading ? 'Logging in...' : 'Login'}
                                    </Button>
                                </form>

                                <div className="mt-6 space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-civix-warm-beige" /></div>
                                        <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-civix-dark-brown/60">or</span></div>
                                    </div>

                                    <Button 
                                        type="button"
                                        variant="outline"
                                        className="w-full border-civix-warm-beige text-civix-dark-brown hover:bg-civix-light-gray py-6 text-lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Continue with Google
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-civix-dark-brown/70">
                                            Don't have an account?{' '}
                                            <button onClick={() => onNavigate('signup')} className="text-civix-civic-green hover:underline" style={{ fontWeight: '600' }}>
                                                Sign up here
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}