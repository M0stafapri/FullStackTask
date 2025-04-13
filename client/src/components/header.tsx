import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import MobileMenu from "./mobile-menu";

// Simplified header that doesn't use authentication
export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-primary font-bold text-xl">Pensieve</span>
            </Link>
          </div>
          
          {/* Mobile Nav Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className={`text-neutral-600 hover:text-primary transition-all ${location === "/" ? "text-primary" : ""}`}>
                Home
              </span>
            </Link>
            <Link href="/explore">
              <span className={`text-neutral-600 hover:text-primary transition-all ${location === "/explore" ? "text-primary" : ""}`}>
                Explore
              </span>
            </Link>
            <Link href="/about">
              <span className={`text-neutral-600 hover:text-primary transition-all ${location === "/about" ? "text-primary" : ""}`}>
                About
              </span>
            </Link>
            
            {/* Login/Register buttons */}
            <div className="flex space-x-4">
              <Link href="/auth">
                <span className="text-neutral-600 hover:text-primary transition-all font-medium">
                  Log in
                </span>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="ml-2">Sign up</Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Mobile Navigation Menu - simplified version */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white border-t border-neutral-200 py-4`}>
        <div className="container mx-auto px-4 space-y-4">
          <Link href="/">
            <span className={`block text-neutral-600 hover:text-primary transition-all ${location === "/" ? "text-primary font-medium" : ""}`}>
              Home
            </span>
          </Link>
          <Link href="/explore">
            <span className={`block text-neutral-600 hover:text-primary transition-all ${location === "/explore" ? "text-primary font-medium" : ""}`}>
              Explore
            </span>
          </Link>
          <Link href="/about">
            <span className={`block text-neutral-600 hover:text-primary transition-all ${location === "/about" ? "text-primary font-medium" : ""}`}>
              About
            </span>
          </Link>
          <div className="pt-4 flex flex-col space-y-2">
            <Link href="/auth">
              <span className="block text-neutral-600 hover:text-primary transition-all font-medium">
                Log in
              </span>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="w-full">Sign up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
