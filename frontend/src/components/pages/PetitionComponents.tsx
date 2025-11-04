import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { petitionsAPI } from '@/lib/api';
import { toast } from "sonner";

interface CreatePetitionFormProps {
  onClose: () => void;
  onPetitionCreated: () => void;
}

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Label className="mb-1 block">Pick Location on Map (or enter manually below)</Label>
          <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapContainer center={defaultPosition} zoom={5} style={{ height: '220px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker />
            </MapContainer>
          </div>
          {lat !== null && lng !== null && (
            <div className="text-xs mt-1 text-gray-500">Selected: {lat}, {lng}</div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <Label htmlFor="location" className="mb-1">Or enter location manually</Label>
          <Input
            id="location"
            value={location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setLocation(e.target.value);
              setLat(null);
              setLng(null);
            }}
            placeholder="Location affected by this petition"
            className="mb-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Enter petition title"
            required
          />
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            value={summary}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSummary(e.target.value)}
            placeholder="Brief summary of the petition"
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Detailed description of the petition"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
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
          <Label htmlFor="targetAuthority">Target Authority</Label>
          <Input
            id="targetAuthority"
            value={targetAuthority}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetAuthority(e.target.value)}
            placeholder="Authority this petition is addressed to"
            required
          />
        </div>
        <div>
          <Label htmlFor="signatureGoal">Signature Goal</Label>
          <Input
            id="signatureGoal"
            type="number"
            min="1"
            value={signatureGoal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatureGoal(parseInt(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
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

  useEffect(() => {
    loadPetitions();
  }, [filters]);

  const loadPetitions = async () => {
    try {
      const data = await petitionsAPI.getPetitions(filters);
      setPetitions(data);
    } catch (error) {
      console.error('Error loading petitions:', error);
      toast.error('Failed to load petitions');
    } finally {
      setLoading(false);
    }
  };

  const handleSignPetition = async (petitionId: string) => {
    try {
      await petitionsAPI.signPetition(petitionId);
      toast.success('Petition signed successfully');
      await loadPetitions();
    } catch (error) {
      console.error('Error signing petition:', error);
      toast.error('Failed to sign petition');
    }
  };

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {petitions.map((petition) => (
          <Card key={petition._id}>
            <CardHeader>
              <CardTitle>{petition.title}</CardTitle>
              <CardDescription>{petition.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Category: {petition.category}
                </p>
                <p className="text-sm text-gray-500">
                  Location: {petition.location}
                </p>
                <p className="text-sm text-gray-500">
                  Target Authority: {petition.targetAuthority}
                </p>
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={() => handleSignPetition(petition._id)}
                    disabled={petition.status !== 'active'}
                  >
                    Sign Petition
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