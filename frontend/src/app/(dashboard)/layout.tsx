"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import NotificationPanel from "@/components/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LayoutDashboard, MessageSquare, BarChart3, Target, LogOut, Wallet, Sparkles,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Advisor", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-content-3">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--surface)" }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col border-r border-outline flex-shrink-0"
        style={{ background: "var(--surface-sidebar)" }}>
        {/* Logo */}
        <div className="p-5 border-b border-outline">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-content">Wealth Advisor</div>
              <div className="text-xs text-content-4">IDBI Bank · AI Powered</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`nav-link ${active ? "active" : ""}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-outline">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-outline-2 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-content truncate">{user.name}</div>
              <div className="text-xs text-content-4 truncate">{user.email}</div>
            </div>
            <button onClick={logout}
              className="opacity-0 group-hover:opacity-100 text-content-4 hover:text-red-500 transition-all"
              title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-13 border-b border-outline flex items-center justify-end px-5 gap-3 flex-shrink-0"
          style={{ background: "var(--surface-card)" }}>
          <ThemeToggle />
          <NotificationPanel />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
