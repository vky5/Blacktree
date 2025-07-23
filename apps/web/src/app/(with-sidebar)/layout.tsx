// components/layouts/WithSidebarLayout.tsx

import Sidebar from "@/components/shared/Sidebar";
import { ReactNode } from "react";

export default function WithSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#0d0f1a] text-white antialiased">
      <Sidebar />
      <main className="relative z-0 pl-16 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
