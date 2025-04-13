import { 
  User, InsertUser, 
  Post, InsertPost, PostWithDetails,
  Comment, InsertComment, CommentWithAuthor,
  Category, InsertCategory, 
  Like, InsertLike
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  getAllPosts(categoryId?: number): Promise<PostWithDetails[]>;
  getPostById(id: number): Promise<PostWithDetails | undefined>;
  getPostsByAuthor(authorId: number): Promise<PostWithDetails[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<void>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Comment operations
  getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Like operations
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId?: number, commentId?: number): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private categories: Map<number, Category>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private postIdCounter: number;
  private categoryIdCounter: number;
  private commentIdCounter: number;
  private likeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.categories = new Map();
    this.comments = new Map();
    this.likes = new Map();
    
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.categoryIdCounter = 1;
    this.commentIdCounter = 1;
    this.likeIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
    };
    
    this.users.set(id, user);
    return user;
  }

  // Post operations
  async getAllPosts(categoryId?: number): Promise<PostWithDetails[]> {
    const posts = Array.from(this.posts.values());
    let filteredPosts = posts;
    
    if (categoryId !== undefined) {
      filteredPosts = posts.filter(post => post.categoryId === categoryId);
    }
    
    return Promise.all(
      filteredPosts.map(async post => this.enrichPost(post))
    );
  }

  async getPostById(id: number): Promise<PostWithDetails | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    return this.enrichPost(post);
  }

  async getPostsByAuthor(authorId: number): Promise<PostWithDetails[]> {
    const posts = Array.from(this.posts.values())
      .filter(post => post.authorId === authorId);
    
    return Promise.all(
      posts.map(async post => this.enrichPost(post))
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    
    const post: Post = {
      ...insertPost,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updateData: InsertPost): Promise<Post> {
    const post = this.posts.get(id);
    if (!post) throw new Error("Post not found");
    
    const updatedPost: Post = {
      ...post,
      ...updateData,
      id,
      updatedAt: new Date()
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    // Delete all comments for this post
    const commentsToDelete = Array.from(this.comments.values())
      .filter(comment => comment.postId === id);
    
    for (const comment of commentsToDelete) {
      this.comments.delete(comment.id);
      
      // Delete all likes for this comment
      const commentLikesToDelete = Array.from(this.likes.values())
        .filter(like => like.commentId === comment.id);
      
      for (const like of commentLikesToDelete) {
        this.likes.delete(like.id);
      }
    }
    
    // Delete all likes for this post
    const postLikesToDelete = Array.from(this.likes.values())
      .filter(like => like.postId === id);
    
    for (const like of postLikesToDelete) {
      this.likes.delete(like.id);
    }
    
    // Delete the post
    this.posts.delete(id);
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    
    const category: Category = {
      ...insertCategory,
      id
    };
    
    this.categories.set(id, category);
    return category;
  }

  // Comment operations
  async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.postId === postId);
    
    const commentWithAuthors = await Promise.all(
      comments.map(async comment => this.enrichComment(comment))
    );
    
    // Organize comments into a tree structure
    const topLevelComments: CommentWithAuthor[] = [];
    const commentMap = new Map<number, CommentWithAuthor>();
    
    // First pass: add all comments to map
    commentWithAuthors.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: organize into parent-child relationships
    commentWithAuthors.forEach(comment => {
      const enrichedComment = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(enrichedComment);
        }
      } else {
        topLevelComments.push(enrichedComment);
      }
    });
    
    return topLevelComments;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: now
    };
    
    this.comments.set(id, comment);
    return comment;
  }

  // Like operations
  async createLike(insertLike: InsertLike): Promise<Like> {
    // Check if like already exists
    const existingLike = Array.from(this.likes.values()).find(
      like => like.userId === insertLike.userId && 
        (
          (insertLike.postId && like.postId === insertLike.postId) || 
          (insertLike.commentId && like.commentId === insertLike.commentId)
        )
    );
    
    if (existingLike) {
      return existingLike;
    }
    
    const id = this.likeIdCounter++;
    const now = new Date();
    
    const like: Like = {
      ...insertLike,
      id,
      createdAt: now
    };
    
    this.likes.set(id, like);
    return like;
  }

  async deleteLike(userId: number, postId?: number, commentId?: number): Promise<void> {
    const likeToDelete = Array.from(this.likes.values()).find(
      like => like.userId === userId && 
        (
          (postId && like.postId === postId) || 
          (commentId && like.commentId === commentId)
        )
    );
    
    if (likeToDelete) {
      this.likes.delete(likeToDelete.id);
    }
  }

  // Helper methods to enrich data
  private async enrichPost(post: Post): Promise<PostWithDetails> {
    const author = this.users.get(post.authorId);
    const category = post.categoryId ? this.categories.get(post.categoryId) : null;
    
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.postId === post.id).length;
    
    const likes = Array.from(this.likes.values())
      .filter(like => like.postId === post.id).length;
    
    if (!author) throw new Error("Author not found");
    
    return {
      ...post,
      author,
      category,
      comments,
      likes
    };
  }

  private async enrichComment(comment: Comment): Promise<CommentWithAuthor> {
    const author = this.users.get(comment.authorId);
    
    const likes = Array.from(this.likes.values())
      .filter(like => like.commentId === comment.id).length;
    
    if (!author) throw new Error("Comment author not found");
    
    return {
      ...comment,
      author,
      likes
    };
  }
}

export const storage = new MemStorage();
