"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Reply } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { updateComment, deleteComment } from "@/lib/actions";
import { toast } from "sonner";

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

interface CommentItemProps {
  comment: Comment;
  currentUser?: {
    id: string;
  } | null;
  onReply?: () => void;
  onCommentChange?: () => void;
}

export default function CommentItem({ comment, currentUser, onReply, onCommentChange }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = comment.users_with_usernames;
  const displayName = user?.username || user?.email?.split('@')[0] || 'Anonymous User';
  const userInitials = user?.username 
    ? user.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() 
    || comment.created_by.slice(0, 2).toUpperCase();

  const canEdit = currentUser && currentUser.id === comment.created_by;
  const isUpdated = comment.updated_at !== comment.created_at;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    setIsUpdating(true);
    const result = await updateComment(comment.id, editContent);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Comment updated!");
      setIsEditing(false);
      onCommentChange?.();
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteComment(comment.id);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Comment deleted!");
      onCommentChange?.();
    }
    setIsDeleting(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className="flex space-x-3 py-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {userInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">@{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
            {isUpdated && ' (edited)'}
          </span>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px]"
              disabled={isUpdating}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating || !editContent.trim()}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
            <div className="flex items-center gap-2">
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-1 text-muted-foreground"
                      disabled={isDeleting}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}