"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
  Globe,
  Home
} from "@/lib/icons";
import { useTheme } from "next-themes";
import { fadeInDown } from "@/lib/animations";
import { useLayoutStore } from "../stores/layoutStore";
import { UserWithRoles } from "@/lib/auth/utils";
import { useRouter } from "next/navigation";
import { useInvalidateAuth } from "@/hooks/use-auth";

interface AppHeaderProps {
  showAuthButtons?: boolean;
  user?: UserWithRoles | null;
}

export default function AppHeader({ showAuthButtons = false, user }: AppHeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { setTheme: setLayoutTheme } = useLayoutStore();
  const { invalidateAuth } = useInvalidateAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setLayoutTheme(newTheme);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Invalidate auth cache before redirect
        invalidateAuth();
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Redirect anyway in case of error
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo/Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                GeoHUB
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Precision Agriculture Platform
              </p>
            </div>
          </div>

          {/* Right Side - Theme Toggle and User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle - Always visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all duration-200"
              title={!mounted ? "Toggle theme" : theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {!mounted ? (
                <Sun className="w-4 h-4" />
              ) : theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {user ? (
              /* User Menu for Authenticated Users */
              <div className="flex items-center gap-2 dark:bg-slate-800 rounded-lg">
                {/* Home Button - Only show if NOT on home page */}
                {!isHomePage && (
                  <Link href="/">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 h-8 px-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all duration-200"
                    >
                      <Home className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium">Home</span>
                    </Button>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                    title="User menu"
                  >
                    <Avatar className="h-8 w-8 rounded-lg bg-primary">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-white text-xs font-medium">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
