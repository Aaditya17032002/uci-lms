"use client"
 
import { useState } from "react"
import { LeaveManagementPage } from "../../modules/leave-management/leave-management-page"

interface LeaveManagementProps {
  isDarkMode?: boolean
  sidebarOpen?: boolean
}

export default function LeaveManagement({ isDarkMode, sidebarOpen }: LeaveManagementProps) {
  return <LeaveManagementPage />
}
