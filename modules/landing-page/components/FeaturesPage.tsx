'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCompanyStore } from '@/lib/stores/companyStore';
import { ArrowRight, Database, MapPin, BarChart3 } from '@/lib/icons';

const features = {
  commonOperationalPicture: [
    {
      title: 'Land Management',
      description: 'Provides an overview of land management progress, covering clearing, preparation, development, and planting.',
      image: '/images/land-management.jpg',
      icon: BarChart3,
    },
    {
      title: 'Crop Establishment',
      description: 'Real-time monitoring of sugarcane germination performance.',
      image: '/images/crop-establishment.jpg',
      icon: BarChart3,
    },
    {
      title: 'Insecticide Spraying',
      description: 'Dashboard showcasing completed drone spraying missions.',
      image: '/images/insecticide-spraying.jpg',
      icon: BarChart3,
    },
  ],
  mapApplications: [
    {
      title: 'Infrastructure Progress Update',
      description: 'Interactive map for tracking construction progress.',
      image: '/images/infrastructure.jpg',
      icon: MapPin,
    },
    {
      title: 'Forest Fire & Land Cover Change',
      description: 'Map application to monitor fire locations and affected areas.',
      image: '/images/forest-fire.jpg',
      icon: MapPin,
    },
    {
      title: 'Soil Sampling',
      description: 'Interactive map for visualizing soil sampling locations and analyzing nutrient availability.',
      image: '/images/soil-sampling.jpg',
      icon: MapPin,
    },
    {
      title: 'Nursery Sermayam',
      description: 'Map application to monitor Nursery Sermayam.',
      image: '/images/nursery.jpg',
      icon: MapPin,
    },
  ],
  dataDirectory: [
    {
      title: 'Land Management',
      icon: BarChart3,
      description: 'Access land management data and reports',
    },
    {
      title: 'Crop Establishment',
      icon: Database,
      description: 'View crop establishment metrics and analytics',
    },
  ],
};

export default function FeaturesPage() {
  const { selectedCompany } = useCompanyStore();

  // Redirect to home if no company selected
  if (!selectedCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            Please select a company first
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative py-16 md:py-20 overflow-hidden">
        {/* Background with subtle gradient and grid */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300" />
          <div 
            className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15] transition-opacity duration-300"
            style={{
              backgroundImage: `
                linear-gradient(rgba(100, 116, 139, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100, 116, 139, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent dark:via-blue-900/10 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-4"
            >
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight"
              >
                GeoHUB Platform
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-3"
              >
                <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium">
                  {selectedCompany.name}
                </p>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Transform your farm data into actionable intelligence. Access real-time analytics and make data-driven decisions for better agricultural outcomes.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Side - Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex-shrink-0"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 text-base md:text-lg px-6 md:px-8 py-6 md:py-7 shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
              >
                <Link href="/main" className="flex items-center gap-2">
                  Fields Portal Exploration
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Common Operational Picture */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-12">
            Common Operational Picture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.commonOperationalPicture.map((feature, index) => {
              const isLandManagement = feature.title === 'Land Management';
              
              const cardContent = (
                <Card className={`h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden ${isLandManagement ? 'cursor-pointer' : ''}`}>
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                    <feature.icon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {isLandManagement ? (
                    <Link href="/company/land-management" className="block">
                      {cardContent}
                    </Link>
                  ) : (
                    cardContent
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Map Applications */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-12">
            Map Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.mapApplications.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
                    <feature.icon className="w-16 h-16 text-green-600 dark:text-green-400" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data Directory */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-12">
            Data Directory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.dataDirectory.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

