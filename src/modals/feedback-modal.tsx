"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { X, Send } from "lucide-react"
import { Button } from "../ui/button"
import { SelectValue } from "../ui/select"
import { apiClient as fetchApi } from "../lib/utils"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode?: boolean
}

export function FeedbackModal({ isOpen, onClose, isDarkMode }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    requestType: "",
    title: "",
    description: "",
    priority: "",
    dateNeeded: "",
    category: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  // Load user info from session or localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userName")
    const storedEmail = localStorage.getItem("userEmail") // optional if saved in login
    if (storedUser) setUserName(storedUser)
    if (storedEmail) setUserEmail(storedEmail)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
    // Prepare payload based on backend API
    const requestDateIso = new Date().toISOString()
    const endDateIso = formData.dateNeeded ? new Date(formData.dateNeeded).toISOString() : requestDateIso

    const payload = {
      logId: 0,
      requestDate: requestDateIso,
      endDate: endDateIso,
      name: userName || "Unknown User",
      senderEmail: userEmail || "",
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      requestType: formData.requestType,
    } as const

    console.log("Sending payload:", payload)
    
    const result = await fetchApi.request("/Admin/sendFeedback", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    console.log("Feedback submitted:", result)

    // Reset form and close modal
    setFormData({
      requestType: "",
      title: "",
      description: "",
      priority: "",
      dateNeeded: "",
      category: "",
    })
    

    // Show success message (you can replace this with a toast notification)
    alert("Feedback submitted successfully!")
    onClose();
  }
  catch (error) {
    console.error("Error submitting feedback:", error);
    alert("Failed to submit feedback. Please try again later.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-3xl h-175 rounded-lg shadow-xl ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-xl font-semibold">System Feedback & Support Request</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 ${isDarkMode ? "hover:bg-white" : "hover:bg-gray-100"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Request Type & Category in one row */}
          <div className="flex gap-4">
            {/* Request Type */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Type of Request <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.requestType}
                onChange={(e) => handleInputChange("requestType", e.target.value)}
                required
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
              <option value="" disabled hidden>
    Select Request Type
  </option>
                <option value="Defect">Bug Report</option>
                <option value="Enhancement">Feature Request</option>
                <option value="Query">Technical Support</option>
                <option value="Configuration Change">General Feedback</option>
                <option value="Other">Training Request</option>
              </select>
            </div>
          </div>


          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title of Request <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter a brief title for your request"
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Please provide detailed information about your request, including steps to reproduce (for bugs) or specific requirements (for features)"
              required
              rows={4}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Priority & Date Needed in one row */}
        <div className="flex gap-4">
          {/* Priority */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            ><option value="" disabled hidden>
              Select Priority
              </option>
              <option value="low">Low(Future Release)</option>
              <option value="medium">Medium(3 to 5 days)</option>
              <option value="high">High(1 to 2 days)</option>
              <option value="urgent">Urgent (Will be addressed immediately)</option>
            </select>
          </div>

          {/* Date Needed */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">When do you need this?</label>
            <input
              type="date"
              value={formData.dateNeeded}
              onChange={(e) => handleInputChange("dateNeeded", e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
