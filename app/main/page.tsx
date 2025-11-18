import { MainAppLayout } from "@/modules/main-page/layout/MainAppLayout/MainAppLayout";

interface DashboardPageProps {
  searchParams: Promise<{
    action?: string;
    userId?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const { action, userId } = resolvedSearchParams;

  return (
    <MainAppLayout
      initialActiveAction={action || "dashboard"}
      userId={userId}
    />
  );
}
