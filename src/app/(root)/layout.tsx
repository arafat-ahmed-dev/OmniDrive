import React from "react";
import SideBar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/action/user.action";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return redirect("/sign-in");
  return (
    <main className="flex h-screen">
      <SideBar {...currentUser} />
      <section>
        <MobileNavigation />
        <Header />
        <div className="main-content">{children}</div>
      </section>
    </main>
  );
};

export default Layout;
