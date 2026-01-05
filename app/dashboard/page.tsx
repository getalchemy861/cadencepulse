import { Header } from "@/components/dashboard/header";
import { ContactList } from "@/components/dashboard/contact-list";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <Header />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <ContactList />
      </main>
    </div>
  );
}
