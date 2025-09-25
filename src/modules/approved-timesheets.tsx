//===================== responsive ========================================================
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { FileCheck, Eye } from 'lucide-react'
import { Pagination } from "../common/pagination"
import { TimesheetReviewModal } from "../modals/timesheet-review-modal"

const mockApprovedTimesheets = [
  { 
    id: 1, 
    employeeName: "Rajesh Kumar", 
    duration: "Jan 1st Week (Jan 01 - Jan 07)", 
    totalHours: "40h 0m", 
    approvedBy: "Priya Sharma", 
    approvedOn: "08-Jan-2025 10:30", 
    status: "Approved",
    commentsData: [
      { id: 1, user: { name: "Rajesh Kumar", initials: "RK" }, action: "submitted the Timesheet", timestamp: "07-Jan-2025 09:00", commentText: "All hours logged." },
      { id: 2, user: { name: "Priya Sharma", initials: "PS" }, action: "approved the Timesheet", timestamp: "08-Jan-2025 10:30", commentText: "Looks good." }
    ]
  },
  { 
    id: 2, 
    employeeName: "Anita Singh", 
    duration: "Jan 1st Week (Jan 01 - Jan 07)", 
    totalHours: "38h 30m", 
    approvedBy: "Vikram Patel", 
    approvedOn: "08-Jan-2025 11:15", 
    status: "Approved",
    commentsData: [
      { id: 3, user: { name: "Anita Singh", initials: "AS" }, action: "submitted the Timesheet", timestamp: "07-Jan-2025 10:00", commentText: "Completed tasks for the week." },
      { id: 4, user: { name: "Vikram Patel", initials: "VP" }, action: "approved the Timesheet", timestamp: "08-Jan-2025 11:15", commentText: "Approved." }
    ]
  },
  { 
    id: 3, 
    employeeName: "Suresh Gupta", 
    duration: "Dec 4th Week (Dec 23 - Dec 29)", 
    totalHours: "35h 0m", 
    approvedBy: "Meera Joshi", 
    approvedOn: "30-Dec-2024 16:45", 
    status: "Approved",
    commentsData: [
      { id: 5, user: { name: "Suresh Gupta", initials: "SG" }, action: "submitted the Timesheet", timestamp: "29-Dec-2024 15:00", commentText: "Holiday week, reduced hours." },
      { id: 6, user: { name: "Meera Joshi", initials: "MJ" }, action: "approved the Timesheet", timestamp: "30-Dec-2024 16:45", commentText: "Acknowledged holiday hours." }
    ]
  },
  { 
    id: 4, 
    employeeName: "Kavita Reddy", 
    duration: "Dec 4th Week (Dec 23 - Dec 29)", 
    totalHours: "40h 0m", 
    approvedBy: "Arjun Nair", 
    approvedOn: "30-Dec-2024 14:20", 
    status: "Approved",
    commentsData: [
      { id: 7, user: { name: "Kavita Reddy", initials: "KR" }, action: "submitted the Timesheet", timestamp: "29-Dec-2024 10:00", commentText: "All tasks completed." },
      { id: 8, user: { name: "Arjun Nair", initials: "AN" }, action: "approved the Timesheet", timestamp: "30-Dec-2024 14:20", commentText: "Approved." }
    ]
  },
  { 
    id: 5, 
    employeeName: "Deepak Agarwal", 
    duration: "Dec 3rd Week (Dec 16 - Dec 22)", 
    totalHours: "42h 15m", 
    approvedBy: "Sunita Verma", 
    approvedOn: "23-Dec-2024 09:30", 
    status: "Approved",
    commentsData: [
      { id: 9, user: { name: "Deepak Agarwal", initials: "DA" }, action: "submitted the Timesheet", timestamp: "22-Dec-2024 18:00", commentText: "Overtime due to critical deadline." },
      { id: 10, user: { name: "Sunita Verma", initials: "SV" }, action: "approved the Timesheet", timestamp: "23-Dec-2024 09:30", commentText: "Approved overtime for project X." }
    ]
  },
]

export function ApprovedTimesheetsPage() {
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState(null)

  const handleView = (timesheet: any) => {
    setSelectedTimesheet(timesheet)
    setIsViewModalOpen(true)
  }

  const totalPages = Math.ceil(mockApprovedTimesheets.length / parseInt(pageSize))
  const startIndex = (currentPage - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const currentData = mockApprovedTimesheets.slice(startIndex, endIndex)

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
            <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            Approved Timesheets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Responsive wrapper */}
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200">#</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Employee Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Duration</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Total Hours</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Approved By</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Approved On</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Status</TableHead>
                  <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((timesheet) => (
                  <TableRow key={timesheet.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <TableCell className="font-medium text-gray-600 dark:text-gray-300">{timesheet.id}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{timesheet.employeeName}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 whitespace-nowrap">{timesheet.duration}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200">{timesheet.totalHours}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 whitespace-nowrap">{timesheet.approvedBy}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-200 whitespace-nowrap">{timesheet.approvedOn}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                        {timesheet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleView(timesheet)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-2 py-1 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="px-2 sm:px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={mockApprovedTimesheets.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <TimesheetReviewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        timesheet={selectedTimesheet}
        isViewOnly={true} // This is for viewing, so it's view only
      />
    </>
  )
}
