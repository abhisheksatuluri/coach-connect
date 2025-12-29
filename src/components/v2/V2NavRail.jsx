import React from 'react';
import {
  Users,
  Video,
  Map as MapIcon,
  CheckSquare,
  Book,
  Lightbulb,
  CreditCard,
  Briefcase,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Users, label: "Clients", path: "/v2/clients" },
  { icon: Video, label: "Sessions", path: "/v2/sessions" },
  { icon: MapIcon, label: "Journeys", path: "/v2/journeys" },
  { icon: CheckSquare, label: "Tasks", path: "/v2/tasks" },
  { icon: Book, label: "Notebook", path: "/v2/notebook" },
  { icon: Lightbulb, label: "Knowledge", path: "/v2/knowledge-base" },
  { icon: CreditCard, label: "Payments", path: "/v2/payments" },
  { icon: Briefcase, label: "Practitioners", path: "/v2/practitioners" },
];

export default function V2NavRail({ className }) {
  const location = useLocation();

  return (
    <div className={cn("w-[64px] flex flex-col items-center py-6 bg-[#0F172A] border-r border-[#334155] h-screen fixed left-0 top-0 z-50", className)}>
      {/* Logo */}
      <div className="mb-12">
        <Link to="/v2" className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#4338CA] flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <span className="text-white font-bold text-sm">M</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-[48px] w-full items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex items-center justify-center w-full"
            >
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[40px] h-[40px] bg-[#1E293B] rounded-[12px] border border-[#334155]"></div>
                </div>
              )}

              <div
                className={cn(
                  "relative z-10 w-10 h-10 flex items-center justify-center transition-all duration-200",
                  isActive ? "text-[#F8FAFC]" : "text-[#94A3B8] group-hover:text-[#F8FAFC]"
                )}
              >
                <item.icon className={cn("w-[20px] h-[20px]", isActive && "drop-shadow-[0_0_8px_rgba(248,250,252,0.3)]")} />
              </div>

              {/* Active Indicator Dot (optional flare) */}
              {isActive && (
                <div className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-[3px] h-[24px] bg-[#4F46E5] rounded-r-full shadow-[0_0_10px_#4F46E5]" />
              )}

              {/* Tooltip */}
              <div className="absolute left-[56px] px-3 py-1.5 bg-[#1E293B] text-[#F8FAFC] text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 border border-[#334155] shadow-xl translate-x-2 group-hover:translate-x-0">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-6 w-full items-center mt-auto pb-4">
        <button className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-2 rounded-lg hover:bg-[#1E293B]">
          <Settings className="w-[20px] h-[20px]" />
        </button>
      </div>
    </div>
  );
}
