"use client"

import { useEffect, useState } from "react"
import { X } from 'lucide-react'
import { Button } from "../ui/button"

interface NotificationPopupProps {
  message: string
  duration?: number // Duration in milliseconds, default to 3000 (3 seconds)
  onClose: () => void
}

export function NotificationPopup({ message, duration = 3000, onClose }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md bg-gray-500 px-4 py-2 text-white shadow-lg transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-full text-center h-50px w-240px">
      <span>{message}</span>
    </div>
  )
}
