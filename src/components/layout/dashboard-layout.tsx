"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { 
  LayoutGrid, 
  ClipboardCheck, 
  Shield, 
  BarChart4,
  Menu,
  X
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Assessment", href: "/assessment", icon: ClipboardCheck },
    { name: "Compliance", href: "/compliance", icon: Shield },
    { name: "Reports", href: "/reports", icon: BarChart4 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.nav
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed top-0 left-0 h-full bg-card border-r z-30"
      >
        <div className="flex h-16 items-center justify-between px-4">
          {isSidebarOpen ? (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold"
            >
              Crypto Compliance
            </motion.h1>
          ) : null}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-accent"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="px-2 py-4">
          {navigation.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="flex items-center gap-x-3 px-3 py-2 rounded-md hover:bg-accent group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </motion.a>
          ))}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-[280px]" : "ml-[80px]"
        }`}
      >
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Copilot Sidebar */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Compliance Assistant",
          initial: `👋 Welcome! I can help you with:

- Assessing compliance requirements
- Verifying regulatory controls
- Generating compliance reports
- Analyzing risk metrics

What would you like to work on?`
        }}
      />
    </div>
  );
}