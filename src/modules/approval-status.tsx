"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Clock, Mail } from 'lucide-react'
import { Pagination } from "../common/pagination"
import { NotificationPopup } from "../common/notification-popup" // Import the new component

interface ApprovalRecord {
  id: number
  employeeName: string
  managerName: string
  timesheetDuration: string
  pendingDays: number
  lastNotified: string | null
}

const mockData: ApprovalRecord[] = [
  { id: 1, employeeName: "Rajesh Kumar", managerName: "Priya Sharma", timesheetDuration: "Dec 3rd Week (Dec 16...)", pendingDays: 82, lastNotified: null },
  { id: 2, employeeName: "Amit Singh", managerName: "Vikram Patel", timesheetDuration: "Jan 2nd Week (Jan 13...)", pendingDays: 79, lastNotified: null },
  { id: 3, employeeName: "Suresh Gupta", managerName: "Meera Joshi", timesheetDuration: "Jan 3rd Week (Jan 20...)", pendingDays: 79, lastNotified: null },
  { id: 4, employeeName: "Kavita Reddy", managerName: "Arjun Nair", timesheetDuration: "Jan 4th Week (Jan 27...)", pendingDays: 77, lastNotified: null },
  { id: 5, employeeName: "Deepak Agarwal", managerName: "Sunita Verma", timesheetDuration: "Feb 1st Week (Feb 03...)", pendingDays: 76, lastNotified: null },
  { id: 6, employeeName: "Anita Gupta", managerName: "Ravi Sharma", timesheetDuration: "Dec 4th Week (Dec 23...)", pendingDays: 76, lastNotified: "22-Jul-2025 13:50" },
  { id: 7, employeeName: "Neha Joshi", managerName: "Vikram Patel", timesheetDuration: "Jan 3rd Week (Jan 20...)", pendingDays: 8, lastNotified: null },
  { id: 8, employeeName: "Ravi Verma", managerName: "Priya Sharma", timesheetDuration: "Feb 2nd Week (Feb 10...)", pendingDays: 8, lastNotified: null },
  { id: 9, employeeName: "Sunita Nair", managerName: "Arjun Nair", timesheetDuration: "Feb 3rd Week (Feb 17...)", pendingDays: 8, lastNotified: null },
  { id: 10, employeeName: "Vikram Singh", managerName: "Meera Joshi", timesheetDuration: "Jan 4th Week (Jan 27...)", pendingDays: 7, lastNotified: null },
  { id: 11, employeeName: "Priya Patel", managerName: "Ravi Sharma", timesheetDuration: "Jan 2nd Week (Jan 13...)", pendingDays: 6, lastNotified: null },
]

export function ApprovalStatusPage() {
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false) // State for popup visibility
  const [notificationMessage, setNotificationMessage] = useState("") // State for popup message

  const getBadgeColor = (pendingDays: number) => {
    if (pendingDays < 3) return "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
    if (pendingDays >= 3 && pendingDays < 10) return "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
    if (pendingDays >= 10 && pendingDays < 20) return "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400"
    return "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
  }

  const handleNotify = async (record: ApprovalRecord) => {
    console.log("Notify button clicked!")
    setNotificationMessage("Notified Successfully") // Set the message
    setShowNotificationPopup(true) // Show the popup

    // The actual notification logic (e.g., sending an email) still respects the condition.
    if (record.pendingDays >= 3) {
      console.log(`Sending notification email to manager ${record.managerName} for ${record.employeeName}'s timesheet approval`)
    } else {
      console.log(`Notification not sent (pending days < 3) for ${record.employeeName}'s timesheet.`)
    }
  }

  const totalPages = Math.ceil(mockData.length / parseInt(pageSize))
  const startIndex = (currentPage - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const currentData = mockData.slice(startIndex, endIndex)

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          Approval Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <TableHead className="w-16 font-semibold text-gray-700 dark:text-gray-300 p-4">#</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Employee Name</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Manager Name</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Timesheet Duration</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Pending Since</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Last Notified</TableHead>
                <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-300 p-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((record) => (
                <TableRow key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                  <TableCell className="font-medium text-gray-600 dark:text-gray-400 p-4">{record.id}</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white p-4">{record.employeeName}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 p-4">{record.managerName}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs truncate p-4" title={record.timesheetDuration}>
                    {record.timesheetDuration}
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge className={`${getBadgeColor(record.pendingDays)} font-medium`}>
                      {record.pendingDays} Days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 p-4">
                    {record.lastNotified || "--"}
                  </TableCell>
                  <TableCell className="p-4">
                    <Button
                      size="sm"
                      onClick={() => handleNotify(record)}
                      className={`
                        font-medium transition-all duration-200 flex items-center gap-1.5
                        ${record.pendingDays < 3 
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }
                      `}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Notify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={mockData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
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
