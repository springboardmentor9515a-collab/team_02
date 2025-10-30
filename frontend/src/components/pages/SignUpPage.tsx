import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface SignUpPageProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void;
  onSignUp: (userData: { fullName: string; email: string; location?: string }) => void;
}

export default function SignUpPage({ onNavigate, onSignUp }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    password: '',
    confirmPassword: ''
  });

  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{ city?: string; lat?: number; lon?: number }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}
          );
          const data = await res.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown";

          setFormData(prev => ({
            ...prev,
            location: city,
          }));

          setDetectedInfo({
            city,
            lat: latitude,
            lon: longitude
          });
        } catch (error) {
          console.error("Error fetching location:", error);
          alert("Unable to detect your location.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        alert("Unable to retrieve your location. Please allow access in your browser.");
        setDetecting(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up form submitted:', formData);
    onSignUp({
      fullName: formData.fullName,
      email: formData.email,
      location: formData.location
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: url('https://images.unsplash.com/photo-1727702872022-927491562edb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNpdmljJTIwcGF0dGVybiUyMHZvdGluZyUyMGRlbW9jcmFjeXxlbnwxfHx8fDE3NTg3MTgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background: 'linear-gradient(160deg, #F5DEB3, #EAD8C0)'
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
                  Create Your Account
                </CardTitle>
                <CardDescription
                  className="text-lg text-civix-dark-brown/70"
                  style={{ fontWeight: '400' }}
                >
                  Join Civix and start making change today.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-civix-dark-brown">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-civix-dark-brown">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                      required
                    />
                  </div>

                  {/* LOCATION INPUT WITH DETECT BUTTON */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-civix-dark-brown">
                      Location
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="Enter your city or area"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green flex-1"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detecting}
                        className="bg-civix-civic-green text-white px-4"
                      >
                        {detecting ? "Detecting..." : "Detect"}
                      </Button>
                    </div>
                    {detectedInfo.city && (
                      <p className="text-sm text-civix-dark-brown/70 mt-1">
                        Detected: {detectedInfo.city} ({detectedInfo.lat?.toFixed(2)}, {detectedInfo.lon?.toFixed(2)})
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-civix-dark-brown">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-civix-dark-brown">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity"
                    style={{ fontWeight: '600' }}
                  >
                    Sign Up
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-4">
                  <p className="text-civix-dark-brown/70">
                    Already have an account?{' '}
                    <button
                      onClick={() => onNavigate('login')}
                      className="text-civix-civic-green hover:underline"
                      style={{ fontWeight: '600' }}
                    >
                      Login here
                    </button>
                  </p>

                  <p className="text-sm text-civix-dark-brown/60 px-4">
                    By signing up, you agree to Civix's Terms & Privacy Policy.
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