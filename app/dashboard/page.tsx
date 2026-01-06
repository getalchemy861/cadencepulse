import { Header } from "@/components/dashboard/header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans text-[#1a5f4a]">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <DashboardContent />
      </main>
    </div>
  );
}
