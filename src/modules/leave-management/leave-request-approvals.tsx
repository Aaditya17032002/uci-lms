"use client"

import { useState, useEffect } from "react" // Ensure useEffect is imported
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Badge } from "../../ui/badge"
import { Eye, Info } from 'lucide-react'
import { Pagination } from "../../common/pagination"
import { LeaveReviewModalHR } from "../../modals/leave-review-modal-hr"
import { useToast } from "../../hooks/use-toast"

interface LeaveRequest {
  id: number
  requestBy: string
  leaveType: string
  fromDate: string
  toDate: string
  totalDays: number
  appliedOn: string
  reason: string
  status: string
}

const mockLeaveRequests: LeaveRequest[] = [
  { id: 1, requestBy: "Vikram Singh", leaveType: "Leave Without Pay", fromDate: "18-Jul-2025", toDate: "18-Jul-2025", totalDays: 1, appliedOn: "15-Jul-2025", reason: "Personal work", status: "pending_hr_approval" },
  { id: 2, requestBy: "Anita Gupta", leaveType: "Casual Leave", fromDate: "17-Jul-2025", toDate: "17-Jul-2025", totalDays: 1, appliedOn: "14-Jul-2025", reason: "Family function", status: "approved" },
  { id: 3, requestBy: "Suresh Patel", leaveType: "Sick Leave", fromDate: "21-Jul-2025", toDate: "21-Jul-2025", totalDays: 1, appliedOn: "20-Jul-2025", reason: "Medical checkup", status: "rejected_by_hr" },
  { id: 4, requestBy: "Kavita Reddy", leaveType: "Annual Leave", fromDate: "22-Jul-2025", toDate: "24-Jul-2025", totalDays: 3, appliedOn: "18-Jul-2025", reason: "Vacation", status: "pending_hr_approval" },
  { id: 5, requestBy: "Deepak Agarwal", leaveType: "Casual Leave", fromDate: "25-Jul-2025", toDate: "25-Jul-2025", totalDays: 1, appliedOn: "22-Jul-2025", reason: "Personal work", status: "rejected_by_hr" },
  { id: 6, requestBy: "Rajesh Kumar", leaveType: "Sick Leave", fromDate: "01-Aug-2025", toDate: "01-Aug-2025", totalDays: 1, appliedOn: "29-Jul-2025", reason: "Fever", status: "approved" },
  { id: 7, requestBy: "Priya Sharma", leaveType: "Casual Leave", fromDate: "05-Aug-2025", toDate: "06-Aug-2025", totalDays: 2, appliedOn: "01-Aug-2025", reason: "Wedding", status: "approved" },
]

export function LeaveRequestApprovalsPage() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>(mockLeaveRequests)
  const { toast } = useToast()

  // This useEffect is correctly placed and should not cause an error if React is set up.
  // It's possible the error is coming from a different file or a build issue.
  // I've added it here for completeness, but the previous version also had it.
  useEffect(() => {
    // Any logic that needs to run on component mount or updates
    // For example, fetching initial data or setting up subscriptions
  }, []);

  const handleReview = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setIsReviewModalOpen(true)
  }

  const handleApprove = (comment: string) => {
    if (selectedLeaveRequest) {
      setPendingRequests(prev => prev.filter(req => req.id !== selectedLeaveRequest.id))
      toast({
        title: "Leave Approved",
        description: `Leave request for ${selectedLeaveRequest.requestBy} has been approved.`,
        duration: 3000,
      })
    }
    setIsReviewModalOpen(false)
    setSelectedLeaveRequest(null)
  }

  const handleReject = (comment: string) => {
    if (selectedLeaveRequest) {
      setPendingRequests(prev => prev.filter(req => req.id !== selectedLeaveRequest.id))
      toast({
        title: "Leave Rejected",
        description: `Leave request for ${selectedLeaveRequest.requestBy} has been rejected.`,
        duration: 3000,
      })
    }
    setIsReviewModalOpen(false)
    setSelectedLeaveRequest(null)
  }

  const totalPages = Math.ceil(pendingRequests.length / parseInt(pageSize))
  const startIndex = (currentPage - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const currentData = pendingRequests.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Leave Request Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {pendingRequests.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Info className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">No Pending Leave Requests</h3>
              <p>You don't have any leave requests pending for approval.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-4">Sr. No.</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Request By</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Type of Leave</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">From Date</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">To Date</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Total Days</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Applied On</TableHead>
                  <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200 p-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                   <TableCell className="p-4 text-center">
                      <div
                        className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                          request.status === "approved"
                            ? "border-green-300 bg-green-100 text-black"
                            : request.status === "rejected" || request.status === "rejected_by_hr"
                            ? "border-red-300 bg-red-100 text-black"
                            : "border-transparent text-black bg-transparent"
                        }`}
                      >
                        {request.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 p-4">{request.requestBy}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 p-4">{request.leaveType}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 p-4">{request.fromDate}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 p-4">{request.toDate}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 p-4">{request.totalDays}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 p-4">{request.appliedOn}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReview(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={pendingRequests.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </CardContent>

      <LeaveReviewModalHR
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        leaveRequest={selectedLeaveRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
