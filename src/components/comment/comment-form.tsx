"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/actions";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export default function CommentForm({ postId, parentCommentId, onSuccess, placeholder = "Write a comment..." }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please write something before posting");
      return;
    }

    startTransition(async () => {
      const result = await createComment(postId, content, parentCommentId);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment posted!");
        setContent("");
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        className="min-h-[80px]"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          size="sm"
        >
          {isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}