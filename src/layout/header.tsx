// == responsive ==

"use client"
import { useState } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Menu, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { NotificationModal } from "./notification-modal"

interface HeaderProps {
  onSidebarToggle: () => void
  onThemeToggle: () => void
}

export function Header({ onSidebarToggle, onThemeToggle }: HeaderProps) {
  const [notifications] = useState(5) // Mock notification count
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 h-16 bg-white border-gray-200`}
    >
      <div className="flex items-center justify-between h-full">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Always-visible Hamburger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSidebarToggle();
            }}
            className="p-2"
          >
            <Menu className={`w-5 h-5 text-gray-600`} />
          </Button>

          {/* Company Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/images/uci-logo.png"
              alt="UCI Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <h1
              className={`text-base sm:text-lg font-semibold leading-tight
                whitespace-normal break-words max-w-[150px] sm:max-w-none
                text-gray-800`}
            >
              Timesheet Management System
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 relative"
            onClick={() => setIsNotificationOpen(true)}
          >
            <Bell className={`w-5 h-5 text-gray-600`} />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3 py-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">JD</span>
                </div>
                <span
                  className={`hidden sm:inline text-sm font-medium
                 text-gray-700`}
                >
                  John Doe
                </span>
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </header>
  )
}

