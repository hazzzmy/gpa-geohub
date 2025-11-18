'use client';

import { UserWithRoles } from "@/lib/auth/utils";
import { motion } from "framer-motion";
import CompanySelection from "./CompanySelection";

interface HeroSectionsProps {
    user: UserWithRoles | null;
}

export default function HeroSections({ user }: HeroSectionsProps) {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Simplified Theme-Aware Background with Grid */}
            <div className="absolute inset-0 z-0">
                {/* Base gradient - theme aware */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300" />
                
                {/* Grid pattern - theme aware */}
                <div 
                    className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] transition-opacity duration-300"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
                
                {/* Subtle accent gradient beam */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent dark:via-blue-900/20 transition-opacity duration-300" />
            </div>

            {/* Content - Split Layout */}
            <div className="relative z-10 w-full h-full">
                <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-8 h-full flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center w-full">
                        {/* Left Side - Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-6"
                        >
                            {/* Badge/Tag */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md border border-slate-300/20 dark:border-white/20 text-slate-700 dark:text-white/90 text-sm font-medium transition-colors duration-300">
                                    <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></span>
                                    Precision Agriculture Platform
                                </span>
                            </motion.div>

                            {/* Main Title */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                                    <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent drop-shadow-lg transition-all duration-300">
                                        GeoHUB
                                    </span>
                                </h1>
                            </motion.div>
                            
                            {/* Subtitle */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white leading-tight transition-colors duration-300">
                                    Smart Farming,<br />
                                    <span className="text-slate-600 dark:text-slate-300">Smarter Decisions</span>
                                </h2>
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <p className="text-base md:text-lg text-slate-700 dark:text-white/85 leading-relaxed transition-colors duration-300">
                                    Transform your farm data into actionable insights. Make better decisions with real-time analytics and intelligent recommendations.
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Right Side - Company Selection */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center justify-center lg:justify-end"
                        >
                            <CompanySelection user={user} />
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
