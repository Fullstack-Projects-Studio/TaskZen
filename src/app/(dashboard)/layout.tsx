import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { FocusMode } from "@/components/focus/focus-mode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <SidebarContent>
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarContent>
      <FocusMode />
    </div>
  );
}
