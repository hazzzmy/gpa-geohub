"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/lib/stores/companyStore";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SubNavbar() {
  const pathname = usePathname();
  const { selectedCompany } = useCompanyStore();

  // Check if current path is a company detail page
  // Show sub-navbar on all /company/* routes (except root /company if exists)
  const isCompanyDetailPage = pathname.startsWith('/company/') && pathname !== '/company';

  // Only show sub-navbar on company detail pages when company is selected
  if (!isCompanyDetailPage || !selectedCompany) {
    return null;
  }

  // Get page name from pathname for breadcrumb
  const getPageName = (path: string): string => {
    const pathMap: Record<string, string> = {
      '/company/features': 'Features',
      '/company/land-management': 'Land Management',
    };
    return pathMap[path] || path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const pageName = getPageName(pathname);
  const isFeaturesPage = pathname === '/company/features';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-16 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center h-12">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link 
                    href="/" 
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {!isFeaturesPage && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link 
                        href="/company/features" 
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                      >
                        {selectedCompany.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-900 dark:text-slate-100">
                  {isFeaturesPage ? selectedCompany.name : pageName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </motion.nav>
  );
}

