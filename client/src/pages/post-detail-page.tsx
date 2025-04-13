import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CommentSection from "@/components/comment-section";
import { PostWithDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Heart, MessageSquare, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasLiked, setHasLiked] = useState(false);

  const { data: post, isLoading, error } = useQuery<PostWithDetails>({
    queryKey: [`/api/posts/${id}`],
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        await apiRequest("DELETE", `/api/likes?postId=${id}`);
      } else {
        await apiRequest("POST", "/api/likes", { postId: parseInt(id) });
      }
    },
    onSuccess: () => {
      setHasLiked(!hasLiked);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts.",
        variant: "default",
      });
      return;
    }

    likeMutation.mutate();
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Error Loading Post</h1>
            <p className="text-neutral-600 mb-6">
              There was a problem loading this post. It may have been deleted or doesn't exist.
            </p>
            <Link href="/">
              <a className="inline-flex items-center text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to posts
              </a>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const formattedDate = post.createdAt ? format(new Date(post.createdAt), "MMM d, yyyy") : "";
  
  return (
    <>
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-8">
              <Link href="/">
                <a className="inline-flex items-center text-primary hover:underline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to posts
                </a>
              </Link>
            </div>
            
            {/* Post Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">{post.title}</h1>
              
              {/* Post Metadata */}
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-neutral-800 font-medium">{post.author.firstName || post.author.username}</p>
                  <div className="flex items-center text-neutral-500 text-sm">
                    <span>{formattedDate}</span>
                    <span className="mx-2">•</span>
                    <span>5 min read</span>
                    {post.category && (
                      <>
                        <span className="mx-2">•</span>
                        <Badge variant="secondary" className={`bg-${post.category.colorClass}-100 text-${post.category.colorClass}-800 hover:bg-${post.category.colorClass}-100`}>
                          {post.category.name}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto rounded-lg mb-8 object-cover" 
                />
              )}
            </div>
            
            {/* Post Content */}
            <div 
              className="font-serif prose prose-lg max-w-none text-neutral-700 mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Engagement Actions */}
            <div className="border-t border-b border-neutral-200 py-6 my-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    className={`flex items-center space-x-2 ${hasLiked ? 'text-red-500' : 'text-neutral-600 hover:text-red-500'} transition-all`}
                    onClick={handleLikeClick}
                    disabled={likeMutation.isPending}
                  >
                    {likeMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>{post.likes} likes</span>
                  </button>
                  <button className="flex items-center space-x-2 text-neutral-600 hover:text-primary transition-all">
                    <MessageSquare className="h-5 w-5" />
                    <span>{post.comments} comments</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-neutral-600 hover:text-primary transition-all">
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button className="text-neutral-600 hover:text-primary transition-all">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Author Info */}
            <div className="bg-neutral-50 p-6 rounded-lg mb-8">
              <div className="flex items-start">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-neutral-800 mb-1">
                    Written by {post.author.firstName ? `${post.author.firstName} ${post.author.lastName || ''}` : post.author.username}
                  </h3>
                  <p className="text-neutral-600 mb-3">Technology writer and remote work advocate.</p>
                  <Link href={`/user/${post.author.id}`}>
                    <a className="text-primary hover:underline">
                      More from {post.author.firstName || post.author.username}
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <CommentSection postId={parseInt(id)} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
