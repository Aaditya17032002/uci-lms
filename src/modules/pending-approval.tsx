//== responsive ==

"use client"
 
import { useState } from "react"
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
 
const timesheetData = [
  {
    id: 1,
    name: "Rahul Sharma",
    duration: "Dec 2nd Week (Dec 09 - Dec 13)",
    time: "40h 0m",
    submittedOn: "08-Apr-2025 00:29",
    comments: 2,
    commentsData: [
      {
        id: 1,
        user: { name: "Rahul Sharma", initials: "RS" },
        action: "submitted the Timesheet",
        timestamp: "2 months ago (30-May-2025 17:28)",
        commentText: "Initial submission.",
      },
      {
        id: 2,
        user: { name: "Max Smith", initials: "MS" },
        action: "approved the Timesheet",
        timestamp: "1 month ago (13-Jun-2025 18:41)",
        commentText: "Approved as per policy.",
      },
    ],
    tsstatus: "approved",
  },
  {
    id: 2,
    name: "Priya Patel",
    duration: "Dec 1st Week (Dec 02 - Dec 06)",
    time: "38h 30m",
    submittedOn: "07-Apr-2025 15:45",
    comments: 1,
    commentsData: [
      {
        id: 3,
        user: { name: "John Doe", initials: "JD" },
        action: "submitted the Timesheet",
        timestamp: "1 month ago (01-Jul-2025 10:00)",
        commentText: "Submitted after minor corrections.",
      },
    ],
    tsstatus: "approved",
  },
  {
    id: 3,
    name: "Amit Kumar",
    duration: "Nov 4th Week (Nov 25 - Nov 29)",
    time: "42h 15m",
    submittedOn: "30-Nov-2024 10:20",
    comments: 3,
    commentsData: [
      {
        id: 4,
        user: { name: "Jane Smith", initials: "JS" },
        action: "submitted the Timesheet",
        timestamp: "3 months ago (28-Apr-2025 14:00)",
        commentText: "Final submission for the week.",
      },
      {
        id: 5,
        user: { name: "Alice Brown", initials: "AB" },
        action: "requested changes",
        timestamp: "2 months ago (05-May-2025 09:30)",
        commentText: "Please clarify hours for Project X.",
      },
      {
        id: 6,
        user: { name: "Amit Kumar", initials: "AK" },
        action: "updated the Timesheet",
        timestamp: "2 months ago (06-May-2025 11:00)",
        commentText: "Updated hours for Project X as requested.",
      },
    ],
    tsstatus: "rejected",
  },
  {
    id: 4,
    name: "Suresh Gupta",
    duration: "Dec 3rd Week (Dec 16 - Dec 20)",
    time: "40h 0m",
    submittedOn: "21-Dec-2024 09:15",
    comments: 0,
    commentsData: [],
    tsstatus: "pending",
  },
  {
    id: 5,
    name: "Kavita Reddy",
    duration: "Jan 1st Week (Jan 01 - Jan 05)",
    time: "35h 30m",
    submittedOn: "06-Jan-2025 16:30",
    comments: 1,
    commentsData: [
      {
        id: 7,
        user: { name: "Bob Johnson", initials: "BJ" },
        action: "submitted the Timesheet",
        timestamp: "1 month ago (10-Jul-2025 17:00)",
        commentText: "Submitted on time.",
      },
    ],
    tsstatus: "pending",
  },
]
 
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
  const [selectedComments, setSelectedComments] = useState([])
  const [selectedCommentsTitle, setSelectedCommentsTitle] = useState("")
 
  const handleTimesheetReview = (timesheet: any) => {
    setSelectedTimesheet(timesheet)
    setIsTimesheetModalOpen(true)
  }
 
  const handleLeaveReview = (leave: any) => {
    setSelectedLeave(leave)
    setIsLeaveModalOpen(true)
  }
 
  const handleViewComments = (timesheet: any) => {
    setSelectedComments(timesheet.commentsData || [])
    setSelectedCommentsTitle(`${timesheet.name}'s Timesheet`)
    setIsCommentsModalOpen(true)
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
    if (selectedTimesheets.length > 0) {
      setIsBulkApprovalModalOpen(true)
    }
  }
 
  const handleBulkApprove = async (comment: string) => {
    console.log("Bulk approving timesheets:", selectedTimesheets, "with comment:", comment)
    // Here you would make API calls to approve the selected timesheets
    setSelectedTimesheets([])
  }
 
  const handleBulkReject = async (comment: string) => {
    console.log("Bulk rejecting timesheets:", selectedTimesheets, "with comment:", comment)
    // Here you would make API calls to reject the selected timesheets
    setSelectedTimesheets([])
  }
 
  const timesheetTotalPages = Math.ceil(timesheetData.length / Number.parseInt(timesheetPageSize))
  const timesheetStartIndex = (timesheetCurrentPage - 1) * Number.parseInt(timesheetPageSize)
  const timesheetEndIndex = timesheetStartIndex + Number.parseInt(timesheetPageSize)
  const currentTimesheetData = timesheetData.slice(timesheetStartIndex, timesheetEndIndex)
 
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
              {/* Bulk Actions Bar */}
              {selectedTimesheets.length > 0 && (
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
                      <Button
                        size="sm"
                        onClick={handleBulkApproval}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Bulk Actions
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table className="min-w-[750px] text-sm sm:text-base">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-2 sm:p-4">
                        <Checkbox
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
                    {currentTimesheetData.map((timesheet) => (
                      <TableRow
                        key={timesheet.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                      >
                        <TableCell className="p-2 sm:p-4">
                          <Checkbox
                            checked={selectedTimesheets.includes(timesheet.id)}
                            onCheckedChange={(checked) => handleTimesheetSelect(timesheet.id, checked as boolean)}
                            disabled={timesheet.tsstatus !== "pending"}
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
                            {timesheet.id}
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

              <Pagination
                currentPage={timesheetCurrentPage}
                totalPages={timesheetTotalPages}
                pageSize={timesheetPageSize}
                totalItems={timesheetData.length}
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