import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPostSchema, 
  insertCommentSchema, 
  insertLikeSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Seed categories if they don't exist
  await seedCategories();

  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const categoryId = req.query.category ? parseInt(req.query.categoryId as string) : undefined;
      const posts = await storage.getAllPosts(categoryId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get a single post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Get posts by author
  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const authorId = parseInt(req.params.id);
      const posts = await storage.getPostsByAuthor(authorId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's posts" });
    }
  });

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to create a post" });
    }

    try {
      const validatedData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user!.id
      });
      
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Update a post
  app.put("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to update a post" });
    }

    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own posts" });
      }
      
      const validatedData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user!.id
      });
      
      const updatedPost = await storage.updatePost(postId, validatedData);
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete a post
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete a post" });
    }

    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      await storage.deletePost(postId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Get comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a comment
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to comment" });
    }

    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        postId,
        authorId: req.user!.id
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Like a post or comment
  app.post("/api/likes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to like" });
    }

    try {
      const validatedData = insertLikeSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Ensure at least one of postId or commentId is provided
      if (!validatedData.postId && !validatedData.commentId) {
        return res.status(400).json({ message: "Either postId or commentId must be provided" });
      }
      
      const like = await storage.createLike(validatedData);
      res.status(201).json(like);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid like data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create like" });
    }
  });

  // Unlike a post or comment
  app.delete("/api/likes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to unlike" });
    }

    try {
      const postId = req.query.postId ? parseInt(req.query.postId as string) : undefined;
      const commentId = req.query.commentId ? parseInt(req.query.commentId as string) : undefined;
      
      if (!postId && !commentId) {
        return res.status(400).json({ message: "Either postId or commentId must be provided" });
      }
      
      await storage.deleteLike(req.user!.id, postId, commentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete like" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function seedCategories() {
  try {
    const categories = await storage.getAllCategories();
    
    if (categories.length === 0) {
      await Promise.all([
        storage.createCategory({ name: "Technology", colorClass: "blue" }),
        storage.createCategory({ name: "Travel", colorClass: "green" }),
        storage.createCategory({ name: "Food", colorClass: "yellow" }),
        storage.createCategory({ name: "Health", colorClass: "purple" }),
        storage.createCategory({ name: "Personal", colorClass: "pink" })
      ]);
    }
  } catch (error) {
    console.error("Failed to seed categories:", error);
  }
}
