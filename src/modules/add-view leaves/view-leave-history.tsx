"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Pagination } from "../../common/pagination"
import { Eye, Pencil, Ban, BellRing } from 'lucide-react'
import { LeaveReviewModalEmp } from "../../modals/leave-review-modal-emp"
import { CancelLeaveConfirmationModal } from "../../modals/cancel-leave-confirmation-modal"
import { NotificationPopup } from "../../common/notification-popup" // Import the new component

interface LeaveRecord {
  id: number
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "approved" | "pending_manager_approval" | "pending_hr_approval" | "submitted" | "cancelled" | "rejected"
  appliedDate: string
  managerApproval?: { status: string; date?: string; comment?: string }
  hrApproval?: { status: string; date?: string; comment?: string }
}

const mockLeaveHistory: LeaveRecord[] = [
  {
    id: 1,
    type: "Casual Leave",
    startDate: "2024-01-15",
    endDate: "2024-01-16",
    days: 2,
    reason: "Personal work",
    status: "approved",
    appliedDate: "2024-01-10",
    managerApproval: { status: "Approved", date: "2024-01-12" },
    hrApproval: { status: "Approved", date: "2024-01-13" },
  },
  {
    id: 2,
    type: "Sick Leave",
    startDate: "2024-01-08",
    endDate: "2024-01-08",
    days: 1,
    reason: "Fever",
    status: "approved",
    appliedDate: "2024-01-08",
    managerApproval: { status: "Approved", date: "2024-01-08" },
    hrApproval: { status: "Approved", date: "2024-01-09" },
  },
  {
    id: 3,
    type: "Casual Leave",
    startDate: "2024-01-25",
    endDate: "2024-01-26",
    days: 2,
    reason: "Family function",
    status: "pending_manager_approval",
    appliedDate: "2024-01-20",
    managerApproval: { status: "Pending" },
    hrApproval: { status: "Pending" },
  },
  {
    id: 4,
    type: "Sick Leave",
    startDate: "2024-02-05",
    endDate: "2024-02-06",
    days: 2,
    reason: "Medical checkup",
    status: "pending_hr_approval",
    appliedDate: "2024-02-01",
    managerApproval: { status: "Approved", date: "2024-02-02" },
    hrApproval: { status: "Pending" },
  },
  {
    id: 5,
    type: "Casual Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-15",
    days: 1,
    reason: "Personal work",
    status: "rejected",
    appliedDate: "2024-02-10",
    managerApproval: { status: "Rejected", date: "2024-02-11" },
    hrApproval: { status: "N/A" },
  },
  {
    id: 6,
    type: "Work From Home",
    startDate: "2024-03-01",
    endDate: "2024-03-01",
    days: 1,
    reason: "Remote work setup",
    status: "approved",
    appliedDate: "2024-02-28",
    managerApproval: { status: "Approved", date: "2024-02-29" },
    hrApproval: { status: "Approved", date: "2024-03-01" },
  },
  {
    id: 7,
    type: "Comp-Off",
    startDate: "2024-03-10",
    endDate: "2024-03-10",
    days: 1,
    reason: "Compensatory off for weekend work",
    status: "approved",
    appliedDate: "2024-03-05",
    managerApproval: { status: "Approved", date: "2024-03-06" },
    hrApproval: { status: "Approved", date: "2024-03-07" },
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">Approved</Badge>
    case "pending_manager_approval":
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400">Pending Manager Approval</Badge>
    case "pending_hr_approval":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">Pending HR Approval</Badge>
    case "submitted":
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300">Submitted</Badge>
    case "cancelled":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400">Cancelled</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ViewLeaveHistory() {
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [leaveToCancelId, setLeaveToCancelId] = useState<number | null>(null)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false) // State for popup visibility
  const [notificationMessage, setNotificationMessage] = useState("") // State for popup message

  const handleViewDetails = (leave: LeaveRecord) => {
    setSelectedLeave(leave)
    setIsReviewModalOpen(true)
  }

  const handleEditLeave = (leave: LeaveRecord) => {
    console.log(`Editing leave request with ID: ${leave.id}`)
    // Implement actual edit functionality here, e.g., open an edit form
  }

  const handleCancelClick = (leaveId: number) => {
    setLeaveToCancelId(leaveId)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = (leaveId: number) => {
    console.log(`Cancelling leave request with ID: ${leaveId}`)
    setNotificationMessage(`Leave request #${leaveId} cancelled successfully.`) // Set the message
    setShowNotificationPopup(true) // Show the popup
    setIsCancelModalOpen(false)
    setLeaveToCancelId(null)
  }

  const handleNotifyClick = (leaveId: number) => {
    setNotificationMessage("Notified Successfully") // Set the message
    setShowNotificationPopup(true) // Show the popup
    console.log(`Notifying approvers for leave request ID: ${leaveId}`)
  }

  const totalPages = Math.ceil(mockLeaveHistory.length / parseInt(pageSize))
  const startIndex = (currentPage - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const currentData = mockLeaveHistory.slice(startIndex, endIndex)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Leave History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-4">#</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Leave Type</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Duration</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Total Days</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Applied On</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Status</TableHead>
                <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200 p-4">Actions</TableHead>
                <TableHead className="w-24 font-semibold text-gray-700 dark:text-gray-200 p-4">Notify</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((leave) => (
                <TableRow key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <TableCell className="font-medium text-gray-600 dark:text-gray-300 p-4">{leave.id}</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100 p-4">{leave.type}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200 p-4">
                    {leave.startDate} to {leave.endDate}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200 p-4">{leave.days}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200 p-4">{leave.appliedDate}</TableCell>
                  <TableCell className="p-4">
                    {getStatusBadge(leave.status)}
                  </TableCell>
                  <TableCell className="p-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditLeave(leave)}
                      disabled={["approved", "rejected"].includes(String(leave.status).toLowerCase())}
                      className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(leave)}
                      variant="outline"
                      className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={["approved", "rejected"].includes(String(leave.status).toLowerCase())}
                      onClick={() => handleCancelClick(leave.id)}
                      className="text-gray-700 dark:text-gray-300 text-black flex items-center gap-2 font -medium"
                    >
                      <Ban className="h-4 w-4" />
                      Cancel Leave
                    </Button>
                  </TableCell>
                  <TableCell className="p-4">
                    <Button
                      size="sm"
                      onClick={() => handleNotifyClick(leave.id)}
                      disabled={["approved", "rejected"].includes(String(leave.status).toLowerCase())}
                      // disabled={!(leave.status === "pending_hr_approval" || leave.status === "pending_manager_approval")}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-medium"
                    >
                      <BellRing className="h-4 w-4" />
                      Notify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={mockLeaveHistory.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

        <LeaveReviewModalEmp
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          leaveRequest={selectedLeave}
        />

        <CancelLeaveConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          leaveId={leaveToCancelId}
        />
      </CardContent>
      {showNotificationPopup && (
        <NotificationPopup
          message={notificationMessage}
          onClose={() => setShowNotificationPopup(false)}
        />
      )}
    </Card>
  )
}
