# Blog Platform Full Stack Task

A modern blogging platform with a robust React/TypeScript frontend and Express backend, designed for seamless content creation and user engagement.

## Features

- **Secure Authentication**: JWT-based user authentication and authorization
- **Blog Post Management**: Create, read, update, and delete blog posts
- **Rich Text Editing**: Intuitive rich text editor for content creation
- **Categorization**: Organize posts into categories
- **Comments and Likes**: Engage with posts through comments and likes
- **Responsive Design**: Beautiful, responsive interface that works on all devices

## Tech Stack

### Frontend
- React.js with TypeScript
- TanStack Query for data fetching and caching
- Wouter for routing
- Shadcn UI components with Tailwind CSS for styling
- React Hook Form for form management and validation

### Backend
- Node.js with Express
- PostgreSQL database (via Neon Serverless)
- Drizzle ORM for database operations
- Passport.js for authentication
- Express sessions with PostgreSQL session store

## Project Structure

The project follows a clean, maintainable structure:

```
├── frontend/            # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and helper functions
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Main application component
│   │   └── main.tsx     # Application entry point
│
├── backend/             # Backend Express server
│   ├── auth.ts          # Authentication logic
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data storage interface
│   └── vite.ts          # Frontend server configuration
│
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema and types
│
└── migrations/          # Database migration files
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pensieve-blog.git
   cd pensieve-blog
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/blog_db
   SESSION_SECRET=your-session-secret
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Development Approach

### Database Schema Design

The database schema is defined using Drizzle ORM with the following entities:

- **Users**: Authentication and profile information
- **Posts**: Blog content with title, body, and metadata
- **Categories**: Post classification system
- **Comments**: User-generated responses to posts
- **Likes**: User engagement tracking for posts and comments

### Authentication Flow

1. User registers with username, email, and password
2. Password is securely hashed using scrypt before storage
3. On login, credentials are verified against the database
4. Authenticated sessions are managed via express-session with PostgreSQL storage
5. Protected routes require authentication to access

### API Architecture

The REST API follows standard conventions:

- `GET /api/posts`: Retrieve all posts with optional category filtering
- `GET /api/posts/:id`: Retrieve a specific post with its details
- `POST /api/posts`: Create a new post (authenticated)
- `PUT /api/posts/:id`: Update an existing post (authenticated, author only)
- `DELETE /api/posts/:id`: Delete a post (authenticated, author only)

Additional endpoints for categories, comments, likes, and user management.

### Frontend Architecture

- Component-based structure with reusable UI elements
- React Query for efficient data fetching and caching
- Protected routes for authenticated-only content
- Form validation using Zod schemas
- Responsive design using Tailwind CSS

## Deployment

The application is configured for easy deployment:

- Frontend: Deployable to Vercel, Netlify, or any static hosting
- Backend: Ready for deployment to Railway, Render, or any Node.js hosting
- Database: Compatible with PostgreSQL providers like Neon, Supabase, or any PostgreSQL-compatible service

## Future Enhancements

- Image upload functionality with cloud storage
- User profiles with avatars and bios
- Search functionality
- Post drafts and scheduling
- Social media integration
- Email notifications