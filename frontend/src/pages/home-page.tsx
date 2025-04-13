import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PostCard from "@/components/post-card";
import CategoryFilters from "@/components/category-filters";
import { useQuery } from "@tanstack/react-query";
import { PostWithDetails } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { data: posts, isLoading, error } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/posts", selectedCategory ? { categoryId: selectedCategory } : {}],
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch posts. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <>
      <Header />
      <main className="flex-grow">
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">Share your thoughts with the world</h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">Discover stories, ideas, and expertise from writers on any topic.</p>
              <div className="mt-8">
                <Link href="/create">
                  <a className="bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md transition-all inline-block">
                    Start Writing
                  </a>
                </Link>
              </div>
            </div>
            
            {/* Category Filters */}
            <CategoryFilters 
              selectedCategory={selectedCategory} 
              onCategorySelect={setSelectedCategory} 
            />
            
            {/* Posts Grid */}
            {isLoading ? (
              <div className="flex justify-center my-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-neutral-800 mb-2">No posts found</h3>
                <p className="text-neutral-600">
                  {selectedCategory 
                    ? "No posts in this category. Try a different category or create the first one!" 
                    : "Be the first to share your thoughts!"}
                </p>
                <Link href="/create">
                  <a className="mt-4 inline-block bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all">
                    Create a Post
                  </a>
                </Link>
              </div>
            )}
            
            {/* Pagination - Will implement later */}
            {posts && posts.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button className="px-3 py-2 rounded-l-md bg-white text-neutral-500 hover:bg-neutral-50">
                    <span className="sr-only">Previous</span>
                    <i className="fas fa-chevron-left text-sm"></i>
                  </button>
                  <button className="px-4 py-2 bg-primary text-white hover:bg-blue-600">1</button>
                  <button className="px-4 py-2 bg-white text-neutral-500 hover:bg-neutral-50">2</button>
                  <button className="px-4 py-2 bg-white text-neutral-500 hover:bg-neutral-50">3</button>
                  <button className="px-3 py-2 rounded-r-md bg-white text-neutral-500 hover:bg-neutral-50">
                    <span className="sr-only">Next</span>
                    <i className="fas fa-chevron-right text-sm"></i>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
