import React, { useState } from 'react';
import { Page } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface RequestPasswordResetProps {
    onNavigate: (page: Page) => void;
}

const RequestPasswordReset: React.FC<RequestPasswordResetProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success(`If an account exists for ${email}, a password reset link has been sent.`);
            setIsLoading(false);
            onNavigate('login');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-civix-sandal to-civix-warm-beige p-6">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-civix-dark-brown">Forgot Password</CardTitle>
                    <CardDescription className="text-civix-dark-brown/70">
                        Enter your email to receive a reset link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-civix-dark-brown">Email Address</Label>
                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-civix-civic-green text-white hover:bg-civix-civic-green/90 py-3">
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Button variant="link" onClick={() => onNavigate('login')} className="text-civix-dark-brown">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestPasswordReset;