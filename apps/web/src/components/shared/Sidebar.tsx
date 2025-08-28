"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Rocket, Plus, Search, Settings } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const topNavItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    url: "/dashboard",
  },
  { name: "Deployments", icon: <Rocket size={18} />, url: "/deployments" },
  { name: "Create New", icon: <Plus size={18} />, url: "/developers" },
  { name: "Explore APIs", icon: <Search size={18} />, url: "/marketplace" },
];

const bottomNavItem = {
  name: "Account Settings",
  icon: <Settings size={18} />,
  url: "/settings",
};

export default function Sidebar({
  onExpandChange,
}: {
  onExpandChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const handleExpandChange = useCallback(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);

  useEffect(() => {
    handleExpandChange();
  }, [handleExpandChange]);

  const isActive = (url: string) => pathname === url;

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={clsx(
        "z-50 fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden",
        "bg-[#030712] border-r border-[#1a1f2e]",
        expanded ? "w-64" : "w-16"
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col py-6">
        {/* Logo/Brand */}
        <div className="flex flex-col space-y-1 px-3 mb-8">
          <div
            className={clsx(
              "flex items-center px-3 py-3 rounded-lg transition-all duration-200"
              // expanded ? "bg-[#05191D]" : ""
            )}
          >
            {/* Green dot */}

            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-sm bg-[#33CF96] opacity-75 animate-ping" />
              <div className="relative w-3 h-3 rounded-sm bg-[#33CF96]" />
            </div>

            {/* Brand name */}
            <span
              className={clsx(
                "ml-3 text-sm font-semibold tracking-wide transition-all duration-200",
                expanded ? "opacity-100 text-white delay-75" : "opacity-0"
              )}
            >
              Blacktree
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-1 px-3">
          {topNavItems.map((item, index) => {
            const active = isActive(item.url);
            return (
              <Link
                href={item.url}
                key={index}
                className={clsx(
                  "flex items-center px-3 py-3 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-[#05191D] text-[#33CF96]"
                    : "text-gray-400 hover:bg-[#1a1f2e] hover:text-white"
                )}
              >
                <div
                  className={clsx(
                    "flex-shrink-0 transition-colors duration-200",
                    active
                      ? "text-[#33CF96]"
                      : "text-gray-500 group-hover:text-gray-300"
                  )}
                >
                  {item.icon}
                </div>
                <span
                  className={clsx(
                    "ml-3 text-sm font-medium whitespace-nowrap transition-all duration-200",
                    expanded ? "opacity-100 delay-75" : "opacity-0"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col px-3 mb-6">
        <Link
          href={bottomNavItem.url}
          className={clsx(
            "flex items-center px-3 py-3 rounded-lg transition-all duration-200 group",
            isActive(bottomNavItem.url)
              ? "bg-[#05191D] text-[#33CF96]"
              : "text-gray-400 hover:bg-[#1a1f2e] hover:text-white"
          )}
        >
          <div
            className={clsx(
              "flex-shrink-0 transition-colors duration-200",
              isActive(bottomNavItem.url)
                ? "text-[#33CF96]"
                : "text-gray-500 group-hover:text-gray-300"
            )}
          >
            {bottomNavItem.icon}
          </div>
          <span
            className={clsx(
              "ml-3 text-sm font-medium whitespace-nowrap transition-all duration-200",
              expanded ? "opacity-100 delay-75" : "opacity-0"
            )}
          >
            {bottomNavItem.name}
          </span>
        </Link>
      </div>
    </div>
  );
}
