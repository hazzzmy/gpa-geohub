// Export all stores
export { useMapFilterStore } from './mapFilterStore';
export { useCompanyStore, COMPANIES } from './companyStore';
export type { Company } from './companyStore';

// Re-export Zustand types for convenience
export type { StateCreator } from 'zustand';