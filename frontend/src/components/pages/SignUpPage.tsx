import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type NominatimReverseResponse = {
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

const API_BASE_URL = 'http://localhost:5000'; // <-- CHANGE THIS PORT IF NEEDED

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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{ city?: string; lat?: number; lon?: number }>({});
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  // Custom marker icon for Leaflet (fixes missing marker icon issue)
  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  function LocationSelector() {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        // Reverse geocode to get city/location name
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&accept-language=en`)
          .then((res: Response) => res.json())
          .then((data: NominatimReverseResponse) => {
        const locationName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.suburb ||
          data.address.county ||
          data.address.state ||
          "Unknown Location";
        setFormData((prev: typeof formData) => ({ ...prev, location: locationName }));
        setDetectedInfo({ city: locationName, lat: e.latlng.lat, lon: e.latlng.lng });
        setShowMap(false);
          });
      },
    });
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          
          if (!response.ok) throw new Error('Failed to fetch location data.');

          const data = await response.json();
          console.log("Full address data from API:", data.address);

          const locationName = 
            data.address.city || 
            data.address.town || 
            data.address.village || 
            data.address.suburb || 
            data.address.county || 
            data.address.state || 
            "Unknown Location";

          setFormData(prev => ({ ...prev, location: locationName }));
          setDetectedInfo({ city: locationName, lat: latitude, lon: longitude });

        } catch (error: any) {
          console.error("Error fetching location:", error);
          setError("Unable to auto-detect your location. Please enter it manually.");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        setError("Location access was denied. Please allow access or enter it manually.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          location: formData.location,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred.');
      }

      console.log('Signup successful:', data);
      onSignUp({
        fullName: data.fullName,
        email: data.email,
        location: data.location,
      });

    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background and UI */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1727702872022-927491562edb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNpdmljJTIwcGF0dGVybiUyMHZvdGluZyUyMGRlbW9jcmFjeXxlbnwxfHx8fDE3NTg3MTgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }} />
      <div className="absolute inset-0 opacity-95" style={{ background: 'linear-gradient(160deg, #F5DEB3, #EAD8C0)' }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('landing')} className="text-civix-dark-brown hover:bg-civix-dark-brown/10 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-civix-dark-brown to-civix-civic-green bg-clip-text text-transparent" style={{ fontWeight: '700' }}>Civix</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl text-civix-dark-brown" style={{ fontWeight: '700' }}>Create Your Account</CardTitle>
                <CardDescription className="text-lg text-civix-dark-brown/70" style={{ fontWeight: '400' }}>Join Civix and start making change today.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form fields */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-civix-dark-brown">Full Name</Label>
                    <Input id="fullName" name="fullName" type="text" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-civix-dark-brown">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-civix-dark-brown">Location</Label>
                    <div className="flex gap-2">
                      <Input id="location" name="location" type="text" placeholder="Enter city or allow detection" value={formData.location} onChange={handleInputChange} className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green flex-1" required readOnly={showMap} />
                      <Button type="button" onClick={handleDetectLocation} disabled={detecting} className="bg-civix-civic-green text-white px-4">
                        {detecting ? "Detecting..." : "Detect"}
                      </Button>
                      <Button type="button" onClick={() => setShowMap(v => !v)} className="bg-civix-dark-brown text-white px-4">
                        Choose from Map
                      </Button>
                    </div>
                    {showMap && (
                      <div style={{ zIndex: 1000, marginTop: 12, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                        <MapContainer
                          center={mapPosition || [20.5937, 78.9629]} // Center on India by default
                          zoom={5}
                          style={{ height: 300, width: '100%' }}
                          scrollWheelZoom={true}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationSelector />
                          {mapPosition && <Marker position={mapPosition} icon={markerIcon} />}
                        </MapContainer>
                        <div className="flex justify-end mt-2">
                          <Button type="button" variant="outline" onClick={() => setShowMap(false)} className="text-civix-dark-brown">Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-civix-dark-brown">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleInputChange} className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-civix-dark-brown">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} className="border-civix-warm-beige focus:border-civix-civic-green focus:ring-civix-civic-green" required />
                  </div>
                  {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-civix-dark-brown to-civix-civic-green text-white py-6 text-lg hover:opacity-90 transition-opacity disabled:opacity-50" style={{ fontWeight: '600' }}>
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                </form>
                <div className="mt-6 text-center space-y-4">
                  <p className="text-civix-dark-brown/70">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="text-civix-civic-green hover:underline" style={{ fontWeight: '600' }}>Login here</button>
                  </p>
                  <p className="text-sm text-civix-dark-brown/60 px-4">By signing up, you agree to Civix's Terms & Privacy Policy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}