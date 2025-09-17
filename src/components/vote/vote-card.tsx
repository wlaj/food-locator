'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface VoteOption {
  id: string;
  title: string;
  description: string;
  vote_count: number;
}

interface Vote {
  topic_id: string;
  topic_title: string;
  topic_description: string;
  vote_type: string;
  status: string;
  ends_at: string | null;
  created_at: string;
  is_public: boolean;
  options: VoteOption[];
  total_votes: number | string;
}

interface VoteCardProps {
  vote: Vote;
}

export default function VoteCard({ vote }: VoteCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [, setIsLoading] = useState(true);
  const [anonymousVoted, setAnonymousVoted] = useState(false);
  const supabase = createClient();

  // Check authentication status and existing vote on component mount
  useEffect(() => {
    const checkAuthAndVote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Check if user has already voted for this topic
        const { data: existingVote } = await supabase
          .from('community_user_votes')
          .select('id, vote_option_id')
          .eq('user_id', user.id)
          .in('vote_option_id', vote.options.map(o => o.id))
          .maybeSingle();
        
        if (existingVote) {
          setHasVoted(true);
          setSelectedOption(existingVote.vote_option_id);
        }
      }
      
      setIsLoading(false);
    };
    checkAuthAndVote();
  }, [vote.options, supabase]);

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    // Check if vote is private and user is not authenticated
    if (!vote.is_public && !user) {
      toast.error('Please log in to vote on this private poll');
      return;
    }

    setIsVoting(true);
    try {

      if (user) {
        // Authenticated user voting
        // Check if user already voted for this topic
        const { data: existingVote } = await supabase
          .from('community_user_votes')
          .select('id, vote_option_id')
          .eq('user_id', user.id)
          .in('vote_option_id', vote.options.map(o => o.id))
          .single();

        if (existingVote) {
          // Update existing vote
          const { error } = await supabase
            .from('community_user_votes')
            .update({ vote_option_id: selectedOption })
            .eq('id', existingVote.id);

          if (error) throw error;
          toast.success('Vote updated successfully!');
        } else {
          // Create new vote
          const { error } = await supabase
            .from('community_user_votes')
            .insert({
              vote_option_id: selectedOption,
              user_id: user.id,
            });

          if (error) throw error;
          toast.success('Vote submitted successfully!');
        }
      } else {
        // Anonymous voting for public votes
        // Just create an anonymous vote (user_id will be null)
        const { error } = await supabase
          .from('community_user_votes')
          .insert({
            vote_option_id: selectedOption,
            user_id: null,
          });

        if (error) throw error;
        toast.success('Vote submitted successfully!');
        setAnonymousVoted(true);
      }

      setHasVoted(true);
      
      // Refresh the page to show updated vote counts
      window.location.reload();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (voteCount: number) => {
    const totalVotes = typeof vote.total_votes === 'string' ? parseInt(vote.total_votes) : vote.total_votes;
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">{vote.topic_title}</h2>
        {vote.topic_description && (
          <p className="text-muted-foreground">{vote.topic_description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span>{typeof vote.total_votes === 'string' ? parseInt(vote.total_votes) : vote.total_votes} total votes</span>
          <span className={`px-2 py-1 rounded-full text-xs ${vote.is_public ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
            {vote.is_public ? '🌐 Public' : '🔒 Private'}
          </span>
          {vote.ends_at && (
            <span>Ends {new Date(vote.ends_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <RadioGroup
          value={selectedOption}
          onValueChange={setSelectedOption}
          disabled={isVoting || anonymousVoted}
        >
          {vote.options.map((option) => {
            const percentage = getPercentage(option.vote_count);
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.title}</div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {option.vote_count} votes ({percentage}%)
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {!hasVoted && (
          <div className="space-y-2">
            {!vote.is_public && !user && (
              <div className="text-center text-sm text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                🔒 This is a private vote. Please log in to participate.
              </div>
            )}
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || isVoting || (!vote.is_public && !user)}
              className="w-full"
            >
              {isVoting ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </div>
        )}

        {hasVoted && user && (
          <div className="space-y-2">
            <div className="text-center text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
              ✓ You have voted in this poll
            </div>
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || isVoting}
              variant="outline"
              className="w-full"
            >
              {isVoting ? 'Updating...' : 'Update Vote'}
            </Button>
          </div>
        )}

        {hasVoted && !user && anonymousVoted && (
          <div className="text-center text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            ✓ Vote submitted anonymously
          </div>
        )}
      </div>
    </div>
  );
}