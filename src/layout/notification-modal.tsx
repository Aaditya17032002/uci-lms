//new code --notification-modal, --------------------issue solved
 
 
"use client"
 
import { useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"

import { Badge } from "../ui/badge"

import { Bell, CheckCircle, XCircle, Clock, UserCheck, Calendar, X } from "lucide-react"

import { Button } from "../ui/button"
 
interface NotificationModalProps {

  isOpen: boolean

  onClose: () => void

}
 
const initialNotifications = [

  {

    id: 1,

    type: "timesheet_approved",

    title: "Timesheet Approved",

    message: "Your timesheet for week Aug 04-10, 2025 has been approved by Paritosh Unakar",

    time: "2 hours ago",

    icon: CheckCircle,

    color: "text-green-600",

    border: "border-green-300",

  },

  {

    id: 2,

    type: "timesheet_rejected",

    title: "Timesheet Rejected",

    message: "Your timesheet for week Jul 28-Aug 03, 2025 was rejected by Sarah Johnson",

    reason: "Missing task details for Friday entries",

    time: "1 day ago",

    icon: XCircle,

    color: "text-red-600",

    border: "border-red-200",

  },

  {

    id: 3,

    type: "leave_approved",

    title: "Leave Request Approved",

    message: "Your casual leave request for Aug 15-16, 2025 has been approved by HR",

    time: "2 days ago",

    icon: Calendar,

    color: "text-blue-600",

    border: "border-blue-300",

  },

  {

    id: 4,

    type: "approver_changed",

    title: "Approver Changed",

    message: "Your primary approver has been changed from Mike Wilson to Paritosh Unakar",

    time: "3 days ago",

    icon: UserCheck,

    color: "text-purple-600",

    border: "border-purple-200",

  },

  {

    id: 5,

    type: "timesheet_pending",

    title: "Timesheet Submission Reminder",

    message: "Your timesheet for current week is pending submission. Deadline: Aug 11, 2025",

    time: "5 hours ago",

    icon: Clock,

    color: "text-orange-600",

    border: "border-orange-200",

  },

]
 
export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {

  const [notifList, setNotifList] = useState(initialNotifications)
 
  const dismissNotification = (id: number) => {

    setNotifList((prev) => prev.filter((n) => n.id !== id))

  }
 
  const dismissAll = () => {

    setNotifList([])

  }
 
  return (
<Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&_[data-slot='dialog-close']]:hidden">

       {/* Top-right custom close with hover dropdown */}
<div className="absolute right-3 top-3 z-50">
<div className="relative group">
<button className="text-gray-400 hover:text-gray-600">
<X className="w-4 h-4" />
</button>

            {/* Dropdown menu - shows on hover */}
<div className="absolute right-0 top-6 w-32 bg-white border rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

              {/* Close the dialog */}
<button

                onClick={onClose}

                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
>

                Close
</button>
<button

                onClick={dismissAll}

                className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
>

                Dismiss All
</button> 
</div>
</div>
</div>
<DialogHeader className="flex items-center justify-center relative">
<DialogTitle className="flex items-left gap-2">
<Bell className="w-5 h-5 text-blue-600" />

            Notifications
<Badge className="ml-2 bg-red-500 text-white">{notifList.length}</Badge>       
</DialogTitle>
</DialogHeader>
 
        <div className="space-y-4">

          {notifList.length === 0 && <p className="text-center text-gray-500">No notifications</p>}
 
          {notifList.map((notification) => (
<div

              key={notification.id}

              className={`p-4 rounded-lg border ${notification.border} border-opacity-50`}
>
<div className="flex items-start gap-3">
<div className="p-2 rounded-full">
<notification.icon className={`w-4 h-4 ${notification.color}`} />
</div>
<div className="flex-1">
<h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
<p className="text-sm text-gray-700 mb-2">{notification.message}</p>

                  {notification.reason && (
<p className="text-sm p-2 rounded border-l-4 border-red-400">
<strong>Reason:</strong> {notification.reason}
</p>

                  )}
<p className="text-xs text-gray-500 mt-2">{notification.time}</p>
</div>
<button

                  onClick={() => dismissNotification(notification.id)}

                  className="text-gray-400 hover:text-gray-600"
>
<X className="w-4 h-4" />
</button>
</div>
</div>

          ))}
</div>
</DialogContent>
</Dialog>

  )

}
 