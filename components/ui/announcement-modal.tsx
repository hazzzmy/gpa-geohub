"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain?: () => void;
}


export function AnnouncementModal({ isOpen, onClose, onDontShowAgain }: AnnouncementModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Focus the modal for accessibility
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
        className={cn(
          "relative z-10 w-full max-w-2xl mx-4 transform transition-all duration-300",
          "max-h-[90vh] overflow-y-auto",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <Card className="bg-background border shadow-2xl">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 id="announcement-title" className="text-xl font-bold">Welcome to Farm Profiling Portal</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your comprehensive agricultural management platform
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

           {/* Content */}
           <div className="px-6 pb-6">
             {/* Cascade Grid Hierarchy - Parent-Child Relationship */}
             <div className="mb-6 p-8 bg-black rounded-lg">
               <div className="flex items-center justify-center space-x-4">
                 {/* Mill - 3 Grid Terpisah */}
                 <div className="flex space-x-1">
                   <div className="w-6 h-6 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                   <div className="w-6 h-6 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                   <div className="w-6 h-6 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                 </div>
                 
                 {/* Region - 2 Grid Terpisah */}
                 <div className="flex space-x-1">
                   <div className="w-5 h-5 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                   <div className="w-5 h-5 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                 </div>
                 
                 {/* Farm - 2 Grid Terpisah */}
                 <div className="flex space-x-1">
                   <div className="w-4 h-4 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                   <div className="w-4 h-4 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                 </div>
                 
                 {/* Block - 2 Grid Terpisah */}
                 <div className="flex space-x-1">
                   <div className="w-3 h-3 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                   <div className="w-3 h-3 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
                 </div>
                 
                 {/* Paddock - 1 Grid Saja */}
                 <div className="w-2 h-2 bg-blue-300 transform rotate-45 shadow-xl transition-all duration-500 hover:scale-110" />
               </div>
               
               {/* Labels */}
               <div className="flex items-center justify-center space-x-4 mt-6">
                 <div className="text-sm text-blue-300 text-center w-20 font-medium">Mill (3 Grid)</div>
                 <div className="text-sm text-blue-300 text-center w-16 font-medium">Region (2 Grid)</div>
                 <div className="text-sm text-blue-300 text-center w-12 font-medium">Farm (2 Grid)</div>
                 <div className="text-sm text-blue-300 text-center w-10 font-medium">Block (2 Grid)</div>
                 <div className="text-sm text-blue-300 text-center w-8 font-medium">Paddock (1 Grid)</div>
               </div>
               
               {/* Description */}
               <div className="text-center mt-4">
                 <p className="text-blue-200 text-sm">
                   Grid Hierarchy: Multiple separate grids per level
                 </p>
               </div>
             </div>

             {/* Actions */}
             <div className="flex flex-col sm:flex-row gap-3">
               <Button 
                 onClick={onClose}
                 className="flex-1 h-11"
                 size="lg"
               >
                 Get Started
               </Button>
               <Button 
                 variant="outline" 
                 onClick={onDontShowAgain}
                 className="flex-1 h-11"
                 size="lg"
               >
                 Don't Show Again
               </Button>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}

// Hook for managing announcement modal state
export function useAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the announcement before
    const hasSeenAnnouncement = localStorage.getItem('farm-profiling-announcement-seen');
    
    if (!hasSeenAnnouncement) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('farm-profiling-announcement-seen', 'true');
    setIsOpen(false);
  };

  return {
    isOpen,
    onClose: handleClose,
    onDontShowAgain: handleDontShowAgain,
  };
}
