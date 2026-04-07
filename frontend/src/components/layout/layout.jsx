import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-(--color-bg) text-(--color-text) transition-colors duration-300">
      <div className="flex h-full min-h-0">
        
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Wrapper */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-none bg-(--color-bg)">
            <div className="mx-auto max-w-7xl p-4 sm:p-8 lg:p-10">
              {children}
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}