import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Placeholder auth page for testing
export default function AuthPage() {
  return (
    <>
      <Header />
      <main className="flex-grow py-12 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h1 className="text-3xl font-bold text-neutral-800 mb-6">Welcome to Pensieve</h1>
              <p className="text-xl text-neutral-600 mb-8">
                This is a placeholder for the authentication page while we are debugging.
              </p>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
