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
import axios from "axios"

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
  numericStatus?: number
  hrApprovedBy?: string
  hrApprovedOn?: string
  hrComment?: string
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
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([])
  const { toast } = useToast()

  // Format ISO date strings like 2025-10-16 to 16-Oct-2025
  const formatDate = (value?: string) => {
    if (!value) return ""
    try {
      const d = new Date(value)
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-")
    } catch {
      return value
    }
  }

  // reusable fetch to refresh list after actions
  const fetchApprovals = async () => {
      try {
        console.log("[HR Approvals] Fetching (POST https://localhost:7080/api/Leave/hr-approvals) withCredentials...")
        const resp = await axios.post(
          "https://localhost:7080/api/Leave/hr-approvals",
          {},
          { withCredentials: true }
        )
        console.log("[HR Approvals] Raw response:", resp?.data)
        const list = Array.isArray(resp?.data) ? resp.data : []
        console.log("[HR Approvals] Items:", list.length)
        const mapped: LeaveRequest[] = list.map((item: any, index: number) => ({
          id: item.requestID ?? index + 1,
          requestBy: item.requestedBy ?? "",
          leaveType: item.leaveName ?? "",
          fromDate: formatDate(item.leaveStartDate),
          toDate: formatDate(item.leaveEndDate),
          totalDays: item.totalDays ?? 0,
          appliedOn: formatDate(item.requestDate),
          reason: item.reason ?? "",
          status:
            item.status === 3
              ? "approved"
              : item.status === 6
              ? "pending_hr_approval"
              : item.status === 8
              ? "rejected_by_hr"
              : item.status === 9
              ? "cancelled_by_emp"
              : "pending_hr_approval",
          numericStatus: typeof item.status === "number" ? item.status : undefined,
          hrApprovedBy: item.hrApprovedBy ?? undefined,
          hrApprovedOn: item.hrApprovedOn ?? undefined,
          hrComment: item.hrComment ?? undefined,
          // pass-through (optional) manager fields if provided by API
          // These are used by HR modal to show dynamic manager approval details
          // They won't affect table rendering
          ...(item.managerName ? { managerName: item.managerName } : {}),
          ...(item.approvedByName ? { approvedByName: item.approvedByName } : {}),
          ...(item.modifiedByName ? { modifiedByName: item.modifiedByName } : {}),
          ...(item.modUser ? { modUser: item.modUser } : {}),
          ...(item.managerResponseOn ? { managerResponseOn: item.managerResponseOn } : {}),
          ...(item.modifiedOn ? { modifiedOn: item.modifiedOn } : {}),
          ...(item.comments ? { comments: item.comments } : {}),
          ...(item.managerResponse ? { managerResponse: item.managerResponse } : {}),
        }))
        console.log("[HR Approvals] First mapped row:", mapped[0])

        // Merge persisted HR decisions from localStorage (survives reloads)
        try {
          const overridesRaw = localStorage.getItem("hrStatusOverrides")
          const overrides: Record<string, string> = overridesRaw ? JSON.parse(overridesRaw) : {}
          const metaOverridesRaw = localStorage.getItem("hrMetaOverrides")
          const metaOverrides: Record<string, { hrApprovedBy?: string; hrApprovedOn?: string; hrComment?: string }> = metaOverridesRaw ? JSON.parse(metaOverridesRaw) : {}
          console.log("[HR Approvals] Loaded overrides:", overrides)
          console.log("[HR Approvals] Loaded meta overrides:", metaOverrides)
          const merged = mapped.map(req => {
            const override = overrides[String(req.id)]
            const meta = metaOverrides[String(req.id)]
            return {
              ...req,
              status: override ? override : req.status,
              hrApprovedBy: meta?.hrApprovedBy ?? req.hrApprovedBy,
              hrApprovedOn: meta?.hrApprovedOn ?? req.hrApprovedOn,
              hrComment: meta?.hrComment ?? req.hrComment,
            }
          })
          // Sort: pending_hr_approval first, then others, cancelled_by_emp last
          const priority: Record<string, number> = {
            pending_hr_approval: 0,
            approved: 1,
            rejected_by_hr: 2,
            cancelled_by_emp: 3,
          }
          const sorted = [...merged].sort((a, b) => {
            const pa = priority[a.status] ?? 2
            const pb = priority[b.status] ?? 2
            if (pa !== pb) return pa - pb
            // tie-breaker by appliedOn desc (most recent first) if possible
            const ad = a.appliedOn ? Date.parse(a.appliedOn.replace(/-/g, ' ')) : 0
            const bd = b.appliedOn ? Date.parse(b.appliedOn.replace(/-/g, ' ')) : 0
            return bd - ad
          })
          setPendingRequests(sorted)
        } catch (e) {
          console.log("[HR Approvals] Failed to read overrides:", e)
          const priority: Record<string, number> = {
            pending_hr_approval: 0,
            approved: 1,
            rejected_by_hr: 2,
            cancelled_by_emp: 3,
          }
          const sorted = [...mapped].sort((a, b) => {
            const pa = priority[a.status] ?? 2
            const pb = priority[b.status] ?? 2
            if (pa !== pb) return pa - pb
            const ad = a.appliedOn ? Date.parse(a.appliedOn.replace(/-/g, ' ')) : 0
            const bd = b.appliedOn ? Date.parse(b.appliedOn.replace(/-/g, ' ')) : 0
            return bd - ad
          })
          setPendingRequests(sorted)
        }
      } catch (err: any) {
        console.log("[HR Approvals] Fetch error:", err)
        toast({
          title: "Failed to load approvals",
          description: err?.message || "Unexpected error",
          duration: 4000,
        })
      }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleReview = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setIsReviewModalOpen(true)
  }

  const handleApprove = async (comment: string) => {
    if (selectedLeaveRequest) {
      const now = new Date().toISOString()
      // optimistic update
      setPendingRequests(prev => {
        const next = prev.map(req => req.id === selectedLeaveRequest.id ? { ...req, status: "approved", numericStatus: 3, hrApprovedOn: now, hrComment: comment || undefined } : req)
        const priority: Record<string, number> = { pending_hr_approval: 0, approved: 1, rejected_by_hr: 2, cancelled_by_emp: 3 }
        return next.slice().sort((a, b) => {
          const pa = priority[a.status] ?? 2
          const pb = priority[b.status] ?? 2
          if (pa !== pb) return pa - pb
          const ad = a.appliedOn ? Date.parse(a.appliedOn.replace(/-/g, ' ')) : 0
          const bd = b.appliedOn ? Date.parse(b.appliedOn.replace(/-/g, ' ')) : 0
          return bd - ad
        })
      })
      // show toast immediately
      toast({
        title: "Leave Approved",
        description: `Leave request for ${selectedLeaveRequest.requestBy} has been approved.`,
        duration: 3000,
        className: "border-2 border-green-500",
      })
      // Persist override so it survives reloads
      try {
        const overridesRaw = localStorage.getItem("hrStatusOverrides")
        const overrides: Record<string, string> = overridesRaw ? JSON.parse(overridesRaw) : {}
        overrides[String(selectedLeaveRequest.id)] = "approved"
        localStorage.setItem("hrStatusOverrides", JSON.stringify(overrides))
        console.log("[HR Approvals] Stored override (approved)", overrides)

        const metaRaw = localStorage.getItem("hrMetaOverrides")
        const meta: Record<string, { hrApprovedBy?: string; hrApprovedOn?: string; hrComment?: string }> = metaRaw ? JSON.parse(metaRaw) : {}
        const hrName = (sessionStorage.getItem("userName") || localStorage.getItem("userName") || document.cookie.match(/(?:^|; )userName=([^;]+)/)?.[1] || "") as string
        meta[String(selectedLeaveRequest.id)] = { hrApprovedBy: hrName || undefined, hrApprovedOn: now, hrComment: comment || undefined }
        localStorage.setItem("hrMetaOverrides", JSON.stringify(meta))
        console.log("[HR Approvals] Stored meta override (approved)", meta)
      } catch (e) {
        console.log("[HR Approvals] Failed storing override:", e)
      }
      // Call backend (best effort)
      try {
        console.log("[HR Approvals] POST ProcessHRAction (Approve)", { requestID: selectedLeaveRequest.id, response: "Approved", comment })
        await axios.post(
          "https://localhost:7080/api/Leave/ProcessHRAction",
          { requestID: selectedLeaveRequest.id, response: "Approved", comment, modUser: 0 },
          { withCredentials: true }
        )
        console.log("[HR Approvals] Backend updated for approve")
      } catch (err: any) {
        console.log("[HR Approvals] Backend approve failed, keeping optimistic state.", err?.response?.data || err?.message)
      }
    }
    setIsReviewModalOpen(false)
    setSelectedLeaveRequest(null)
    // ensure latest server state is reflected
    fetchApprovals()
  }

  const handleReject = async (comment: string) => {
    if (selectedLeaveRequest) {
      const now = new Date().toISOString()
      // optimistic update
      setPendingRequests(prev => {
        const next = prev.map(req => req.id === selectedLeaveRequest.id ? { ...req, status: "rejected_by_hr", numericStatus: 8, hrApprovedOn: now, hrComment: comment || undefined } : req)
        const priority: Record<string, number> = { pending_hr_approval: 0, approved: 1, rejected_by_hr: 2, cancelled_by_emp: 3 }
        return next.slice().sort((a, b) => {
          const pa = priority[a.status] ?? 2
          const pb = priority[b.status] ?? 2
          if (pa !== pb) return pa - pb
          const ad = a.appliedOn ? Date.parse(a.appliedOn.replace(/-/g, ' ')) : 0
          const bd = b.appliedOn ? Date.parse(b.appliedOn.replace(/-/g, ' ')) : 0
          return bd - ad
        })
      })
      // show toast immediately
      toast({
        title: "Leave Rejected",
        description: `Leave request for ${selectedLeaveRequest.requestBy} has been rejected.`,
        duration: 3000,
        className: "border-2 border-red-500",
      })
      // Persist override so it survives reloads
      try {
        const overridesRaw = localStorage.getItem("hrStatusOverrides")
        const overrides: Record<string, string> = overridesRaw ? JSON.parse(overridesRaw) : {}
        overrides[String(selectedLeaveRequest.id)] = "rejected_by_hr"
        localStorage.setItem("hrStatusOverrides", JSON.stringify(overrides))
        console.log("[HR Approvals] Stored override (rejected_by_hr)", overrides)

        const metaRaw = localStorage.getItem("hrMetaOverrides")
        const meta: Record<string, { hrApprovedBy?: string; hrApprovedOn?: string; hrComment?: string }> = metaRaw ? JSON.parse(metaRaw) : {}
        const hrName = (sessionStorage.getItem("userName") || localStorage.getItem("userName") || document.cookie.match(/(?:^|; )userName=([^;]+)/)?.[1] || "") as string
        meta[String(selectedLeaveRequest.id)] = { hrApprovedBy: hrName || undefined, hrApprovedOn: now, hrComment: comment || undefined }
        localStorage.setItem("hrMetaOverrides", JSON.stringify(meta))
        console.log("[HR Approvals] Stored meta override (rejected_by_hr)", meta)
      } catch (e) {
        console.log("[HR Approvals] Failed storing override:", e)
      }
      // Call backend (best effort)
      try {
        console.log("[HR Approvals] POST ProcessHRAction (Reject)", { requestID: selectedLeaveRequest.id, response: "Rejected", comment })
        await axios.post(
          "https://localhost:7080/api/Leave/ProcessHRAction",
          { requestID: selectedLeaveRequest.id, response: "Rejected", comment, modUser: 0 },
          { withCredentials: true }
        )
        console.log("[HR Approvals] Backend updated for reject")
      } catch (err: any) {
        console.log("[HR Approvals] Backend reject failed, keeping optimistic state.", err?.response?.data || err?.message)
      }
    }
    setIsReviewModalOpen(false)
    setSelectedLeaveRequest(null)
    // ensure latest server state is reflected
    fetchApprovals()
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
                {currentData.map((request, idx) => (
                  <TableRow key={request.id ?? `${startIndex + idx + 1}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                   <TableCell className="p-4 text-center">
                      <div
                        className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                          request.numericStatus === 3 || request.status === "approved"
                            ? "border-green-300 bg-green-100 text-black"
                            : request.numericStatus === 8 || request.status === "rejected_by_hr"
                            ? "border-red-300 bg-red-100 text-black"
                            : request.numericStatus === 9 || request.status === "cancelled_by_emp"
                            ? "border-yellow-300 bg-yellow-100 text-black"
                            : "border-transparent text-black bg-transparent"
                        }`}
                      >
                         {startIndex + idx + 1}
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
