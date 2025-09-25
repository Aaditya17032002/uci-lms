"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { CheckCircle, XCircle, Users } from "lucide-react"

interface BulkApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTimesheets: any[]
  onBulkApprove: (comment: string) => void
  onBulkReject: (comment: string) => void
}

export function BulkApprovalModal({
  isOpen,
  onClose,
  selectedTimesheets,
  onBulkApprove,
  onBulkReject,
}: BulkApprovalModalProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await onBulkApprove(comment)
      setComment("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await onBulkReject(comment)
      setComment("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" w-[95vw] max-w-2xl 
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-600
      p-4 sm:p-6">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Bulk Timesheet Approval
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {selectedTimesheets.length} Selected
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-3">
              You are about to perform a bulk action on the following timesheets:
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedTimesheets.map((timesheet) => (
                <div
                  key={timesheet.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-700 rounded p-2 text-sm"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">{timesheet.name}</span>
                  <span className="text-gray-600 dark:text-gray-300">{timesheet.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
              Comments (Optional)
            </label>
            <Textarea
              placeholder="Enter your comments for all selected timesheets..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent  w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4" />
            {isSubmitting ? "Rejecting..." : "Reject All"}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            <CheckCircle className="h-4 w-4" />
            {isSubmitting ? "Approving..." : "Approve All"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}