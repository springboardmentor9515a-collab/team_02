import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { pollsAPI } from '@/lib/api';
import { toast } from "sonner";

interface PollOption {
  text: string;
}

interface CreatePollFormProps {
  onClose: () => void;
  onPollCreated: () => void;
}

export function CreatePollForm({ onClose, onPollCreated }: CreatePollFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    target_location: '',
    targetAuthority: '',
    
    options: ['', ''] // Start with 2 empty options
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<any>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback((query: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch {}
    }
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=5`;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Geocode search failed', err);
        setSuggestions([]);
        setShowSuggestions(false);
      });
  }, []);

  // Debounced search when manual input changes
  useEffect(() => {
    const q = formData.target_location;
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }
    // debounce 500ms
    searchTimeout.current = window.setTimeout(() => {
      performSearch(q);
    }, 500);
    return () => {
      if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    };
  }, [formData.target_location, performSearch]);
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.target_location.trim()) {
      toast.error('Target location is required');
      return;
    }
    if (!formData.duration || parseInt(formData.duration) < 1) {
      toast.error('Duration must be at least 1 hour');
      return;
    }

    // Validate options
    const validOptions = formData.options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      toast.error('At least two valid options are required');
      return;
    }

    setLoading(true);

    try {
      const pollPayload: any = {
        ...formData,
        duration: parseInt(formData.duration),
        options: formData.options.filter(opt => opt.trim().length > 0)
      };
      // Only add latitude/longitude if provided
      if (latitude != null && longitude != null) {
        pollPayload.latitude = latitude;
        pollPayload.longitude = longitude;
      }
    
      await pollsAPI.createPoll(pollPayload);
      toast.success('Poll created successfully');
      onPollCreated();
      onClose();
    } catch (error: any) {
      let errorMsg = 'Failed to create poll';
      if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
      console.error('Error creating poll:', error);
    } finally {
      setLoading(false);
    }
  };

  // Small Leaflet helper component to handle map clicks
  function MapClickHandler() {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);
        // Update the textual location field to show coords
        setFormData(prev => ({ ...prev, target_location: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        // keep modal open so user can confirm
      }
    });
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter poll title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter poll description"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
        >
          <option value="">Select a category</option>
          <option value="community">Community Development</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="environment">Environment</option>
          <option value="education">Education</option>
          <option value="safety">Public Safety</option>
          <option value="events">Local Events</option>
        </select>
      </div>

      <div>
        <Label htmlFor="duration">Duration (hours)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
          placeholder="Enter poll duration in hours"
          required
        />
      </div>

      <div>
        <Label htmlFor="target_location">Target Location</Label>
        <div className="relative">
          <div className="flex gap-2 items-center">
            <Input
              id="target_location"
              value={formData.target_location}
              onChange={(e) => setFormData(prev => ({ ...prev, target_location: e.target.value }))}
              onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
              placeholder="Enter target location"
              required
              aria-autocomplete="list"
              aria-controls="location-suggestions"
            />
            <Button type="button" variant="outline" onClick={() => setShowMapModal(true)}>
              Choose from map
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul id="location-suggestions" role="listbox" className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-auto bg-white border rounded">
              {suggestions.map((s: any, idx: number) => (
                <li key={s.place_id || idx} role="option" className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                  setFormData(prev => ({ ...prev, target_location: s.display_name }));
                  const lat = parseFloat(s.lat);
                  const lon = parseFloat(s.lon);
                  setLatitude(lat);
                  setLongitude(lon);
                  setShowSuggestions(false);
                }}>
                  <div className="text-sm">{s.display_name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map modal */}
        {showMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMapModal(false)} />
            <div className="relative w-11/12 max-w-2xl bg-white rounded shadow-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Choose location on map</h3>
                <Button type="button" variant="ghost" onClick={() => setShowMapModal(false)}>Close</Button>
              </div>
              <div style={{ height: '350px', width: '100%' }}>
                <MapContainer center={[9.0820, 8.6753]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler />
                  {latitude != null && longitude != null && (
                    <Marker position={[latitude, longitude]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />
                  )}
                </MapContainer>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setLatitude(null); setLongitude(null); setFormData(prev => ({ ...prev, target_location: '' })); }}>
                  Clear
                </Button>
                <Button type="button" onClick={() => setShowMapModal(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="targetAuthority">Target Authority</Label>
        <Input
          id="targetAuthority"
          value={formData.targetAuthority}
          onChange={(e) => setFormData(prev => ({ ...prev, targetAuthority: e.target.value }))}
          placeholder="Enter target authority"
          required
        />
      </div>

     
      <div className="space-y-2">
        <Label>Options</Label>
        {formData.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
            />
            {formData.options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Poll'}
        </Button>
      </div>
    </form>
  );
}

interface PollWithVotes {
  _id: string;
  title: string;
  description: string;
  options: string[];
  duration: number;
  createdAt: string;
  results?: {
    counts: Record<string, number>;
    percentages: Record<string, number>;
    total: number;
    userVote?: string; // The option user voted for
  };
}

// Helper function to check if a poll has expired
const isPollExpired = (poll: PollWithVotes): boolean => {
  if (!poll.createdAt || !poll.duration) return false;
  const createdAt = new Date(poll.createdAt);
  const expiresAt = new Date(createdAt.getTime() + (poll.duration * 60 * 60 * 1000)); // duration is in hours
  return new Date() > expiresAt;
};

// Helper function to get time remaining for a poll
const getTimeRemaining = (poll: PollWithVotes): string => {
  if (!poll.createdAt || !poll.duration) return 'Unknown duration';
  const createdAt = new Date(poll.createdAt);
  const expiresAt = new Date(createdAt.getTime() + (poll.duration * 60 * 60 * 1000));
  const now = new Date();
  
  if (now > expiresAt) return 'Expired';
  
  const diffMs = expiresAt.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHrs > 24) {
    const days = Math.floor(diffHrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} remaining`;
  }
  if (diffHrs > 0) {
    return `${diffHrs}h ${diffMins}m remaining`;
  }
  return `${diffMins} minutes remaining`;
};

