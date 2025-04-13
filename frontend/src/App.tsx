import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import PostDetailPage from "@/pages/post-detail-page";
import CreatePostPage from "@/pages/create-post-page";
import MyPostsPage from "@/pages/my-posts-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/post/:id" component={PostDetailPage} />
      <ProtectedRoute path="/create" component={CreatePostPage} />
      <ProtectedRoute path="/my-posts" component={MyPostsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router />
      <Toaster />
    </div>
  );
}

export default App;
