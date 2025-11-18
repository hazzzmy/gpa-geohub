// Sign In Page - Lark OAuth Only
// Clean and user-friendly authentication interface

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "@/lib/icons";
import { fadeInUp, fadeIn } from "@/lib/animations";
import { LarkSignInButton } from "@/components/auth/LarkSignInButton";

export default function SignInPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error from OAuth callback
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome to GeoHUB
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Sign in with your Lark account to access the platform
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </motion.div>
              )}

              {/* Lark SSO Button */}
              <div className="space-y-4">
                <LarkSignInButton />
                
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use your Lark account to sign in securely
                  </p>
                </div>
              </div>

              {/* Additional Links */}
              <div className="text-center pt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Need help signing in?{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 font-medium"
                    onClick={() => {
                      alert("Please contact your system administrator for assistance.");
                    }}
                  >
                    Contact Administrator
                  </button>
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            GeoHUB &copy; 2025. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}