import React, { useState } from 'react';
import { Sidebar } from "./Sidebar";
import { UserRoleDisplay } from "./UserRoleDisplay";

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={setSidebarCollapsed} 
      />
      <main className="flex-1 overflow-auto relative">
        {children}
        <UserRoleDisplay sidebarCollapsed={sidebarCollapsed} />
      </main>
    </div>
  );
} 