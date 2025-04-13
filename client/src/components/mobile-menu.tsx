import { useEffect } from "react";
import { Link, useLocation } from "wouter";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    onClose();
  }, [location, onClose]);

  // Not using this component anymore since we've incorporated mobile menu directly in header
  return <></>; 
}
