import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Company {
  id: string;
  name: string;
  code: string;
  logo?: string;
}

export const COMPANIES: Company[] = [
  {
    id: 'gpa',
    name: 'PT. GLOBAL PAPUA ABADI',
    code: 'GPA',
    logo: '/logo.webp', // You can add custom logos later
  },
  {
    id: 'mnm',
    name: 'MURNI NUSANTARA MANDIRI',
    code: 'MNM',
    logo: '/logo.webp', // You can add custom logos later
  },
];

interface CompanyStore {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  clearSelectedCompany: () => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      clearSelectedCompany: () => set({ selectedCompany: null }),
    }),
    {
      name: 'company-storage',
    }
  )
);