export function PollList() {
  const [polls, setPolls] = useState<PollWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load polls and their aggregated results
  const loadPolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pollsAPI.getPolls();
      if (!Array.isArray(data)) {
        // defensive: backend should return an array
        setPolls([]);
        setError('Unexpected response from server');
        return;
      }

      // Fetch results for each poll in parallel (counts + percentages)
      const pollsWithResults = await Promise.all(
        data.map(async (p: any) => {
          try {
            const results = await pollsAPI.getPollResults(p._id);
            // Check if user has voted for this poll
            const userVote = localStorage.getItem(`poll_${p._id}_vote`);
            if (userVote) {
              results.userVote = userVote;
            }
            return { ...p, results };
          } catch (err) {
            // If results endpoint fails, still return poll without results
            console.warn('Failed to fetch results for poll', p._id, err);
            return { ...p, results: null };
          }
        })
      );

      setPolls(pollsWithResults);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError('Failed to load polls');
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, selectedOption: string) => {
    try {
      await pollsAPI.vote(pollId, selectedOption);
      // Store the user's vote locally
      localStorage.setItem(`poll_${pollId}_vote`, selectedOption);
      toast.success('Vote recorded successfully');
      await loadPolls(); // Reload polls to get updated counts
    } catch (error: any) {
      console.error('Error voting:', error);
      if (error?.response?.status === 409) {
        toast.error(error.response.data?.message || 'You have already voted');
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to record vote');
      }
    }
  };

  if (loading) {
    return <div>Loading polls...</div>;
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-red-600">{error}</div>
        <Button onClick={loadPolls}>Retry</Button>
      </div>
    );
  }

  if (!polls.length) {
    return (
      <div className="text-center text-muted">No polls available at the moment.</div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {polls.map((poll) => (
        <Card key={poll._id}>
          <CardHeader>
            <CardTitle>{poll.title}</CardTitle>
            <CardDescription>
              {poll.description}
              <div className={`text-sm mt-2 ${isPollExpired(poll) ? 'text-red-500' : 'text-gray-500'}`}>
                {getTimeRemaining(poll)}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {poll.options.map((option: string, index: number) => {
                const count = poll.results?.counts?.[option] ?? 0;
                const pct = poll.results?.percentages?.[option] ?? 0;
                return (
                  <div key={index} className="flex gap-2 items-center">
                    <Button
                      variant={poll.results?.userVote === option ? "default" : "outline"}
                      className={`w-full justify-between ${
                        poll.results?.userVote === option
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleVote(poll._id, option)}
                      disabled={isPollExpired(poll) || poll.results?.userVote !== undefined}
                    >
                      <span>{option}</span>
                      <span className="text-sm opacity-80">{count} votes</span>
                    </Button>
                    <div className="w-16 text-right text-sm opacity-80">{pct}%</div>
                  </div>
                );
              })}
            </div>
            {poll.results && (
              <div className="mt-3 text-xs text-muted">Total votes: {poll.results.total}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}