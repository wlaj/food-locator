"use client";

import { useState, useEffect } from "react";
import { getComments } from "@/lib/actions";
import CommentForm from "./comment-form";
import CommentThread from "./comment-thread";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  parent_comment_id: string | null;
  users_with_usernames: {
    user_id: string;
    username: string | null;
    email: string | null;
  } | null;
}

interface CommentSectionProps {
  postId: string;
  currentUser?: {
    id: string;
  } | null;
}

export default function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const result = await getComments(postId);
      if (result) {
        setComments(result);
      }
      setLoading(false);
    };

    fetchComments();
  }, [postId]);

  const refetchComments = async () => {
    const result = await getComments(postId);
    if (result) {
      setComments(result);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Organize comments into threads (main comments and their replies)
  const mainComments = comments.filter(comment => !comment.parent_comment_id);
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parent_comment_id === commentId);

  return (
    <div className="space-y-4">
      {/* Main comment form */}
      <CommentForm postId={postId} onSuccess={refetchComments} />
      
      {/* Comments */}
      <div className="space-y-1">
        {mainComments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          mainComments.map((comment) => {
            const replies = getReplies(comment.id);
            
            return (
              <CommentThread
                key={comment.id}
                comment={comment}
                replies={replies}
                currentUser={currentUser}
                postId={postId}
                onCommentChange={refetchComments}
              />
            );
          })
        )}
      </div>
    </div>
  );
}