import { Link } from "wouter";
import { format } from "date-fns";
import { PostWithDetails } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart } from "lucide-react";

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = post.createdAt ? format(new Date(post.createdAt), "MMM d, yyyy") : "";
  
  // Extract first name or use username
  const authorName = post.author.firstName || post.author.username;
  
  // Generate a random read time between 3-10 minutes for demo purposes
  // In a real app, this would be calculated based on content length
  const readTime = Math.floor(Math.random() * 8) + 3;
  
  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-md transition-all">
      <Link href={`/post/${post.id}`}>
        <a className="block">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-neutral-800">{authorName}</p>
                <p className="text-xs text-neutral-500">{formattedDate} · {readTime} min read</p>
              </div>
            </div>
            <h2 className="font-bold text-xl mb-2 text-neutral-800">{post.title}</h2>
            <p className="text-neutral-600 mb-4 line-clamp-3">
              {post.excerpt || "No excerpt available for this post."}
            </p>
            <div className="flex justify-between items-center">
              {post.category ? (
                <span className={`bg-${post.category.colorClass}-100 text-${post.category.colorClass}-800 text-xs font-medium px-2.5 py-0.5 rounded`}>
                  {post.category.name}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Uncategorized
                </span>
              )}
              <div className="flex items-center text-neutral-500 text-sm">
                <span className="flex items-center mr-4">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {post.comments}
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {post.likes}
                </span>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </article>
  );
}
