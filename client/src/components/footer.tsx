import { Link } from "wouter";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <a className="text-primary font-bold text-xl">Pensieve</a>
            </Link>
            <p className="text-neutral-500 mt-2">Share your thoughts with the world.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link href="/about">
              <a className="text-neutral-600 hover:text-primary transition-all">About</a>
            </Link>
            <Link href="/contact">
              <a className="text-neutral-600 hover:text-primary transition-all">Contact</a>
            </Link>
            <Link href="/privacy">
              <a className="text-neutral-600 hover:text-primary transition-all">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-600 hover:text-primary transition-all">Terms</a>
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col-reverse md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm mt-4 md:mt-0">&copy; {new Date().getFullYear()} Pensieve. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-neutral-500 hover:text-primary transition-all">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary transition-all">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary transition-all">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary transition-all">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
