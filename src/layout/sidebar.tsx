"use client"
import { cn } from "../lib/utils" // or wherever your utils are
import { LayoutDashboard, Clock, UserCheck, Calendar, CalendarPlus, BriefcaseBusiness, BarChart3, Hourglass } from 'lucide-react'
import { Link, useLocation } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  roleId: string;
}

const rolePermissions: Record<number, string[]> = {
  1: ["dashboard", "approver", "leave-management"], // HR
  2: ["dashboard", "approvals", "engagements", "reports"], // Manager
  3: ["dashboard", "timesheet", "leaves"], // Employee
  4: ["dashboard", "timesheet", "leaves", "approver", "leave-management", "approvals", "engagements", "reports"], // Admin (all)
};

export function Sidebar({ isOpen, onToggle }: SidebarProps) {


  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "timesheet", title: "Add/View Timesheet", icon: Clock, href: "/timesheet" },
    { id: "leaves", title: "Add/View Leaves", icon: CalendarPlus, href: "/add-view-leaves" },
    { id: "approver", title: "Assign Approver", icon: UserCheck, href: "/assign-approver" },
    { id: "leave-management", title: "Leave Management", icon: Calendar, href: "/leave-management" },
    { id: "approvals", title: "Review & Approvals", icon: Hourglass, href: "/pending-approvals" },
    { id: "engagements", title: "Manage Engagements", icon: BriefcaseBusiness, href: "/manage-engagements" },
    { id: "reports", title: "Reports", icon: BarChart3, href: "/reports" },
  ]

  const location = useLocation()

  // Get roles from localStorage
  const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]") as number[];


  // Always include Employee role (3)
  const roles = storedRoles.includes(3) ? storedRoles : [...storedRoles, 3];
  

  // If Admin (4), allow all modules
  const allowedItems =
    roles.includes(4)
      ? menuItems.map((item) => item.id)
      : Array.from(new Set(roles.flatMap((r) => rolePermissions[r] || [])));

  console.log("Allowed items based on roles:", roles, allowedItems);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}

      <div
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 shadow-lg transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <nav className="p-4 space-y-2 overflow-y-auto h-full">
 
          {menuItems
            .filter(item => allowedItems.includes(item.id))
            .map((item) => {
              const isActive = location.pathname === item.href
              return (

                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onToggle()
                    }
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              )
            })}
        </nav>
      </div>
    </>
  )
}
