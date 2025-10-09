//== responsive ==

"use client"
 
import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Checkbox } from "../ui/checkbox"
import { Eye, Hourglass } from "lucide-react"
import { TimesheetReviewModal } from "../modals/timesheet-review-modal"
import { LeaveReviewModal } from "../modals/leave-review-modal"
import { BulkApprovalModal } from "../modals/bulk-approval-modal"
import { Pagination } from "../common/pagination"
import { CommentsModal } from "../modals/comments-modal"
import { toast } from "../hooks/use-toast"

// Interfaces for API data
interface TimesheetEntry {
  id: number
  name: string
  duration: string
  time: string
  submittedOn: string
  comments: number
  commentsData: CommentData[]
  tsstatus: "pending" | "approved" | "rejected"
}

interface CommentData {
  id: number
  user: { name: string; initials: string }
  action: string
  timestamp: string
  commentText: string
}

interface ApiTimesheetData {
  timesheetID: number
  userID: number
  employeeName?: string
  submittedBy?: string
  startDate: string
  endDate: string
  status: number
  hours?: number
  minutes?: number
  hoursTotal?: number
  minutesTotal?: number
  submittedOn: string
  submissionComment?: string
  approvedOn?: string
  approvalComment?: string
  approvedBy?: string
  displayTitle: string
  commentsCount: number
  rejectedBy?: string
  rejectionComment?: string
  rejectedOn?: string
}
 
// removed static mock timesheet data
 
const leaveData = [
  {
    id: 1,
    requestBy: "Vikram Singh",
    leaveType: "Leave Without Pay",
    fromDate: "18-Jul-2025",
    toDate: "18-Jul-2025",
    totalDays: 1,
    appliedOn: "15-Jul-2025",
    reason: "Personal work",
    status: "approved",
  },
  {
    id: 2,
    requestBy: "Anita Gupta",
    leaveType: "Casual Leave",
    fromDate: "17-Jul-2025",
    toDate: "17-Jul-2025",
    totalDays: 1,
    appliedOn: "14-Jul-2025",
    reason: "Family function",
    status: "pending_hr_approval",
  },
  {
    id: 3,
    requestBy: "Suresh Patel",
    leaveType: "Sick Leave",
    fromDate: "21-Jul-2025",
    toDate: "21-Jul-2025",
    totalDays: 1,
    appliedOn: "20-Jul-2025",
    reason: "Medical checkup",
    status: "pending",
  },
  {
    id: 4,
    requestBy: "Kavita Reddy",
    leaveType: "Annual Leave",
    fromDate: "22-Jul-2025",
    toDate: "24-Jul-2025",
    totalDays: 3,
    appliedOn: "18-Jul-2025",
    reason: "Vacation",
    status: "rejected_by_hr",
  },
  {
    id: 5,
    requestBy: "Deepak Agarwal",
    leaveType: "Casual Leave",
    fromDate: "25-Jul-2025",
    toDate: "25-Jul-2025",
    totalDays: 1,
    appliedOn: "22-Jul-2025",
    reason: "Personal work",
    status: "rejected",
  },
]
 
interface PendingApprovalPageProps {
  isDarkMode?: boolean
}
 
