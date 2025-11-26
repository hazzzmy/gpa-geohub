// Lark SSO Sign In Button Component
// Provides a button to initiate Lark OAuth flow

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buildLarkAuthUrl } from "@/lib/auth/lark-config";
import { Loader2 } from "lucide-react";

interface LarkSignInButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LarkSignInButton({ 
  className, 
  children = "Sign in with Lark" 
}: LarkSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLarkSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Generate state parameter for security
      const state = crypto.randomUUID();
      
      // Build Lark OAuth URL
      const authUrl = buildLarkAuthUrl(state);
      
      // Store state in sessionStorage for validation
      sessionStorage.setItem("lark_oauth_state", state);
      
      // Redirect to Lark OAuth
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Failed to initiate Lark OAuth:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLarkSignIn}
      disabled={isLoading}
      variant="outline"
      className={`w-full ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting to Lark...
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {children}
        </>
      )}
    </Button>
  );
}

// Alternative Lark button with custom styling
export function LarkSignInButtonCustom({ 
  className, 
  children = "Continue with Lark" 
}: LarkSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLarkSignIn = async () => {
    try {
      setIsLoading(true);
      
      const state = crypto.randomUUID();
      const authUrl = buildLarkAuthUrl(state);
      sessionStorage.setItem("lark_oauth_state", state);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Failed to initiate Lark OAuth:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLarkSignIn}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center px-4 py-3 border border-gray-300 
        rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <div className="mr-2 w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          {children}
        </>
      )}
    </button>
  );
}


