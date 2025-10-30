"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { CheckCircle, XCircle, Clock, X, Check } from 'lucide-react'
import { toast } from "../hooks/use-toast"

interface LeaveReviewModalProps {
  isOpen: boolean
  onClose: () => void
  leaveRequest: any
  isViewOnly?: boolean
  onActionComplete?: (result: "approved" | "rejected", requestID: number) => void
}

export function LeaveReviewModal({ isOpen, onClose, leaveRequest, isViewOnly = false, onActionComplete }: LeaveReviewModalProps) {
  console.log("[LeaveReviewModal] props.leaveRequest:", leaveRequest)

  // Determine manager status from raw numeric status if available
  const statusLabel: "Approved" | "Rejected" | "Pending" | "Cancelled" = (() => {
    const raw = leaveRequest?.rawStatus ?? leaveRequest?.status
    if (typeof raw === 'number') {
      // 5 = Pending Manager Approval
      // 6 = Pending HR Approval (means manager approved)
      // 7 = Rejected by Manager
      // 9 = Cancelled
      if (raw === 5) return "Pending"
      if (raw === 6) return "Approved"
      if (raw === 7) return "Rejected"
      if (raw === 9) return "Cancelled"
      return "Pending"
    }
    const s = (leaveRequest?.statusLabel || leaveRequest?.status || "").toString().toLowerCase()
    if (s.includes("approve")) return "Approved"
    if (s.includes("reject")) return "Rejected"
    return "Pending"
  })()

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      // default:
      //   return <Badge variant="outline">{status}</Badge>
    }
  }

  const [managerComment, setManagerComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string>("")

  // Load current user name from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName")
    if (storedUserName) {
      setCurrentUserName(storedUserName)
    } else {
      // Fallback to user ID if no name available
      const userId = localStorage.getItem("id")
      setCurrentUserName(userId ? `User (ID: ${userId})` : "Current User")
    }
  }, [isOpen])

  const formatDate = (iso?: string): string => {
    if (!iso) return "-"
    const d = new Date(iso)
    if (isNaN(d.getTime())) return String(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = d.toLocaleString('en-GB', { month: 'short' })
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  const formatDateTime = (iso?: string): string => {
    if (!iso) return "-"
    const d = new Date(iso)
    if (isNaN(d.getTime())) return String(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = d.toLocaleString('en-GB', { month: 'short' })
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year} ${hours}:${minutes}`
  }

  const isPending = statusLabel === "Pending"
  const isRejected = statusLabel === "Rejected"
  const isApproved = statusLabel === "Approved"
  const isCancelled = statusLabel === "Cancelled"

  // Get manager name - use current user name for new approvals, or existing data for historical approvals
  const getManagerName = (): string => {
    // For approved/rejected requests, try to get the actual manager name from the data
    if (isApproved || isRejected) {
      // Check if we have manager name in the response
      const managerName = leaveRequest?.managerName || leaveRequest?.approvedByName || leaveRequest?.modifiedByName
      if (managerName && typeof managerName === 'string' && managerName !== '0') {
        return managerName
      }

      // If no manager name in response, we need to fetch it or use current user
      // For now, use current user name as the manager who approved/rejected
      if (currentUserName) {
        return currentUserName
      }

      // Fallback to modUser ID if no name available
      const modUser = leaveRequest?.modUser || leaveRequest?.approvedBy || leaveRequest?.modifiedBy
      if (modUser && modUser !== 0) {
        return `Manager (ID: ${modUser})`
      }
    }

    // For pending requests or when no historical data, use current user name
    if (currentUserName) {
      return currentUserName
    }

    return "-"
  }

  const managerApprovedBy = getManagerName()

  // Debug logging for date fields
  console.log("[LeaveReviewModal] leaveRequest data:", leaveRequest)
  console.log("[LeaveReviewModal] managerResponseOn:", leaveRequest?.managerResponseOn)
  console.log("[LeaveReviewModal] modifiedOn:", leaveRequest?.modifiedOn)

  const getManagerResponseDate = () => {
    // The API returns managerResponseOn (camelCase) field
    if (leaveRequest?.managerResponseOn) {
      return formatDateTime(leaveRequest.managerResponseOn)
    }
    if (leaveRequest?.modifiedOn) {
      return formatDateTime(leaveRequest.modifiedOn)
    }
    if (leaveRequest?.approvedOn) {
      return formatDateTime(leaveRequest.approvedOn)
    }
    if (leaveRequest?.rejectedOn) {
      return formatDateTime(leaveRequest.rejectedOn)
    }
    return "-"
  }

  const managerResponseOn = getManagerResponseDate()
  const managerDecisionComment = (leaveRequest?.comments || "").trim() || (isApproved ? "Approved" : isRejected ? "Rejected" : "")

  const processAction = async (response: "Approve" | "Reject") => {
    if (!leaveRequest?.requestID && !leaveRequest?.id) {
      onClose()
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        requestID: leaveRequest.requestID || leaveRequest.id,
        response: response === "Approve" ? "Approved" : "Rejected",
        comment: managerComment || "",
        modUser: leaveRequest.modUser || 0,
      }
      console.log("[LeaveReviewModal] POST /ProcessManagerAction payload:", payload)
      const res = await axios.post("https://localhost:7080/api/Leave/ProcessManagerAction", payload, { withCredentials: true })
      console.log("[LeaveReviewModal] ProcessManagerAction response:", res?.data)

      // Close modal first
      onClose()

      // Show toast notification with appropriate styling
      setTimeout(() => {
        if (response === "Approve") {
          toast({
            title: "Leave Approved",
            description: "",
            duration:3000,
            className: "border-green-500 text-green-800 dark:text-green-300 dark:border-green-600",           
          })
          onActionComplete && onActionComplete("approved", payload.requestID)
        } else {
          toast({
            title: "Leave Rejected",
            description: "",
            duration:3000,
            className: "border-red-500 text-red-800 dark:text-red-300 dark:border-red-600",          
          })
          onActionComplete && onActionComplete("rejected", payload.requestID)
        }
      }, 100)

      // Close modal after successful action
      //onClose()
    } catch (e) {
      console.error("[LeaveReviewModal] ProcessManagerAction failed", e)
      toast({
        title: "Error",
        description: "Failed to process leave request. Please try again.",
        duration:3000,
        className: "border-red-500 text-red-800 dark:text-red-300 dark:border-red-600"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = () => processAction("Approve")
  const handleReject = () => processAction("Reject")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mx-2 sm:mx-auto">
        {/* Loading Overlay */}
        {submitting && (
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 rounded-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-3 shadow-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing...</p>
            </div>
          </div>
        )}
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-4 sm:px-6 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {leaveRequest?.requestBy || leaveRequest?.requestedBy || "Employee"}
            </DialogTitle>
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 text-xs sm:text-sm font-medium">
              {leaveRequest?.leaveType || leaveRequest?.leaveName || "Leave"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 px-4 sm:px-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Applied On:</strong>{" "}
            {leaveRequest?.appliedOn || leaveRequest?.requestDate || "-"}
          </div>

          {/* Status chip near Leave Type for Cancelled */}
          {statusLabel === "Cancelled" && (
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Cancelled by Employee
            </Badge>
          )}

          {/* Manager Approval Summary */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
            <div className="space-y-2">
              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                Manager Approval {getApprovalBadge(statusLabel)}
              </div>
              {(isApproved || isRejected) && (
                <>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Approved By:</strong> {String(managerApprovedBy)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Approved On:</strong> {managerResponseOn}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <strong className="text-gray-900 dark:text-white">Comment:</strong>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{managerDecisionComment || '-'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Original Duration and Reason */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
            <div className="space-y-2">
              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                Duration ({leaveRequest?.totalDays || "1"} Days)
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {leaveRequest?.fromDate || leaveRequest?.leaveStartDate || "-"} - {leaveRequest?.toDate || leaveRequest?.leaveEndDate || "-"}
              </div>
              <div className="text-xs sm:text-sm">
                <strong className="text-gray-900 dark:text-white">Reason:</strong>
                <span className="text-gray-700 dark:text-gray-300 ml-1">{leaveRequest?.reason || "-"}</span>
              </div>
            </div>
          </div>

          {/* Manager comment input */}
          {!isViewOnly && (
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Comment (optional)
              </label>
              <Textarea
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Add a comment for your decision"
                disabled={!isPending}
                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            {isViewOnly ? (
              <Button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium rounded-md shadow-sm w-full sm:w-auto"
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={submitting || (statusLabel !== "Pending")}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm sm:text-base font-medium rounded-md shadow-sm w-full sm:w-auto"
                >
                  <X className="h-3 w-3" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={submitting || (statusLabel !== "Pending")}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm sm:text-base font-medium rounded-md shadow-sm w-full sm:w-auto"
                >
                  <Check className="h-3 w-3" />
                  Approve
                </Button>
              </>
            )}
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}