"use client";

import React, { useState, useEffect } from "react";

interface Level {
  id: number;
  title: string;
  subtitle: string;
  info: string;
}

const levels: Level[] = [
  {
    id: 0,
    title: "Complete Hierarchy Overview",
    subtitle: "Productions Unit → Region → Farm → Block → Paddock",
    info: "The complete land unit hierarchy, showing how larger units subdivide into smaller management areas from Productions Unit down to individual Paddocks.",
  },
  {
    id: 1,
    title: "Multiple Productions Units",
    subtitle: "Showing different productions units in the system",
    info: "The system can manage multiple productions units. Each productions unit represents a major processing facility and its associated land management areas.",
  },
  {
    id: 2,
    title: "Productions Unit with Multiple Regions",
    subtitle: "Productions Unit Id : 1\nProductions Unit Name : Productions Unit 1\nFID : 1",
    info: "Region is a geographical subdivision within a productions unit. Each region (like JAGF) represents a distinct area that groups multiple farms for better management and organization.",
  },
  {
    id: 3,
    title: "Region with Multiple Farms",
    subtitle:
      "Region Id : JAGF\nRegion Name : JAGF\nFID : JAGF",
    info: "Farm is an operational unit within a region. Each farm has its own management structure and is identified by a Farm ID, serving as the primary production area.",
  },
  {
    id: 4,
    title: "Farm with Multiple Blocks",
    subtitle: "Farm Id : 1\nFarm Name : 1\nFID : 1",
    info: "Block is a subdivision within a farm, typically organized alphabetically (A, B, C, etc.). Blocks help organize large farm areas into manageable sections. The FID format is 'Farm-Block' (e.g., 1-A).",
  },
  {
    id: 5,
    title: "Block with Multiple Paddocks",
    subtitle: "Block Id : A\nBlock Name : A\nFID : 1-A",
    info: "Paddock is the smallest field-level unit within a block. Each paddock enables detailed tracking of specific agricultural activities like planting, fertilization, and harvesting at the most granular level.",
  },
  {
    id: 6,
    title: "Single Paddock",
    subtitle: "Paddock Id : 1\nBlock Name : 1\nFID : 1-A-1",
    info: "Paddock is the smallest unit where specific agricultural activities are tracked. The FID '1-A-1' means Farm 1, Block A, Paddock 1.",
  },
];

export function useLandUnitHierarchy(open: boolean) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentLevel(0);
      setIsAnimating(true);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowRight" &&
        currentLevel < levels.length - 1
      ) {
        nextLevel();
      } else if (e.key === "ArrowLeft" && currentLevel > 0) {
        prevLevel();
      } else if (e.key === "Escape") {
        // Handle escape in parent component
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentLevel]);

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentLevel(currentLevel + 1);
        setTimeout(() => setIsAnimating(false), 800);
      }, 300);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentLevel(currentLevel - 1);
        setTimeout(() => setIsAnimating(false), 800);
      }, 300);
    }
  };

  const goToLevel = (level: number) => {
    if (
      level !== currentLevel &&
      level >= 0 &&
      level < levels.length
    ) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentLevel(level);
        setTimeout(() => setIsAnimating(false), 800);
      }, 300);
    }
  };

  const getCurrentLevelData = () => {
    return levels[currentLevel];
  };

  return {
    currentLevel,
    isAnimating,
    nextLevel,
    prevLevel,
    goToLevel,
    levels,
    getCurrentLevelData,
  };
}
