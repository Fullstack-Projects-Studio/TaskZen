import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { FocusMode } from "@/components/focus/focus-mode";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?error=AccountDeleted");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <SidebarContent>
        <Header />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </SidebarContent>
      <BottomTabBar />
      <FocusMode />
    </div>
  );
}
