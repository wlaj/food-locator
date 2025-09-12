import { createClient } from "@/lib/supabase/server";
import VoteCard from "@/components/vote-card";

interface Vote {
  topic_id: string;
  topic_title: string;
  topic_description: string;
  vote_type: string;
  status: string;
  ends_at: string | null;
  created_at: string;
  is_public: boolean;
  options: {
    id: string;
    title: string;
    description: string;
    vote_count: number;
  }[];
  total_votes: number | string;
}

async function getActiveVotes(): Promise<Vote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_community_votes_with_counts");

  if (error) {
    console.error("Error fetching votes:", error);
    return [];
  }

  return data || [];
}

export default async function CommunityPage() {
  const votes = await getActiveVotes();

  return (
    <div className="mt-32 md:mt-16 max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Community Votes</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Help shape our platform by participating in community decisions. Your
          voice matters!
        </p>
      </div>

      <div className="space-y-8">
        {votes.length > 0 ? (
          votes.map((vote) => <VoteCard key={vote.topic_id} vote={vote} />)
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No active votes</h3>
            <p className="text-muted-foreground">
              Check back later for new community decisions to participate in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
