import React, { useState, useEffect } from 'react';
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
      await pollsAPI.createPoll({
        ...formData,
        duration: parseInt(formData.duration),
        options: formData.options.filter(opt => opt.trim().length > 0)
      });
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
        <Input
          id="target_location"
          value={formData.target_location}
          onChange={(e) => setFormData(prev => ({ ...prev, target_location: e.target.value }))}
          placeholder="Enter target location"
          required
        />
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

export function PollList() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const data = await pollsAPI.getPolls();
      setPolls(data);
    } catch (error) {
      console.error('Error loading polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await pollsAPI.vote(pollId, optionIndex);
      toast.success('Vote recorded successfully');
      await loadPolls(); // Reload polls to get updated vote counts
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  };

  if (loading) {
    return <div>Loading polls...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Card key={poll._id}>
          <CardHeader>
            <CardTitle>{poll.title}</CardTitle>
            <CardDescription>{poll.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {poll.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleVote(poll._id, index)}
                >
                  <span>{option}</span>
                  {/* You can add vote count here if available in your API response */}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}