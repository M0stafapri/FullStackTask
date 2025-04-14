import { 
  User, InsertUser, 
  Post, InsertPost, PostWithDetails,
  Comment, InsertComment, CommentWithAuthor,
  Category, InsertCategory, 
  Like, InsertLike,
  users, posts, categories, comments, likes
} from "@shared/schema";
import session from "express-session";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { db, pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllPosts(categoryId?: number): Promise<PostWithDetails[]> {
    const query = db
      .select({
        post: posts,
        author: users,
        category: categories,
        commentCount: sql<number>`count(distinct ${comments.id})`,
        likeCount: sql<number>`count(distinct ${likes.id})`
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .orderBy(desc(posts.createdAt))
      .groupBy(posts.id, users.id, categories.id);

    if (categoryId) {
      query.where(eq(posts.categoryId, categoryId));
    }

    const results = await query;

    return results.map(row => ({
      ...row.post,
      author: row.author,
      category: row.category || null,
      comments: Number(row.commentCount),
      likes: Number(row.likeCount)
    }));
  }

  async getPostById(id: number): Promise<PostWithDetails | undefined> {
    const [result] = await db
      .select({
        post: posts,
        author: users,
        category: categories,
        commentCount: sql<number>`count(distinct ${comments.id})`,
        likeCount: sql<number>`count(distinct ${likes.id})`
      })
      .from(posts)
      .where(eq(posts.id, id))
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .groupBy(posts.id, users.id, categories.id);

    if (!result) return undefined;

    return {
      ...result.post,
      author: result.author,
      category: result.category || null,
      comments: Number(result.commentCount),
      likes: Number(result.likeCount)
    };
  }

  async getPostsByAuthor(authorId: number): Promise<PostWithDetails[]> {
    const results = await db
      .select({
        post: posts,
        author: users,
        category: categories,
        commentCount: sql<number>`count(distinct ${comments.id})`,
        likeCount: sql<number>`count(distinct ${likes.id})`
      })
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .orderBy(desc(posts.createdAt))
      .groupBy(posts.id, users.id, categories.id);

    return results.map(row => ({
      ...row.post,
      author: row.author,
      category: row.category || null,
      comments: Number(row.commentCount),
      likes: Number(row.likeCount)
    }));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updatePost(id: number, updateData: InsertPost): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: number): Promise<void> {
    // Delete related comments and likes first
    await db.delete(comments).where(eq(comments.postId, id));
    await db.delete(likes).where(eq(likes.postId, id));
    
    // Then delete the post
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
    const results = await db
      .select({
        comment: comments,
        author: users,
        likeCount: sql<number>`count(distinct ${likes.id})`
      })
      .from(comments)
      .where(eq(comments.postId, postId))
      .leftJoin(users, eq(comments.authorId, users.id))
      .leftJoin(likes, eq(comments.id, likes.commentId))
      .groupBy(comments.id, users.id);

    const allComments = results.map(row => ({
      ...row.comment,
      author: row.author,
      likes: Number(row.likeCount),
      replies: []
    }));

    // Build comment tree (for nested replies)
    const commentMap = new Map<number, CommentWithAuthor>();
    const rootComments: CommentWithAuthor[] = [];

    // First pass: create a map of all comments by ID
    allComments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });

    // Second pass: create the tree structure
    allComments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db.insert(likes).values(insertLike).returning();
    return like;
  }

  async deleteLike(userId: number, postId?: number, commentId?: number): Promise<void> {
    let query = db.delete(likes).where(eq(likes.userId, userId));
    
    if (postId) {
      query = query.where(eq(likes.postId, postId));
    }
    
    if (commentId) {
      query = query.where(eq(likes.commentId, commentId));
    }
    
    await query;
  }
}

export const storage = new DatabaseStorage();