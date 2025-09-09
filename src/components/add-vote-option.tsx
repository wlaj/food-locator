'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { getActiveTopics, addVoteOption } from '@/lib/vote-actions';

interface ActiveTopic {
  topic_id: string;
  topic_title: string;
  topic_description: string | null;
}

export default function AddVoteOption() {
  const [topics, setTopics] = useState<ActiveTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ActiveTopic | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchActiveTopics();
  }, []);

  const fetchActiveTopics = async () => {
    try {
      const result = await getActiveTopics();
      if (result.success) {
        setTopics(result.data || []);
      } else {
        toast.error(result.error || 'Failed to load active topics');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load active topics');
    }
  };

  const handleTopicSelect = (topicId: string) => {
    const topic = topics.find(t => t.topic_id === topicId) || null;
    setSelectedTopic(topic);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }

    // Add topic information to form data
    formData.set('topic_id', selectedTopic.topic_id);
    formData.set('topic_title', selectedTopic.topic_title);
    formData.set('topic_description', selectedTopic.topic_description || '');

    startTransition(async () => {
      try {
        const result = await addVoteOption(formData);
        
        if (result.success) {
          toast.success('Vote option added successfully!');
          setSelectedTopic(null);
          setOpen(false);
          // Reset form by getting a fresh form element
          const form = document.getElementById('add-vote-form') as HTMLFormElement;
          form?.reset();
        } else {
          toast.error(result.error || 'Failed to add vote option');
        }
      } catch (error) {
        console.error('Error adding vote option:', error);
        toast.error('Failed to add vote option');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vote Option
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vote Option</DialogTitle>
        </DialogHeader>
        
        <form id="add-vote-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Select Topic</Label>
            <Select onValueChange={handleTopicSelect} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.topic_id} value={topic.topic_id}>
                    {topic.topic_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTopic && selectedTopic.topic_description && (
              <p className="text-sm text-muted-foreground">
                {selectedTopic.topic_description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="option-title">Option Title *</Label>
            <Input
              id="option-title"
              name="option_title"
              placeholder="Enter option title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="option-description">Option Description</Label>
            <Textarea
              id="option-description"
              name="option_description"
              placeholder="Enter option description (optional)"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={!selectedTopic || isPending}
            className="w-full"
          >
            {isPending ? 'Adding Option...' : 'Add Vote Option'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}