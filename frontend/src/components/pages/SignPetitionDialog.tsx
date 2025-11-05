import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { petitionsAPI, SignPetitionData } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petitionId: string | null;
  onSigned?: () => void;
}

export default function SignPetitionDialog({ open, onOpenChange, petitionId, onSigned }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setComment('');
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petitionId) return toast.error('No petition selected');
    if (!name.trim()) return toast.error('Name is required');
    if (!email.trim()) return toast.error('Email is required');
    setLoading(true);
    try {
      const data: SignPetitionData = { name, email, comment };
      await petitionsAPI.signPetition(petitionId, data);
      toast.success('Petition signed successfully');
      onOpenChange(false);
      onSigned && onSigned();
    } catch (err: any) {
      console.error('Error signing petition:', err);
      toast.error(err?.response?.data?.error || 'Failed to sign petition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Petition</DialogTitle>
          <DialogDescription>
            Your signature can help make a difference. Please provide your name and email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sign-name">Name</Label>
            <Input id="sign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div>
            <Label htmlFor="sign-email">Email</Label>
            <Input id="sign-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" required />
          </div>
          <div>
            <Label htmlFor="sign-comment">Comment (Optional)</Label>
            <Textarea id="sign-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Why are you signing this petition?" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign Petition'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
