// Main App Types
import { UserWithRoles } from '@/lib/auth/utils';

export interface MainAppLayoutProps {
  children?: React.ReactNode;
  initialActiveAction?: string;
  userId?: string;
}

export interface MainAppContainerProps {
  user: UserWithRoles;
  activeQuickAction?: string;
  userId?: string;
}
