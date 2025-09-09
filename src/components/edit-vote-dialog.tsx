'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updateVoteOption } from '@/lib/vote-actions';

interface VoteOption {
  id: string;
  topic_id: string;
  topic_title: string;
  topic_description: string | null;
  option_title: string;
  option_description: string | null;
  status: string;
  vote_type: string;
}

interface EditVoteDialogProps {
  vote: VoteOption;
  onEdit: () => void;
  trigger: React.ReactNode;
}

export default function EditVoteDialog({ vote, onEdit, trigger }: EditVoteDialogProps) {
  const [status, setStatus] = useState(vote.status);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reset status when vote prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setStatus(vote.status);
    }
  }, [vote, open]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateVoteOption(formData);
        
        if (result.success) {
          toast.success('Vote option updated successfully!');
          setOpen(false);
          onEdit(); // Refresh parent component
        } else {
          toast.error(result.error || 'Failed to update vote option');
        }
      } catch (error) {
        console.error('Error updating vote option:', error);
        toast.error('Failed to update vote option');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vote Option</DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="vote_id" value={vote.id} />
          <input type="hidden" name="status" value={status} key={status} />
          
          <div className="space-y-2">
            <Label>Topic</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{vote.topic_title}</div>
              {vote.topic_description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {vote.topic_description}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-option-title">Option Title *</Label>
            <Input
              id="edit-option-title"
              name="option_title"
              defaultValue={vote.option_title}
              placeholder="Enter option title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-option-description">Option Description</Label>
            <Textarea
              id="edit-option-description"
              name="option_description"
              defaultValue={vote.option_description || ''}
              placeholder="Enter option description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Updating...' : 'Update Option'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}