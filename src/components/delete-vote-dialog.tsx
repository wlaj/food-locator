'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { deleteVoteOption } from '@/lib/vote-actions';

interface DeleteVoteDialogProps {
  voteTitle: string;
  voteId: string;
  onConfirm: () => void;
  trigger: React.ReactNode;
}

export default function DeleteVoteDialog({ 
  voteTitle, 
  voteId,
  onConfirm, 
  trigger 
}: DeleteVoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await deleteVoteOption(formData);
        
        if (result.success) {
          toast.success('Vote option deleted successfully!');
          setOpen(false);
          onConfirm(); // Refresh parent component
        } else {
          toast.error(result.error || 'Failed to delete vote option');
        }
      } catch (error) {
        console.error('Error deleting vote option:', error);
        toast.error('Failed to delete vote option');
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
          <DialogTitle>Delete Vote Option</DialogTitle>
        </DialogHeader>
        
        <form action={handleConfirm}>
          <input type="hidden" name="vote_id" value={voteId} />
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the vote option &quot;{voteTitle}&quot;? 
              This action cannot be undone and will remove all associated votes.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="destructive" 
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}