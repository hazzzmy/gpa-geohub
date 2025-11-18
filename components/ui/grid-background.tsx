"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function GridBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to light theme during SSR and initial load
  const isDark = mounted && resolvedTheme === 'dark';

  const backgroundStyle = isDark ? {
    backgroundColor: 'rgb(15, 23, 42)', // slate-900 for dark mode
    backgroundImage: `
      linear-gradient(RGB(27, 38, 54) 1px, transparent 1px),
      linear-gradient(90deg, RGB(27, 38, 54) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  } : {
    backgroundColor: 'white', // white for light mode
    backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  };

  const overlayStyle = isDark ? {
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(15, 23, 42, 0.8) 70%)'
  } : {
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255, 255, 255, 0.8) 70%)'
  };

  return (
    <div
      className={cn(
        "h-[50rem] w-full relative flex items-center justify-center",
        className
      )}
      style={backgroundStyle}
    >
      {/* Subtle radial gradient overlay */}
      <div
        className="absolute pointer-events-none inset-0 flex items-center justify-center"
        style={overlayStyle}
      ></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function GridSmallBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-[50rem] w-full dark:bg-slate-900 bg-white dark:bg-grid-small-gray bg-grid-small-black/[0.2] relative flex items-center justify-center",
        className
      )}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-slate-900 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]"></div>
      {children}
    </div>
  );
}

export function DotBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-[50rem] w-full dark:bg-slate-900 bg-white dark:bg-dot-gray bg-dot-black/[0.2] relative flex items-center justify-center",
        className
      )}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-slate-900 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]"></div>
      {children}
    </div>
  );
}

