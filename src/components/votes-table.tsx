"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddVoteOption from "./add-vote-option";
import EditVoteDialog from "./edit-vote-dialog";
import DeleteVoteDialog from "./delete-vote-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { PencilIcon, TrashIcon } from "lucide-react";

interface VoteOption {
  id: string;
  topic_id: string;
  topic_title: string;
  topic_description: string | null;
  option_title: string;
  option_description: string | null;
  status: string;
  created_at: string;
  vote_type: string;
}

interface VotesTableProps {
  initialVotes?: VoteOption[];
}

export default function VotesTable({ initialVotes = [] }: VotesTableProps) {
  const [votes, setVotes] = useState<VoteOption[]>(initialVotes);
  
  const supabase = createClient();

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('community_votes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVotes(data || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast.error('Failed to load votes');
    }
  };

  const handleRefresh = () => {
    fetchVotes(); // Refresh the list
  };

  const handleEdit = async () => {
    await fetchVotes(); // Refresh after edit
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Votes</h2>
        <AddVoteOption />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Option</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No votes found. Add your first vote option!
                </TableCell>
              </TableRow>
            ) : (
              votes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{vote.topic_title}</div>
                      {vote.topic_description && (
                        <div className="text-sm text-muted-foreground mt-1 max-w-xs truncate">
                          {vote.topic_description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vote.option_title}</div>
                      {vote.option_description && (
                        <div className="text-sm text-muted-foreground mt-1 max-w-xs">
                          {vote.option_description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={vote.status === 'active' ? 'secondary' : 'outline'}
                    >
                      {vote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {vote.vote_type.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    {new Date(vote.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <EditVoteDialog
                        vote={vote}
                        onEdit={handleEdit}
                        trigger={
                          <Button variant="outline" size="sm">
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DeleteVoteDialog
                        voteTitle={vote.option_title}
                        voteId={vote.id}
                        onConfirm={handleRefresh}
                        trigger={
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {votes.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {votes.length} vote option{votes.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}