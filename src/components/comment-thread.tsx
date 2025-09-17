"use client";

import { useState } from "react";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";

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

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  currentUser?: {
    id: string;
  } | null;
  postId: string;
  onCommentChange?: () => void;
}

export default function CommentThread({ comment, replies, currentUser, postId, onCommentChange }: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onCommentChange?.();
  };

  return (
    <div>
      <CommentItem
        comment={comment}
        currentUser={currentUser}
        onReply={() => setShowReplyForm(!showReplyForm)}
        onCommentChange={onCommentChange}
      />
      
      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-11 mt-2">
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            onSuccess={handleReplySuccess}
            placeholder={`Reply to @${comment.users_with_usernames?.username || comment.users_with_usernames?.email?.split('@')[0] || 'Anonymous'}...`}
          />
        </div>
      )}
      
      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 border-l border-gray-200 pl-3 space-y-1">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onCommentChange={onCommentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}