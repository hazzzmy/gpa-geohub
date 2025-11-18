"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderOpen,
  FileText,
  Info,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useLandUnitHierarchy } from "../hooks/use-land-unit-hierarchy";

interface LandUnitHierarchyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LandUnitHierarchyModal({
  open,
  onOpenChange,
}: LandUnitHierarchyModalProps) {
  const hierarchy = useLandUnitHierarchy(open) as any;
  const {
    currentLevel,
    isAnimating,
    nextLevel,
    prevLevel,
    goToLevel,
    levels,
    getCurrentLevelData,
  } = hierarchy;

  const renderDiamondContent = () => {
    switch (currentLevel) {
      case 0: // All - Keseluruhan Hierarki
        return (
          <div className="relative w-full h-full flex items-center justify-center px-2">
            <div className="flex items-center justify-center gap-12 w-full py-4">
              {/* 1. Multiple Productions Unit - Terbesar */}
              <div className="flex flex-col items-center gap-6 w-[120px]">
                <div className="px-2 py-1 bg-primary/10 rounded text-xs text-center leading-tight whitespace-nowrap">
                  Multiple Productions Unit
                </div>
                <div className="relative w-24 h-24">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="absolute top-0 left-0 w-10 h-10 border border-foreground rotate-45"
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="absolute bottom-0 left-3 w-10 h-10 border border-foreground rotate-45"
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 border-2 border-red-500 rotate-45 bg-red-500/20"
                  />
                </div>
              </div>

              {/* 2. Productions Unit with Multiple Region */}
              <div className="flex flex-col items-center gap-6 w-[130px]">
                <div className="px-2 py-1 bg-primary/10 rounded text-xs text-center leading-tight whitespace-nowrap">
                  Productions Unit with
                  <br />
                  Multiple Region
                </div>
                <div className="relative w-28 h-28">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="w-full h-full border-2 border-red-500 rotate-45 relative"
                  >
                    <div className="absolute top-1.5 left-3 w-8 h-8 border border-foreground/40 rotate-45" />
                    <div className="absolute top-3 right-1.5 w-8 h-8 border border-foreground/40 rotate-45" />
                    <div className="absolute bottom-1.5 left-1.5 w-8 h-8 border border-foreground/40 rotate-45" />
                    <div className="absolute bottom-1.5 right-3 w-8 h-8 border-2 border-orange-500 rotate-45 bg-orange-500/20" />
                  </motion.div>
                </div>
              </div>

              {/* 3. Region with Multiple Farm */}
              <div className="flex flex-col items-center gap-6 w-[100px]">
                <div className="px-2 py-1 bg-primary/10 rounded text-xs text-center leading-tight whitespace-nowrap">
                  Region with
                  <br />
                  Multiple Farm
                </div>
                <div className="relative w-22 h-22">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="w-full h-full border-2 border-orange-500 rotate-45 grid grid-cols-2 grid-rows-2"
                  >
                    <div className="border border-foreground/30" />
                    <div className="border border-foreground/30" />
                    <div className="border-2 border-yellow-500 bg-yellow-500/20" />
                    <div className="border border-foreground/30" />
                  </motion.div>
                </div>
              </div>

              {/* 4. Farm with Multiple Block */}
              <div className="flex flex-col items-center gap-6 w-[80px]">
                <div className="px-2 py-1 bg-primary/10 rounded text-xs text-center leading-tight whitespace-nowrap">
                  Farm with
                  <br />
                  Multiple Block
                </div>
                <div className="relative w-16 h-16">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="w-full h-full border-2 border-yellow-500 rotate-45 grid grid-cols-3 grid-rows-3"
                  >
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          i === 4
                            ? "border-2 border-lime-500 bg-lime-500/20"
                            : "border border-foreground/30"
                        }`}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* 5. Block with Multiple Paddock */}
              <div className="flex flex-col items-center gap-6 w-[60px]">
                <div className="px-2 py-1 bg-primary/10 rounded text-xs text-center leading-tight whitespace-nowrap">
                  Block with
                  <br />
                  Multiple Paddock
                </div>
                <div className="relative w-12 h-12">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className="w-full h-full border-2 border-lime-500 rotate-45 grid grid-cols-5 grid-rows-5"
                  >
                    {[...Array(25)].map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          i === 12
                            ? "border-2 border-green-600 bg-green-600/20"
                            : "border border-foreground/20"
                        }`}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* 6. Single Paddock - Terkecil */}
              <div className="flex flex-col items-center gap-6 w-[40px]">
                <div className="px-2 py-1 bg-primary/10 rounded text-xs text-center leading-tight whitespace-nowrap">
                  Paddock
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="w-6 h-6 border-2 border-green-600 rotate-45 bg-green-600/20"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Multiple Productions Units
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="flex items-center gap-20">
              <div className="flex flex-col gap-12">
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: 45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 45 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="relative w-24 h-24 border border-foreground/40"
                >
                  <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                    <span className="px-2 py-1 text-xs">Productions Unit 1</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: 45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 45 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative w-24 h-24 border border-foreground/40"
                >
                  <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                    <span className="px-2 py-1 text-xs">Productions Unit 2</span>
                  </div>
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: 45 }}
                animate={{ scale: 1, opacity: 1, rotate: 45 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative w-36 h-36 border-2 border-red-500 bg-red-500/20"
              >
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  <span className="px-2.5 py-1 bg-red-500 text-white rounded text-xs whitespace-nowrap">
                    Productions Unit 1
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 2: // Productions Unit with Multiple Regions
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 45 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative w-44 h-44 border-2 border-red-500"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 -rotate-45 px-2.5 py-1 bg-muted rounded text-xs whitespace-nowrap">
                Productions Unit 1
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute top-4 left-6 w-12 h-12 border border-foreground rotate-45"
              >
                <div className="absolute inset-0 flex items-center justify-center -rotate-90">
                  <span className="px-2 py-1 text-[11px] text-center">Region A</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="absolute top-6 right-4 w-12 h-12 border border-foreground rotate-45"
              >
                <div className="absolute inset-0 flex items-center justify-center -rotate-90">
                  <span className="px-2 py-1 text-[11px] text-center">Region B</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute bottom-4 left-5 w-12 h-12 border-2 border-orange-500 rotate-45 bg-orange-500/20"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-90 gap-1">
                  <span className="text-[11px] text-muted-foreground leading-none">Region</span>
                  <span className="px-1 py-1 text-white rounded text-[16px] text-center leading-none">JAGF</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute bottom-5 right-6 w-12 h-12 border border-foreground rotate-45"
              >
                <div className="absolute inset-0 flex items-center justify-center -rotate-90">
                  <span className="px-2 py-1 text-[11px]">Region C</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        );

      case 3: // Region with Multiple Farm (2x2 grid)
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 45 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-48 h-48 border-2 border-orange-500 grid grid-cols-2 grid-rows-2"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-45 px-3 py-1.5 bg-muted rounded text-sm whitespace-nowrap">
                Region: JAGF
              </div>
              <div className="border border-foreground/40 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-1">
                  <span className="text-[12px] text-muted-foreground leading-none">Farm</span>
                  <span className="px-2 py-1 bg-background/80 rounded text-[20px] leading-none">2</span>
                </div>
              </div>
              <div className="border border-foreground/40 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-1">
                  <span className="text-[12px] text-muted-foreground leading-none">Farm</span>
                  <span className="px-2 py-1 bg-background/80 rounded text-[20px] leading-none">3</span>
                </div>
              </div>
              <div className="border-2 border-yellow-500 bg-yellow-500/20 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-1">
                  <span className="text-[12px] text-muted-foreground leading-none">Farm</span>
                  <span className="px-2 py-1 bg-yellow-500 text-white rounded text-[20px] leading-none">1</span>
                </div>
              </div>
              <div className="border border-foreground/40 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-1">
                  <span className="text-[12px] text-muted-foreground leading-none">Farm</span>
                  <span className="px-2 py-1 bg-background/80 rounded text-[20px] leading-none">4</span>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 4: // Farm with Multiple Block (3x3 grid)
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 45 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-48 h-48 border-2 border-yellow-500 grid grid-cols-3 grid-rows-3"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-45 px-3 py-1.5 bg-muted rounded text-sm whitespace-nowrap">
                Farm: 1
              </div>
              {[...Array(9)].map((_, i) => {
                const isCenter = i === 4;
                const blockLetter = String.fromCharCode(65 + (i > 4 ? i - 1 : i));
                return (
                  <div
                    key={i}
                    className={`border relative ${
                      isCenter ? "border-2 border-lime-500 bg-lime-500/20" : "border-foreground/40"
                    }`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-1">
                      <span className="text-[12px] text-muted-foreground leading-none">Block</span>
                      <span
                        className={`text-[18px] px-1.5 py-1 rounded leading-none ${
                          isCenter ? "bg-lime-500 text-white" : "bg-background/80"
                        }`}
                      >
                        {isCenter ? "1-A" : `1-${blockLetter}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        );

      case 5: // Block with Multiple Paddock (5x5 grid)
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 45 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-52 h-52 border-2 border-lime-500 grid grid-cols-5 grid-rows-5"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-45 px-3 py-1.5 bg-muted rounded text-sm whitespace-nowrap">
                Block: A
              </div>
              {[...Array(25)].map((_, i) => {
                const isCenter = i === 12;
                const paddockNumber = i + 1;
                return (
                  <div
                    key={i}
                    className={`border relative ${
                      isCenter ? "border-2 border-green-600 bg-green-600/20" : "border-foreground/20"
                    }`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-0.5">
                      <span className="text-[7px] text-muted-foreground leading-none">Paddock</span>
                      <span
                        className={`text-[10px] leading-none py-1 rounded`}
                      >
                        {`1-A-${paddockNumber}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        );

      case 6: // Single Paddock
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 45 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-36 h-36 border-2 border-green-600 bg-green-600/20"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-45 px-3 py-1.5 bg-green-600 text-white rounded text-sm whitespace-nowrap">
                Paddock
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45 gap-1">
                <span className="px-3 py-2 bg-green-600 text-white rounded leading-none text-2xl">1-A-1</span>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl sm:max-w-6xl max-h-[90vh] p-4 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>
              Understanding Land Unit Hierarchy
            </DialogTitle>

            {/* Keyboard Navigation Hint */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 rounded text-xs text-muted-foreground mr-8">
              <ArrowLeft className="w-3 h-3" />
              <ArrowRight className="w-3 h-3" />
              <span>Use arrow keys to navigate</span>
            </div>
          </div>
        </DialogHeader>

        <div
          className={`flex gap-4 flex-1 pr-2 -mr-2 transition-all ${isAnimating ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {/* Left Sidebar - Navigation */}
          <div className="w-64 flex flex-col gap-4 shrink-0">
            {/* Level Navigation - Column List */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1 p-2 bg-muted/30 rounded-lg border border-border/50">
                {/* All Button - Prominent */}
                <button
                  onClick={() => goToLevel(0)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all w-full text-left ${
                    currentLevel === 0
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm"
                  } cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                  aria-label="View complete hierarchy overview"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>All Levels</span>
                </button>

                {/* Separator */}
                <div className="h-px w-full bg-border my-1" />

                {/* Individual Level Buttons */}
                {[
                  { name: "Productions Units", icon: FolderOpen },
                  { name: "Regions", icon: FolderOpen },
                  { name: "Farms", icon: FolderOpen },
                  { name: "Blocks", icon: FolderOpen },
                  { name: "Paddocks", icon: FolderOpen },
                  { name: "Paddock", icon: FileText },
                ].map((item, idx) => {
                  const levelIndex = idx + 1;
                  const isActive = currentLevel === levelIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.name}
                      onClick={() => goToLevel(levelIndex)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all w-full text-left ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm"
                      } cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                      aria-label={`Go to ${item.name} level`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Section */}
            <div className="flex flex-col gap-2">
              <motion.div
                key={`description-${currentLevel}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex items-start">
                  <div className="p-2.5 bg-primary/5 rounded-md border-l-2 border-primary/30">
                    <p className="text-sm text-foreground/80 leading-snug">
                      {levels[currentLevel]?.info}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>

          {/* Right Content Area - Illustration and Info */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Main Illustration Area */}
            <div className="w-full h-[500px] relative overflow-hidden bg-muted/20 rounded-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLevel}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  {renderDiamondContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Information Panel */}
            <div className="space-y-2 shrink-0 min-h-[180px]">
              {/* Title */}
              <motion.div
                key={`title-${currentLevel}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
              >
                <h3>{levels[currentLevel]?.title}</h3>
              </motion.div>

            {/* Content in single card layout */}
            <motion.div
              key={`content-${currentLevel}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border/50 space-y-2.5"
            >
              {/* Breadcrumb Path */}
              {currentLevel > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5 flex-wrap text-sm">
                    {currentLevel === 1 && (
                      <>
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-primary">
                          Productions Unit 1
                        </span>
                      </>
                    )}
                    {currentLevel === 2 && (
                      <>
                        <span className="text-muted-foreground/60">
                          Productions Unit 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-primary">
                          JAGF
                        </span>
                      </>
                    )}
                    {currentLevel === 3 && (
                      <>
                        <span className="text-muted-foreground/60">
                          Productions Unit 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          JAGF
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-primary">
                          Farm 1
                        </span>
                      </>
                    )}
                    {currentLevel === 4 && (
                      <>
                        <span className="text-muted-foreground/60">
                          Productions Unit 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          JAGF
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          Farm 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-primary">
                          Block A
                        </span>
                      </>
                    )}
                    {currentLevel === 5 && (
                      <>
                        <span className="text-muted-foreground/60">
                          Productions Unit 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          JAGF
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          Farm 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-primary">
                          Block A
                        </span>
                      </>
                    )}
                    {currentLevel === 6 && (
                      <>
                        <span className="text-muted-foreground/60">
                          Productions Unit 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          JAGF
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          Farm 1
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <span className="text-muted-foreground/60">
                          Block A
                        </span>
                        <span className="text-muted-foreground/40">
                          /
                        </span>
                        <FileText className="w-4 h-4 text-cyan-600" />
                        <span className="text-primary">
                          Paddock 1
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Properties Card */}
                <div className="space-y-2">
                  {currentLevel === 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FolderOpen className="w-5 h-5 text-amber-600" />
                      <span className="text-sm">
                        Productions Unit → Region → Farm → Block → Paddock
                      </span>
                    </div>
                  )}

                  {currentLevel === 1 && (
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Productions Unit Id:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Productions Unit Name:
                        </span>
                        <span className="text-sm">
                          Productions Unit 1
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          FID:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                    </div>
                  )}

                  {currentLevel === 2 && (
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Region Id:
                        </span>
                        <span className="text-sm">JAGF</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Region Name:
                        </span>
                        <span className="text-sm">JAGF</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          FID:
                        </span>
                        <span className="text-sm">JAGF</span>
                      </div>
                    </div>
                  )}

                  {currentLevel === 3 && (
                    <div className="flex gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Farm Id:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Farm Name:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          FID:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                    </div>
                  )}

                  {currentLevel === 4 && (
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Block Id:
                        </span>
                        <span className="text-sm">A</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Block Name:
                        </span>
                        <span className="text-sm">A</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md cursor-help">
                              <span className="text-xs text-muted-foreground">
                                FID:
                              </span>
                              <span className="text-sm">
                                1-A
                              </span>
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Farm-Block format
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {currentLevel === 5 && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Block A contains several paddocks:
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-md text-xs">
                          <FileText className="w-3 h-3 text-cyan-600" />
                          <span>Paddock 1</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-md text-xs">
                          <FileText className="w-3 h-3 text-cyan-600" />
                          <span>Paddock 2</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ...
                        </span>
                      </div>
                    </div>
                  )}

                  {currentLevel === 6 && (
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Paddock Id:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-md">
                        <span className="text-xs text-muted-foreground">
                          Paddock Name:
                        </span>
                        <span className="text-sm">1</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-md cursor-help">
                              <span className="text-xs text-muted-foreground">
                                FID:
                              </span>
                              <span className="text-sm">
                                1-A-1
                              </span>
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Farm-Block-Paddock format
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
            </div>
          </div>
        </div>

        {/* Footer with Navigation and Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t mt-2 shrink-0">
          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={prevLevel}
              disabled={currentLevel === 0}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={nextLevel}
              disabled={currentLevel === levels.length - 1}
              size="sm"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Action Button */}
          <Button onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
