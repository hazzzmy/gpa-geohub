'use client';

import { useCompanyStore, COMPANIES } from '@/lib/stores/companyStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserWithRoles } from '@/lib/auth/utils';

interface CompanySelectionProps {
  user: UserWithRoles | null;
}

// Simple logo components for companies
function GPALogo() {
  return (
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
      <span className="text-white font-bold text-lg">G</span>
    </div>
  );
}

function MNMLogo() {
  return (
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
      <span className="text-white font-bold text-lg">M</span>
    </div>
  );
}

export default function CompanySelection({ user }: CompanySelectionProps) {
  const { setSelectedCompany } = useCompanyStore();

  const handleCompanySelect = (companyId: string) => {
    const company = COMPANIES.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
    }
  };

  const companies = [
    { 
      id: 'gpa', 
      name: 'Global Papua Abadi',
      logo: <GPALogo />,
    },
    { 
      id: 'mnm', 
      name: 'Murni Nusantara Mandiri',
      logo: <MNMLogo />,
    },
  ];

  return (
    <div className="w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-6"
      >
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Select Company
        </motion.h2>
        <motion.p 
          className="text-slate-600 dark:text-white/70 text-sm transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Choose your organization
        </motion.p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 1.2 + index * 0.15,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <motion.div
              whileHover={{ scale: 1.03, x: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                href="/company/features"
                onClick={() => handleCompanySelect(company.id)}
                className="block w-full"
              >
                <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 border-2 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl px-4 md:px-6 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-slate-700/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <div className="relative flex items-center gap-3">
                    {/* Logo */}
                    <motion.div
                      className="flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      {company.logo}
                    </motion.div>
                    
                    {/* Company Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                        {company.name}
                      </h3>
                    </div>
                    
                    {/* Arrow indicator */}
                    <motion.svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ x: 0 }}
                      whileHover={{ x: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </motion.svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

