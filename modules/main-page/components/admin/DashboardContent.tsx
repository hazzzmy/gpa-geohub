"use client";

import React, { useState } from "react";
import { UserWithRoles } from "@/lib/auth/utils";
import dynamic from "next/dynamic";
import { useMapFilterStore } from "@/lib/stores/mapFilterStore";
import { MainLayoutWithRightPanel } from "../MainLayoutWithRightPanel";

const ArcGISMap = dynamic(() => import("@/components/map/ArcGISMap"), { ssr: false });

interface DashboardContentProps {
  user: UserWithRoles;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const selectedNode = useMapFilterStore((state) => state.selectedNode);

  return (
    <MainLayoutWithRightPanel selectedNode={selectedNode}>
      <div className="w-full h-full flex-1">
        <ArcGISMap />
      </div>
    </MainLayoutWithRightPanel>
  );
}


