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

  // Get manager name - try to get actual name, fallback to ID if needed
  const getManagerName = (): string => {
    // Try to get manager name from various fields
    const managerName = leaveRequest?.managerName || leaveRequest?.approvedByName || leaveRequest?.modifiedByName
    if (managerName && typeof managerName === 'string' && managerName !== '0') {
      return managerName
    }
    
    // Fallback to modUser ID if no name available
    const modUser = leaveRequest?.modUser || leaveRequest?.approvedBy || leaveRequest?.modifiedBy
    if (modUser && modUser !== 0) {
      return `Manager (ID: ${modUser})`
    }
    
    return "-"
  }

  const managerApprovedBy = getManagerName()
  const managerApprovedOn = formatDateTime(leaveRequest?.approvedOn || leaveRequest?.modifiedOn)
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
      const ok = res?.data
      if (ok) {
        // Show toast notification with appropriate styling
        if (response === "Approve") {
          toast({
            title: "Leave Approved",
            description: "Leave request approved successfully",
            className: "border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600"
          })
          onActionComplete && onActionComplete("approved", payload.requestID)
        } else {
          toast({
            title: "Leave Rejected", 
            description: "Leave request rejected successfully",
            className: "border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600"
          })
          onActionComplete && onActionComplete("rejected", payload.requestID)
        }
      }
    } catch (e) {
      console.error("[LeaveReviewModal] ProcessManagerAction failed", e)
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  const handleApprove = () => processAction("Approve")
  const handleReject = () => processAction("Reject")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mx-2 sm:mx-auto">
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
                    <strong className="text-gray-900 dark:text-white">Approved On:</strong> {managerApprovedOn}
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
