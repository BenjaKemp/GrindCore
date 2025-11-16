import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="lg:ml-60">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

