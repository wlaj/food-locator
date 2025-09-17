import { getComments } from "@/lib/actions";
import CommentForm from "./comment-form";
import CommentThread from "./comment-thread";

interface CommentListProps {
  postId: string;
  currentUser?: {
    id: string;
  } | null;
}

export default async function CommentList({ postId, currentUser }: CommentListProps) {
  const comments = await getComments(postId);

  if (!comments) {
    return (
      <div className="space-y-4">
        <CommentForm postId={postId} />
        <p className="text-sm text-muted-foreground py-4 text-center">
          Failed to load comments.
        </p>
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
      <CommentForm postId={postId} />
      
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
              />
            );
          })
        )}
      </div>
    </div>
  );
}