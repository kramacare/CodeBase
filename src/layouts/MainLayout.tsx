import React from "react";
import Header from "@/components/layout/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="p-4 border-t text-sm text-center">
        © 2026 QueueSmart
      </footer>
    </div>
  );
};

export default MainLayout;
