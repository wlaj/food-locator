"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

// Types are now defined in global.d.ts
export type Vote = CommunityVote;

export async function getActiveTopics(): Promise<TopicActionResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("community_votes")
      .select("topic_id, topic_title, topic_description")
      .eq("status", "active");

    if (error) throw error;

    // Remove duplicates based on topic_id
    const uniqueTopics =
      data?.reduce((acc, current) => {
        const existing = acc.find((item) => item.topic_id === current.topic_id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof data) || [];

    return { success: true, data: uniqueTopics };
  } catch (error) {
    console.error("Error fetching active topics:", error);
    return { success: false, error: "Failed to fetch active topics" };
  }
}

export async function getAllVotes(): Promise<VoteActionResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("community_votes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching votes:", error);
    return { success: false, error: "Failed to fetch votes" };
  }
}

export async function addVoteOption(
  formData: FormData
): Promise<VoteActionResult> {
  try {
    const user = await requireAdmin();

    const topicId = formData.get("topic_id") as string;
    const topicTitle = formData.get("topic_title") as string;
    const topicDescription = formData.get("topic_description") as string;
    const optionTitle = formData.get("option_title") as string;
    const optionDescription = formData.get("option_description") as string;
    const isPublic = formData.get("is_public") === "true";

    if (!topicId || !topicTitle || !optionTitle) {
      return {
        success: false,
        error: "Topic ID, title, and option title are required",
      };
    }

    const supabase = await createClient();

    // Get the existing votes for this topic to determine order_index and created_at
    const { data: existingVotes } = await supabase
      .from("community_votes")
      .select("order_index, created_at")
      .eq("topic_id", topicId)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrderIndex =
      existingVotes && existingVotes.length > 0
        ? (existingVotes[0].order_index || 0) + 1
        : 0;

    // Use the same created_at as existing votes for proper grouping, or current time for new topics
    const createdAt =
      existingVotes && existingVotes.length > 0
        ? existingVotes[0].created_at
        : new Date().toISOString();

    const { data, error } = await supabase
      .from("community_votes")
      .insert({
        topic_id: topicId,
        topic_title: topicTitle,
        topic_description: topicDescription || null,
        option_title: optionTitle,
        option_description: optionDescription || null,
        order_index: nextOrderIndex,
        created_by: user.id,
        status: "active",
        is_public: isPublic,
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error adding vote option:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add vote option",
    };
  }
}

export async function updateVoteOption(
  formData: FormData
): Promise<VoteActionResult> {
  try {
    await requireAdmin();

    const voteId = formData.get("vote_id") as string;
    const optionTitle = formData.get("option_title") as string;
    const optionDescription = formData.get("option_description") as string;
    const status = formData.get("status") as string;
    const isPublic = formData.get("is_public") === "true";

    if (!voteId || !optionTitle) {
      return { success: false, error: "Vote ID and option title are required" };
    }

    const supabase = await createClient();

    // First check if the record exists
    const { data: existingRecord } = await supabase
      .from("community_votes")
      .select("id, option_title")
      .eq("id", voteId)
      .single();

    if (!existingRecord) {
      return { success: false, error: "Vote option not found" };
    }

    const { data, error } = await supabase
      .from("community_votes")
      .update({
        option_title: optionTitle,
        option_description: optionDescription || null,
        status,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", voteId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: false, error: "No rows were updated" };
    }

    revalidatePath("/dashboard");
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Error updating vote option:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update vote option",
    };
  }
}

export async function deleteVoteOption(
  formData: FormData
): Promise<VoteActionResult> {
  try {
    await requireAdmin();

    const voteId = formData.get("vote_id") as string;

    if (!voteId) {
      return { success: false, error: "Vote ID is required" };
    }

    const supabase = await createClient();

    // First check if the record exists
    const { data: existingRecord } = await supabase
      .from("community_votes")
      .select("id, option_title")
      .eq("id", voteId)
      .single();

    if (!existingRecord) {
      return { success: false, error: "Vote option not found" };
    }

    const { data, error } = await supabase
      .from("community_votes")
      .delete()
      .eq("id", voteId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: false, error: "No rows were deleted" };
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting vote option:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete vote option",
    };
  }
}
