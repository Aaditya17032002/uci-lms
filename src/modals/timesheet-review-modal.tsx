"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { ChevronDown, ChevronRight, X, Check, Clock, CheckCircle, XCircle } from 'lucide-react'

interface TimesheetReviewModalProps {
  isOpen: boolean
  onClose: () => void
  timesheet: any
  isViewOnly?: boolean // New prop to control button visibility
}

export function TimesheetReviewModal({ isOpen, onClose, timesheet, isViewOnly = false }: TimesheetReviewModalProps) {
  const [comment, setComment] = useState("")
  const [expandedDays, setExpandedDays] = useState<string[]>(["wednesday"])

  console.log("timesheet.tsstatus [inside tsreviewmodal func]:", timesheet?.tsstatus);
  const TsApprovalStatus = {
    status: timesheet?.tsstatus === "approved"
      ? "Approved"
      : timesheet?.tsstatus === "rejected"

        ? "Rejected"

        : "Pending",

    approvedBy: "John Doe (Manager)",

    approvedOn: timesheet?.tsstatus === "rejected" ? "2025-07-20" : "2025-07-20",

    comment: timesheet?.tsstatus === "rejected"

      ? "Timesheet rejected by manager."

      : "Timesheet approved by manager."

  }


  const toggleDay = (day: string) => {
    setExpandedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const mockDays = [
    {
      day: "Monday",
      date: "09 Dec 2024",
      total: "8h 0m",
      entries: [
        { engagement: "E-commerce Platform", task: "Frontend Development", comment: "Worked on product listing page.", hours: 8, minutes: 0 }
      ]
    },
    {
      day: "Tuesday",
      date: "10 Dec 2024",
      total: "8h 0m",
      entries: [
        { engagement: "E-commerce Platform", task: "Backend Integration", comment: "Integrated payment gateway API.", hours: 8, minutes: 0 }
      ]
    },
    {
      day: "Wednesday",
      date: "11 Dec 2024",
      total: "8h 0m",
      entries: [
        { engagement: "Full Day Leave", task: "Casual Leave", comment: "Personal work.", hours: 8, minutes: 0 }
      ]
    },
    {
      day: "Thursday",
      date: "12 Dec 2024",
      total: "8h 0m",
      entries: [
        { engagement: "Mobile Banking App", task: "UI/UX Design Review", comment: "Reviewed new design mockups with client.", hours: 4, minutes: 0 },
        { engagement: "Mobile Banking App", task: "Bug Fixing", comment: "Fixed login authentication bug.", hours: 4, minutes: 0 }
      ]
    },
    {
      day: "Friday",
      date: "13 Dec 2024",
      total: "8h 0m",
      entries: [
        { engagement: "HR Management System", task: "Database Schema Update", comment: "Added new fields for employee records.", hours: 8, minutes: 0 }
      ]
    },
  ]

  const getTsApprovalBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 px-3 py-1 text-sm font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 px-3 py-1 text-sm font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Rejected</Badge>
      default:
        return null
    }
  }

  const handleApprove = () => {
    console.log("Approved timesheet with comment:", comment)
    onClose()
  }

  const handleReject = () => {
    console.log("Rejected timesheet with comment:", comment)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: '1200px' }} className="w-full max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto overflow-y-hidden sm:overflow-x-visible lg:scrollbar-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-600 pb-4 px-6 pt-6 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-left">
              {timesheet?.name || "Rahul Sharma"}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 px-3 py-1 text-sm font-medium">
                {timesheet?.duration || "Dec 2nd Week (Dec 09 - Dec 13)"}
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 px-3 py-1 text-sm font-medium">
                {timesheet?.total || "Total: 40h 0m"}
              </Badge>

              {getTsApprovalBadge(TsApprovalStatus.status)}

            </div>
          </div>
        </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {mockDays.map((dayData) => (
            <Collapsible
              key={dayData.day.toLowerCase()}
              open={expandedDays.includes(dayData.day.toLowerCase())}
              onOpenChange={() => toggleDay(dayData.day.toLowerCase())}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    {expandedDays.includes(dayData.day.toLowerCase()) ? (
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {dayData.day} - {dayData.date}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {dayData.total}
                  </Badge>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                {dayData.entries.length > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ml-7 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                          <TableHead className="w-12 text-gray-700 dark:text-gray-200 font-semibold p-3">#</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Day</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Date</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Engagement</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Task</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Comment</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Hours</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-200 font-semibold p-3">Minutes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayData.entries.map((entry, index) => (
                          <TableRow key={index} className="border-b border-gray-100 dark:border-gray-600 even:bg-gray-50 dark:even:bg-gray-700/50">
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{index + 1}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{dayData.day}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{dayData.date}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{entry.engagement}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{entry.task}</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300 p-3">{entry.comment || "-"}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{entry.hours}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100 p-3">{entry.minutes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 ml-7">
                    No entries for this day
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-600 px-2 py-1 space-y-4">
          {!isViewOnly && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Comments</label>
              <Textarea
                placeholder="Enter your comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {isViewOnly ? (
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-base font-medium rounded-md shadow-sm">
                Close
              </Button>
            ) : (
              <>
                <Button variant="destructive" onClick={handleReject}
                  disabled={
                    !(
                      TsApprovalStatus.status === "Pending"
                    )
                  }
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-base font-medium rounded-md shadow-sm">
                  <X className="h-2 w-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove}
                  disabled={
                    !(
                      TsApprovalStatus.status === "Pending"
                    )
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-base font-medium rounded-md shadow-sm">
                  <Check className="h-2 w-2" />
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

