import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommentWithAuthor, insertCommentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Heart, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

const commentContentSchema = insertCommentSchema.pick({ content: true });
type CommentFormSchema = z.infer<typeof commentContentSchema>;

interface CommentSectionProps {
  postId: number;
}

interface CommentProps {
  comment: CommentWithAuthor;
  postId: number;
  level?: number;
}

function Comment({ comment, postId, level = 0 }: CommentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const formattedDate = comment.createdAt ? format(new Date(comment.createdAt), "MMM d, yyyy") : "";
  
  const form = useForm<CommentFormSchema>({
    resolver: zodResolver(commentContentSchema),
    defaultValues: {
      content: "",
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        await apiRequest("DELETE", `/api/likes?commentId=${comment.id}`);
      } else {
        await apiRequest("POST", "/api/likes", { commentId: comment.id });
      }
    },
    onSuccess: () => {
      setHasLiked(!hasLiked);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: CommentFormSchema) => {
      return await apiRequest("POST", `/api/posts/${postId}/comments`, {
        ...data,
        parentId: comment.id,
      });
    },
    onSuccess: () => {
      form.reset();
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({
        title: "Success",
        description: "Your reply has been posted!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like comments.",
        variant: "default",
      });
      return;
    }

    likeMutation.mutate();
  };

  const onSubmit = (data: CommentFormSchema) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply to comments.",
        variant: "default",
      });
      return;
    }

    replyMutation.mutate(data);
  };

  const toggleReply = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply to comments.",
        variant: "default",
      });
      return;
    }
    
    setIsReplying(!isReplying);
  };

  return (
    <div className={`border-b border-neutral-200 pb-8 ${level > 0 ? 'ml-8 mt-6 bg-neutral-50 p-4 rounded-lg' : ''}`}>
      <div className="flex items-start">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="font-medium text-neutral-800">
              {comment.author.firstName || comment.author.username}
            </h4>
            <span className="text-neutral-500 text-sm ml-2">{formattedDate}</span>
          </div>
          <p className="text-neutral-700 mb-3">{comment.content}</p>
          <div className="flex items-center space-x-4 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 hover:bg-transparent"
              onClick={toggleReply}
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`h-auto p-0 hover:bg-transparent ${hasLiked ? 'text-red-500' : ''}`}
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
            >
              {likeMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
              )}
              {comment.likes}
            </Button>
          </div>
          
          {isReplying && (
            <div className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder={`Reply to ${comment.author.firstName || comment.author.username}...`}
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsReplying(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={replyMutation.isPending}
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Post Reply
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 space-y-6">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} postId={postId} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visibleComments, setVisibleComments] = useState(3);
  
  const { data: comments, isLoading } = useQuery<CommentWithAuthor[]>({
    queryKey: [`/api/posts/${postId}/comments`],
  });

  const form = useForm<CommentFormSchema>({
    resolver: zodResolver(commentContentSchema),
    defaultValues: {
      content: "",
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CommentFormSchema) => {
      return await apiRequest("POST", `/api/posts/${postId}/comments`, data);
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormSchema) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "default",
      });
      return;
    }

    commentMutation.mutate(data);
  };

  const loadMoreComments = () => {
    setVisibleComments((prev) => prev + 5);
  };

  return (
    <div id="commentsSection" className="my-12">
      <h3 className="text-2xl font-bold mb-6 text-neutral-800">
        Comments {comments ? `(${comments.length})` : ""}
      </h3>
      
      {/* Comment Form */}
      <div className="mb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder={user ? "Share your thoughts..." : "Please log in to comment"}
                      className="min-h-[100px]"
                      {...field}
                      disabled={!user || commentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              {user ? (
                <Button 
                  type="submit" 
                  disabled={commentMutation.isPending}
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Post Comment
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth">Log in to comment</Link>
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-8">
          {comments.slice(0, visibleComments).map((comment) => (
            <Comment key={comment.id} comment={comment} postId={postId} />
          ))}
          
          {/* View More Comments */}
          {comments.length > visibleComments && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={loadMoreComments}
                className="text-primary hover:text-blue-700 font-medium"
              >
                View More Comments
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
