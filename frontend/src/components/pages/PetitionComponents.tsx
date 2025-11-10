        
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Share2 } from "lucide-react";
import { petitionsAPI } from '@/lib/api';
import SignPetitionDialog from './SignPetitionDialog';
import { toast } from "sonner";

interface CreatePetitionFormProps {
  onClose: () => void;
  onPetitionCreated: () => void;
}

// SignPetitionForm was removed in favor of the reusable SignPetitionDialog component
     

export function CreatePetitionForm({ onClose, onPetitionCreated }: CreatePetitionFormProps) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  // Default map center (can be changed to user's location)
  const defaultPosition: [number, number] = [28.6139, 77.2090]; // Delhi

  // Map click handler
  function LocationPicker() {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        setLocation(""); // Clear manual location if map is used
      },
    });
    return lat !== null && lng !== null ? (
      <Marker position={[lat, lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />
    ) : null;
  }
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState(''); // Only used for manual entry
  const [targetAuthority, setTargetAuthority] = useState('');
  const [signatureGoal, setSignatureGoal] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!category) {
      toast.error('Category is required');
      return;
    }
    // Require either map or manual location
    if ((lat === null || lng === null) && !location.trim()) {
      toast.error('Location is required (pick on map or enter manually)');
      return;
    }
    if (!targetAuthority.trim()) {
      toast.error('Target Authority is required');
      return;
    }
    if (!signatureGoal || signatureGoal < 1) {
      toast.error('Signature goal must be at least 1');
      return;
    }

    setLoading(true);
    try {
      await petitionsAPI.createPetition({
        title,
        summary,
        description,
        category,
        location: location.trim() ? location : (lat !== null && lng !== null ? `${lat},${lng}` : ''),
        targetAuthority,
        signatureGoal,
      });
      toast.success('Petition created successfully');
      onPetitionCreated();
      onClose();
    } catch (error: any) {
      let errorMsg = 'Failed to create petition';
      if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
      console.error('Error creating petition:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-lg font-semibold">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter petition title"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="summary" className="text-lg font-semibold">Summary</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSummary(e.target.value)}
              placeholder="Brief summary of the petition"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Detailed description of the petition"
              className="mt-1 min-h-[150px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-lg font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="signatureGoal" className="text-lg font-semibold">Signature Goal</Label>
              <Input
                id="signatureGoal"
                type="number"
                min="1"
                value={signatureGoal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatureGoal(parseInt(e.target.value))}
                className="mt-1"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-semibold">Location</Label>
            <div className="mt-1 rounded-lg overflow-hidden border border-input">
              <MapContainer center={defaultPosition} zoom={5} style={{ height: '250px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker />
              </MapContainer>
            </div>
            {lat !== null && lng !== null && (
              <div className="text-xs mt-1 text-muted-foreground">Selected coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}</div>
            )}
          </div>

          <div>
            <Label htmlFor="location" className="text-lg font-semibold">Location Description</Label>
            <Input
              id="location"
              value={location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLocation(e.target.value);
                setLat(null);
                setLng(null);
              }}
              placeholder="Or enter location manually"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="targetAuthority" className="text-lg font-semibold">Target Authority</Label>
            <Input
              id="targetAuthority"
              value={targetAuthority}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetAuthority(e.target.value)}
              placeholder="Authority this petition is addressed to"
              className="mt-1"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="min-w-[120px]"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Creating...' : 'Create Petition'}
        </Button>
      </div>
    </form>
  );
}

export function PetitionList() {
  const [petitions, setPetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    status: '',
  });
  const [selectedPetitionId, setSelectedPetitionId] = useState<string | null>(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signatureData, setSignatureData] = useState({
    name: '',
    email: '',
    comment: ''
  });

  const handleSignPetition = (id: string) => {
    setSelectedPetitionId(id);
    setShowSignDialog(true);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetitionId) return;

    try {
      await petitionsAPI.signPetition(selectedPetitionId, signatureData);
      toast.success('Petition signed successfully');
      setShowSignDialog(false);
      setSignatureData({ name: '', email: '', comment: '' });
      // Refresh the petitions list if needed
      await loadPetitions();
    } catch (error) {
      toast.error('You have already signed this petition.');
    }
  };
  
  useEffect(() => {
    loadPetitions();
  }, [filters]);

  const loadPetitions = async () => {
    try {
      const data = await petitionsAPI.getPetitions(filters);
      setPetitions(data);
    } catch (error) {
      console.error('Error loading petitions:', error);
    
    } finally {
      setLoading(false);
    }
  };

  // handleSignPetition opens the sign dialog (defined above)

  if (loading) {
    return <div>Loading petitions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Filter by location"
          value={filters.location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, location: e.target.value })}
        />

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="achieved">Achieved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SignPetitionDialog
        open={showSignDialog}
        onOpenChange={setShowSignDialog}
        petitionId={selectedPetitionId}
        onSigned={async () => {
          // refresh petitions after signing
          await loadPetitions();
        }}
      />

      {/* Temporary visual fallback for debugging: if the Dialog component fails to appear
          this simple overlay will confirm that the click reached state and show petition id. */}
      {showSignDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-md pointer-events-auto">
            <h3 className="text-lg font-semibold">Debug: Sign Dialog (fallback)</h3>
            <p className="text-sm text-muted-foreground">petitionId: {selectedPetitionId}</p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowSignDialog(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {petitions.map((petition) => (
          <Card key={petition._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{petition.title}</CardTitle>
                <Badge 
                  variant={petition.status === 'active' ? 'default' : 
                         petition.status === 'resolved' ? 'secondary' : 'outline'}
                >
                  {petition.status}
                </Badge>
              </div>
              <CardDescription className="mt-2">{petition.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-sm">{petition.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm">{petition.location}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Target Authority</p>
                  <p className="text-sm">{petition.targetAuthority}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Signatures Progress</p>
                  <Progress 
                    value={(petition.signatures?.length || 0) / petition.signatureGoal * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {petition.signatures?.length || 0} of {petition.signatureGoal} signatures
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (petition.hasUserSigned) {
                        toast.error("You have already signed this petition");
                        return;
                      }
                      console.log('Sign button clicked for', petition._id, 'status=', petition.status, 'hasUserSigned=', petition.hasUserSigned);
                      toast('Opening sign dialog...');
                      handleSignPetition(petition._id);
                    }}
                    disabled={Boolean(petition.hasUserSigned)}
                    variant={petition.hasUserSigned ? "outline" : "default"}
                    title={petition.status && petition.status.toString().toLowerCase() !== 'active' ? `Petition status: ${petition.status}` : undefined}
                    aria-label={petition.hasUserSigned ? 'Already signed' : `Sign petition ${petition.title}`}
                  >
                    {petition.hasUserSigned ? 'Signed ✓' : 'Sign Petition'}
                  </Button>
                  {/* Native debug button to verify pointer events reach this area */}
                  <button
                    style={{ zIndex: 2000, position: 'relative' }}
                    onClick={() => {
                      console.log('Native debug button clicked for', petition._id);
                      toast.success('Native debug click');
                    }}
                    aria-label={`debug-click-${petition._id}`}
                    className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                  >
                    Debug Click
                  </button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="w-10"
                    onClick={() => {
                      // Open share dialog or copy link
                      const url = `${window.location.origin}/petitions/${petition._id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Petition link copied to clipboard');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
