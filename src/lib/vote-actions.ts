'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

export interface Topic {
  topic_id: string;
  topic_title: string;
  topic_description: string
}

export interface VoteActionResult {
  success: boolean;
  error?: string;
  data?: Topic[];
}

export async function getActiveTopics(): Promise<VoteActionResult> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('community_votes')
      .select('topic_id, topic_title, topic_description')
      .eq('status', 'active');

    if (error) throw error;

    // Remove duplicates based on topic_id
    const uniqueTopics = data?.reduce((acc, current) => {
      const existing = acc.find(item => item.topic_id === current.topic_id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, [] as typeof data) || [];

    return { success: true, data: uniqueTopics };
  } catch (error) {
    console.error('Error fetching active topics:', error);
    return { success: false, error: 'Failed to fetch active topics' };
  }
}

export async function getAllVotes(): Promise<VoteActionResult> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('community_votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching votes:', error);
    return { success: false, error: 'Failed to fetch votes' };
  }
}

export async function addVoteOption(formData: FormData): Promise<VoteActionResult> {
  try {
    const user = await requireAdmin();
    
    const topicId = formData.get('topic_id') as string;
    const topicTitle = formData.get('topic_title') as string;
    const topicDescription = formData.get('topic_description') as string;
    const optionTitle = formData.get('option_title') as string;
    const optionDescription = formData.get('option_description') as string;

    if (!topicId || !topicTitle || !optionTitle) {
      return { success: false, error: 'Topic ID, title, and option title are required' };
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('community_votes')
      .insert({
        topic_id: topicId,
        topic_title: topicTitle,
        topic_description: topicDescription || null,
        option_title: optionTitle,
        option_description: optionDescription || null,
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error) {
    console.error('Error adding vote option:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add vote option'
    };
  }
}

export async function updateVoteOption(formData: FormData): Promise<VoteActionResult> {
  try {
    await requireAdmin();
    
    const voteId = formData.get('vote_id') as string;
    const optionTitle = formData.get('option_title') as string;
    const optionDescription = formData.get('option_description') as string;
    const status = formData.get('status') as string;

    console.log('Update vote - FormData entries:', [...formData.entries()]);
    console.log('Update vote - Data:', { voteId, optionTitle, optionDescription, status });

    if (!voteId || !optionTitle) {
      return { success: false, error: 'Vote ID and option title are required' };
    }

    const supabase = await createClient();
    
    // First check if the record exists
    const { data: existingRecord } = await supabase
      .from('community_votes')
      .select('id, option_title')
      .eq('id', voteId)
      .single();

    console.log('Update vote - Existing record:', existingRecord);

    if (!existingRecord) {
      return { success: false, error: 'Vote option not found' };
    }
    
    const { data, error } = await supabase
      .from('community_votes')
      .update({
        option_title: optionTitle,
        option_description: optionDescription || null,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', voteId)
      .select();

    console.log('Update vote - Supabase result:', { data, error });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: false, error: 'No rows were updated' };
    }

    revalidatePath('/dashboard');
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating vote option:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update vote option'
    };
  }
}

export async function deleteVoteOption(formData: FormData): Promise<VoteActionResult> {
  try {
    await requireAdmin();
    
    const voteId = formData.get('vote_id') as string;
    
    console.log('Delete vote - FormData entries:', [...formData.entries()]);
    console.log('Delete vote - Vote ID:', voteId);

    if (!voteId) {
      return { success: false, error: 'Vote ID is required' };
    }

    const supabase = await createClient();
    
    // First check if the record exists
    const { data: existingRecord } = await supabase
      .from('community_votes')
      .select('id, option_title')
      .eq('id', voteId)
      .single();

    console.log('Delete vote - Existing record:', existingRecord);

    if (!existingRecord) {
      return { success: false, error: 'Vote option not found' };
    }
    
    const { data, error } = await supabase
      .from('community_votes')
      .delete()
      .eq('id', voteId)
      .select();

    console.log('Delete vote - Supabase result:', { data, error });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: false, error: 'No rows were deleted' };
    }

    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting vote option:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete vote option'
    };
  }
}