import { Outlet, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Target,
  Send,
  Globe,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/leads", label: "Leads", icon: Users },
  { path: "/icp", label: "ICP Builder", icon: Target },
  { path: "/outreach", label: "Outreach", icon: Send },
  { path: "/sources", label: "Sources", icon: Globe },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0A0E1A] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/[0.06] bg-[#0A0E1A] transition-all duration-300 ${
          collapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#00D4FF]" />
          </div>
          {!collapsed && (
            <span className="font-['Space_Grotesk'] font-medium text-[15px] text-[#F0F4F8]">
              LeadNexus
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-[#00D4FF]/10 text-[#00D4FF]"
                    : "text-[#8B95A5] hover:text-[#F0F4F8] hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && (
                  <span className="text-[13px] font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 border-t border-white/[0.06] space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8B95A5] hover:text-[#F0F4F8] hover:bg-white/[0.04] transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8B95A5] hover:text-[#EF4444] hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-[13px]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6 bg-[#0A0E1A]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#8B95A5] hover:text-[#F0F4F8] hover:border-white/[0.1] transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[12px]">Search leads...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-[#8B95A5]">
                /
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-[#8B95A5] hover:text-[#F0F4F8] hover:bg-white/[0.04] transition-all">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D4FF]" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                <span className="text-[11px] font-medium text-[#00D4FF]">
                  {user?.name?.charAt(0) ?? "U"}
                </span>
              </div>
              <span className="text-[13px] text-[#F0F4F8]">
                {user?.name ?? "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
