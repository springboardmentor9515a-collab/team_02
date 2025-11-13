import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Page } from '@/types';
import { toast } from 'sonner';
import { authAPI, setAuthToken } from '@/lib/api';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
    onLogin: (user: { fullName: string; email: string; token: string; }) => void;
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await authAPI.login(email, password);
            // backend now returns { token, user }
            if (res?.token) {
                setAuthToken(res.token);
                const user = {
                    fullName: res.user?.fullName || '',
                    email: res.user?.email || email,
                    token: res.token,
                };
                localStorage.setItem('user', JSON.stringify(user));
                onLogin(user);
                setErrorMessage(null);
                toast.success('Login successful!');
            } else {
                const msg = res?.error || 'Login failed';
                setErrorMessage(msg);
                toast.error(msg);
            }
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'Login failed';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
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
                            
                            {/* Login uses real backend accounts */}
                            
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
                                    {errorMessage && (
                                        <div className="text-sm text-red-600 dark:text-red-400 mx-6">{errorMessage}</div>
                                    )}
                                  

                                 

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