export function PendingApprovalPage({ isDarkMode }: PendingApprovalPageProps) {
  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isBulkApprovalModalOpen, setIsBulkApprovalModalOpen] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [selectedTimesheets, setSelectedTimesheets] = useState<number[]>([])
  const [timesheetPageSize, setTimesheetPageSize] = useState("10")
  const [timesheetCurrentPage, setTimesheetCurrentPage] = useState(1)
  const [leavePageSize, setLeavePageSize] = useState("10")
  const [leaveCurrentPage, setLeaveCurrentPage] = useState(1)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [selectedComments, setSelectedComments] = useState<any[]>([])
  const [selectedCommentsTitle, setSelectedCommentsTitle] = useState("")

  // API state management
  const [apiTimesheetData, setApiTimesheetData] = useState<TimesheetEntry[]>([])
  const [timesheetLoading, setTimesheetLoading] = useState(true)
  const [timesheetError, setTimesheetError] = useState<string | null>(null)

  // API functions
  const fetchPendingTimesheets = async () => {
    setTimesheetLoading(true)
    setTimesheetError(null)
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get("https://localhost:7080/api/timesheet/GetPendingTimesheets", { withCredentials: true }),
        axios.get("https://localhost:7080/api/timesheet/approved", { withCredentials: true })
      ])

      // Extract arrays
      const pendingRaw = Array.isArray(pendingRes.data?.data) ? pendingRes.data.data : (Array.isArray(pendingRes.data) ? pendingRes.data : [])
      const approvedRaw = Array.isArray(approvedRes.data?.data) ? approvedRes.data.data : (Array.isArray(approvedRes.data) ? approvedRes.data : [])

      const formatSubmitted = (iso?: string): string => {
        if (!iso) return ""
        const d = new Date(iso)
        if (isNaN(d.getTime())) return ""
        const day = String(d.getDate()).padStart(2, '0')
        const month = d.toLocaleString('en-GB', { month: 'short' })
        const year = d.getFullYear()
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${day}-${month}-${year} ${hours}:${minutes}`
      }

      const normalize = (item: ApiTimesheetData, forcedStatus?: "pending" | "approved" | "rejected"): TimesheetEntry => {
        let statusString: "pending" | "approved" | "rejected" = forcedStatus || "pending"
        if (!forcedStatus) {
          if (item.status === 2) statusString = "approved"
          else if (item.status === 3) statusString = "rejected"
        }

        const displayName = item.employeeName || item.submittedBy || "Unknown User"
        const hoursValue = typeof item.hours === 'number' ? item.hours : (item.hoursTotal ?? 0)
        const minutesValue = typeof item.minutes === 'number' ? item.minutes : (item.minutesTotal ?? 0)

        return {
          id: item.timesheetID,
          name: displayName,
          duration: item.displayTitle || `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`,
          time: `${hoursValue}h ${minutesValue}m`,
          submittedOn: formatSubmitted(item.submittedOn),
          comments: item.commentsCount ?? 0,
          commentsData: [],
          tsstatus: statusString
        }
      }

      const pending = pendingRaw.map((item: ApiTimesheetData) => normalize(item, "pending"))
      const approved = approvedRaw.map((item: ApiTimesheetData) => normalize(item, "approved"))

      const merged = [...pending, ...approved]
      setApiTimesheetData(merged)
    } catch (error: any) {
      console.error("Error fetching pending timesheets:", error)
      setTimesheetError("Failed to load pending timesheets")
      // Fallback to empty list (mock data removed)
      setApiTimesheetData([])
    } finally {
      setTimesheetLoading(false)
    }
  }

  const fetchTimesheetComments = async (timesheetId: number) => {
    try {
      const response = await axios.get(`https://localhost:7080/api/timesheet/gettimesheetcomments?timesheetId=${timesheetId}`, { withCredentials: true })
      return response.data ?? []
    } catch (error: any) {
      console.error("Error fetching timesheet comments:", error)
      return []
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingTimesheets()
  }, [])
 
  const handleTimesheetReview = (timesheet: any) => {
    console.log("Selected timesheet for review:", timesheet)
    setSelectedTimesheet(timesheet)
    setIsTimesheetModalOpen(true)
  }
 
  const handleLeaveReview = (leave: any) => {
    console.log("Selected leave data:", leave)
    setSelectedLeave(leave)
    setIsLeaveModalOpen(true)
  }
 
  const handleViewComments = async (timesheet: any) => {
    try {
      const comments = await fetchTimesheetComments(timesheet.id)
      
      // Transform API comments (commentTypeText/commentByUser/commentDate/commentText) to CommentsModal format
      const toRelative = (dateIso?: string) => {
        if (!dateIso) return "Unknown time"
        const date = new Date(dateIso)
        const now = new Date()
        const diffMs = Math.max(0, now.getTime() - date.getTime())
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const months = Math.floor(diffDays / 30)
        const label = months >= 1 ? `${months} month${months > 1 ? 's' : ''} ago` : `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
        const detailed = date.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        return `${label} (${detailed})`
      }

      const transformedComments = Array.isArray(comments) ? comments.map((comment: any) => {
        const displayName = comment.commentByUser || comment.userName || comment.commentedBy || "Unknown User"
        const actionWord = (() => {
          const t = (comment.commentTypeText || '').toLowerCase()
          if (t.includes('approval')) return 'approved the Timesheet'
          if (t.includes('rejection') || t.includes('reject')) return 'rejected the Timesheet'
          if (t.includes('submission') || t.includes('submit')) return 'submitted the Timesheet'
          return 'commented'
        })()
        const when = toRelative(comment.commentDate || comment.timestamp || comment.createdDate)
        return {
          id: comment.id || Math.random(),
          user: {
            name: displayName,
            initials: (displayName || "UU").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            avatarUrl: undefined
          },
          action: actionWord,
          timestamp: when,
          commentText: comment.commentText || comment.comment || ""
        }
      }) : []
      
      setSelectedComments(transformedComments)
      setSelectedCommentsTitle(`${timesheet.name}'s Timesheet`)
      setIsCommentsModalOpen(true)
    } catch (error) {
      console.error("Error loading comments:", error)
      setSelectedComments([])
      setSelectedCommentsTitle(`${timesheet.name}'s Timesheet`)
      setIsCommentsModalOpen(true)
    }
  }
 
  const handleTimesheetSelect = (timesheetId: number, checked: boolean) => {
    if (checked) {
      setSelectedTimesheets((prev) => [...prev, timesheetId])
    } else {
      setSelectedTimesheets((prev) => prev.filter((id) => id !== timesheetId))
    }
  }
 
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingTimesheets = currentTimesheetData.filter((ts) => ts.tsstatus === "pending").map((ts) => ts.id)
      setSelectedTimesheets(pendingTimesheets)
    } else {
      setSelectedTimesheets([])
    }
  }
 
  const handleBulkApproval = () => {
    // Disabled for now
  }
 
  const handleBulkApprove = async (_comment: string) => {
    // Disabled: no API call
    setSelectedTimesheets([])
  }

  const handleBulkReject = async (_comment: string) => {
    // Disabled: no API call
    setSelectedTimesheets([])
  }
 
  const timesheetTotalPages = Math.ceil(apiTimesheetData.length / Number.parseInt(timesheetPageSize))
  const timesheetStartIndex = (timesheetCurrentPage - 1) * Number.parseInt(timesheetPageSize)
  const timesheetEndIndex = timesheetStartIndex + Number.parseInt(timesheetPageSize)
  const currentTimesheetData = apiTimesheetData.slice(timesheetStartIndex, timesheetEndIndex)
 
  const leaveTotalPages = Math.ceil(leaveData.length / Number.parseInt(leavePageSize))
  const leaveStartIndex = (leaveCurrentPage - 1) * Number.parseInt(leavePageSize)
  const leaveEndIndex = leaveStartIndex + Number.parseInt(leavePageSize)
  const currentLeaveData = leaveData.slice(leaveStartIndex, leaveEndIndex)
 
  const pendingTimesheets = currentTimesheetData.filter((ts) => ts.tsstatus === "pending")
  const selectedTimesheetData = currentTimesheetData.filter((ts) => selectedTimesheets.includes(ts.id))
  const isAllSelected =
    pendingTimesheets.length > 0 && pendingTimesheets.every((ts) => selectedTimesheets.includes(ts.id))
  const isIndeterminate = selectedTimesheets.length > 0 && !isAllSelected
 
  return (
    <div className={`p-4 sm:p-6 space-y-6 ${isDarkMode ? "text-white bg-gray-900" : "text-gray-900 bg-gray-50"}`}>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Hourglass className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            Review & Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="timesheet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-gray-50 dark:bg-gray-700 h-10 sm:h-12 text-sm sm:text-base">
              <TabsTrigger
                value="timesheet"
                className="truncate px-2 sm:px-4 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 font-medium"
              >
                Timesheet Approvals
              </TabsTrigger>
              <TabsTrigger
                value="leave"
                className="truncate px-2 sm:px-4 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-lightblue-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 font-medium"
              >
                Leave Request Approvals
              </TabsTrigger>
            </TabsList>

            {/* Timesheet Tab */}
            <TabsContent value="timesheet" className="mt-4 sm:mt-6">
              {/* Loading State */}
              {timesheetLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">Loading timesheets...</div>
                </div>
              )}

              {/* Error State */}
              {timesheetError && !timesheetLoading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mx-2 sm:mx-6 mb-4">
                  <div className="text-red-700 dark:text-red-300">{timesheetError}</div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={fetchPendingTimesheets}
                    className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Bulk Actions Bar */}
              {false && selectedTimesheets.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4 mx-2 sm:mx-6 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {selectedTimesheets.length} timesheet{selectedTimesheets.length > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTimesheets([])}
                        className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Clear Selection
                      </Button>
                      <Button size="sm" disabled className="bg-gray-300 text-gray-600">Bulk Actions</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State for timesheets */}
              {!timesheetLoading && !timesheetError && apiTimesheetData.length === 0 && (
                <div className="mx-2 sm:mx-6 mb-4">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Pending Approvals</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">You don't have any timesheets pending for approval</p>
                  </div>
                </div>
              )}

              {/* Table - only show when not loading and no error */}
              {!timesheetLoading && !timesheetError && apiTimesheetData.length > 0 && (
                <div className="overflow-x-auto">
                  <Table className="min-w-[750px] text-sm sm:text-base">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">
                        <Checkbox
                        disabled={true}
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          className="border-gray-300 dark:border-gray-600"
                          ref={(el) => {
                            if (el) (el as unknown as HTMLInputElement).indeterminate = isIndeterminate
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Sr.No.</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Duration</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Time</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Submitted On</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Comments</TableHead>
                      <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTimesheetData.map((timesheet, index) => (
                      <TableRow
                        key={timesheet.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                      >
                        <TableCell className="p-2 sm:p-4">
                          <Checkbox
                          disabled={true}
                            checked={selectedTimesheets.includes(timesheet.id)}
                            onCheckedChange={(checked) => handleTimesheetSelect(timesheet.id, checked as boolean)}
                            //disabled={timesheet.tsstatus !== "pending"}
                            className="border-gray-300 dark:border-gray-600"
                          />
                        </TableCell>
                        <TableCell className="p-2 sm:p-4 text-center">
                          <div
                            className={`mx-auto w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                              timesheet.tsstatus === "approved"
                                ? "border-green-300 bg-green-100 text-black"
                                : timesheet.tsstatus === "rejected"
                                  ? "border-red-300 bg-red-100 text-black"
                                  : "border-transparent text-black bg-transparent"
                            }`}
                          >
                            {timesheetStartIndex + index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 p-2 sm:p-4">{timesheet.name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{timesheet.duration}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{timesheet.time}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{timesheet.submittedOn}</TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewComments(timesheet)}
                            className="h-8 px-2 sm:px-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {timesheet.comments} Comments
                          </Button>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <Button
                            size="sm"
                            onClick={() => handleTimesheetReview(timesheet)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 sm:gap-2 font-medium"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              )}

              <Pagination
                currentPage={timesheetCurrentPage}
                totalPages={timesheetTotalPages}
                pageSize={timesheetPageSize}
                totalItems={apiTimesheetData.length}
                onPageChange={setTimesheetCurrentPage}
                onPageSizeChange={setTimesheetPageSize}
              />
            </TabsContent>

            {/* Leave Tab */}
            <TabsContent value="leave" className="mt-4 sm:mt-6">
              <div className="overflow-x-auto">
                <Table className="min-w-[700px] text-sm sm:text-base">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Sr.No.</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Request By</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Type of Leave</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">From Date</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">To Date</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Total Days</TableHead>
                      <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLeaveData.map((leave) => (
                      <TableRow
                        key={leave.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                      >
                        <TableCell className="p-2 sm:p-4 text-center">
                          <div
                            className={`mx-auto w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold border-2 ${
                              leave.status === "approved" || leave.status === "pending_hr_approval"
                                ? "border-green-300 bg-green-100 text-black"
                                : leave.status === "rejected" || leave.status === "rejected_by_hr"
                                  ? "border-red-300 bg-red-100 text-black"
                                  : "border-transparent text-black bg-transparent"
                            }`}
                          >
                            {leave.id}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 p-2 sm:p-4">{leave.requestBy}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{leave.leaveType}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{leave.fromDate}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{leave.toDate}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-200 p-2 sm:p-4">{leave.totalDays}</TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <Button
                            size="sm"
                            onClick={() => handleLeaveReview(leave)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 sm:gap-2 font-medium"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                currentPage={leaveCurrentPage}
                totalPages={leaveTotalPages}
                pageSize={leavePageSize}
                totalItems={leaveData.length}
                onPageChange={setLeaveCurrentPage}
                onPageSizeChange={setLeavePageSize}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Modals */}
        <TimesheetReviewModal
          isOpen={isTimesheetModalOpen}
          onClose={() => setIsTimesheetModalOpen(false)}
          timesheet={selectedTimesheet}
          isViewOnly={false}
          onActionComplete={(result, id) => {
            setApiTimesheetData(prev => {
              if (result === "approved") {
                return prev.map(ts => ts.id === id ? { ...ts, tsstatus: "approved" } : ts)
              }
              // rejected: remove from list
              return prev.filter(ts => ts.id !== id)
            })
            // also clear selection if needed
            setSelectedTimesheets(prev => prev.filter(tsId => tsId !== id))
          }}
        />

        <LeaveReviewModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          leaveRequest={selectedLeave}
        />

        <BulkApprovalModal
          isOpen={isBulkApprovalModalOpen}
          onClose={() => setIsBulkApprovalModalOpen(false)}
          selectedTimesheets={selectedTimesheetData}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
        />

        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          comments={selectedComments}
          title={selectedCommentsTitle}
        />
      </Card>
    </div>
  )
}