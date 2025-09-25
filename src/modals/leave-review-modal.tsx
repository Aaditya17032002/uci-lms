// ===== responsive =======

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { CheckCircle, XCircle, Clock, X, Check } from 'lucide-react'

interface LeaveReviewModalProps {
  isOpen: boolean
  onClose: () => void
  leaveRequest: any
  isViewOnly?: boolean
}

export function LeaveReviewModal({ isOpen, onClose, leaveRequest, isViewOnly = false }: LeaveReviewModalProps) {
  console.log("leaveRequest.status [inside leavereviwmodal func]:", leaveRequest?.status);

  const mockApprovalStatus = {
    manager: {
      status:
        leaveRequest?.status === "approved" ||
        leaveRequest?.status === "pending_hr_approval" ||
        leaveRequest?.status === "rejected_by_hr"
          ? "Approved"
          : leaveRequest?.status === "rejected"
          ? "Rejected"
          : "Pending",
      approvedBy: "John Doe (Manager)",
      approvedOn: "2025-07-20",
      comment: leaveRequest?.status === "rejected" ? "Leave request rejected by manager." : "Approved",
    },
    hr: {
      status:
        leaveRequest?.status === "approved"
          ? "Approved"
          : leaveRequest?.status === "rejected_by_hr"
          ? "Rejected"
          : "Pending",
      approvedBy: "Jane Smith (HR)",
      approvedOn: "2025-07-22",
      comment: leaveRequest?.status === "rejected_by_hr" ? "Leave request rejected by HR." : "HR approval granted.",
    },
  }

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
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApprove = () => {
    console.log("Approved Leave with comment:", Comment)
    onClose()
  }

  const handleReject = () => {
    console.log("Rejected Leave with comment:", Comment)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mx-2 sm:mx-auto">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-4 sm:px-6 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {leaveRequest?.requestBy || "Vikram Singh"}
            </DialogTitle>
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 text-xs sm:text-sm font-medium">
              {leaveRequest?.leaveType || "Leave Without Pay (LWP)"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 px-4 sm:px-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Applied On:</strong>{" "}
            {leaveRequest?.appliedOn || "18-Jul-2025"}
          </div>

          {/* Manager Approval Details */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
            <div className="space-y-2">
              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                Manager Approval {getApprovalBadge(mockApprovalStatus.manager.status)}
              </div>
              {mockApprovalStatus.manager.status !== "Pending" && (
                <>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Approved By:</strong>{" "}
                    {mockApprovalStatus.manager.approvedBy}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Approved On:</strong>{" "}
                    {mockApprovalStatus.manager.approvedOn}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <strong className="text-gray-900 dark:text-white">Comment:</strong>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{mockApprovalStatus.manager.comment}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* HR Approval Details */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
            <div className="space-y-2">
              <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                HR Approval {getApprovalBadge(mockApprovalStatus.hr.status)}
              </div>
              {mockApprovalStatus.hr.status !== "Pending" && (
                <>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Approved By:</strong>{" "}
                    {mockApprovalStatus.hr.approvedBy}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Approved On:</strong>{" "}
                    {mockApprovalStatus.hr.approvedOn}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <strong className="text-gray-900 dark:text-white">Comment:</strong>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{mockApprovalStatus.hr.comment}</span>
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
                {leaveRequest?.fromDate || "18 July"} - {leaveRequest?.toDate || "18 July"}, 2025
              </div>
              <div className="text-xs sm:text-sm">
                <strong className="text-gray-900 dark:text-white">Reason:</strong>
                <span className="text-gray-700 dark:text-gray-300 ml-1">{leaveRequest?.reason || "sxfj"}</span>
              </div>
            </div>
          </div>

          {/* Comments section */}
          {leaveRequest?.comments && (
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Comments
              </label>
              <Textarea
                value={leaveRequest.comments}
                readOnly
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
                  disabled={
                    !(
                      mockApprovalStatus.manager.status === "Pending" &&
                      mockApprovalStatus.hr.status === "Pending"
                    )
                  }
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm sm:text-base font-medium rounded-md shadow-sm w-full sm:w-auto"
                >
                  <X className="h-3 w-3" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={
                    !(
                      mockApprovalStatus.manager.status === "Pending" &&
                      mockApprovalStatus.hr.status === "Pending"
                    )
                  }
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
