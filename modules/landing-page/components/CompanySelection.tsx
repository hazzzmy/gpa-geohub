'use client';

import { useCompanyStore, COMPANIES } from '@/lib/stores/companyStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserWithRoles } from '@/lib/auth/utils';
import { ArrowRight } from '@/lib/icons';

interface CompanySelectionProps {
  user: UserWithRoles | null;
}

// Modern logo components for companies
function GPALogo() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-xl">G</span>
    </div>
  );
}

function MNMLogo() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-xl">M</span>
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
      gradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20',
    },
    { 
      id: 'mnm', 
      name: 'Murni Nusantara Mandiri',
      logo: <MNMLogo />,
      gradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20',
    },
  ];

  return (
    <div className="w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent mb-2">
            Select Company
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-3" />
        </motion.div>
        <motion.p 
          className="text-slate-600 dark:text-slate-400 text-base transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Choose your organization
        </motion.p>
      </motion.div>

      <div className="flex flex-col gap-4 md:gap-6">
        {companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 1.2 + index * 0.15,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                href="/company/features"
                onClick={() => handleCompanySelect(company.id)}
                className="block w-full"
              >
                <div className="group relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-1 rounded-2xl px-5 md:px-6 py-6 cursor-pointer">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${company.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-slate-700/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <div className="relative flex items-center gap-4">
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
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {company.name}
                      </h3>
                    </div>
                    
                    {/* Arrow indicator */}
                    <motion.div
                      className="flex-shrink-0"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </motion.div>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

