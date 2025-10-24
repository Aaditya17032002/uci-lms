"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { ChevronDown, ChevronRight, X, Check, Clock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from "../hooks/use-toast"

// Interfaces for API data
interface TimesheetDayEntry {
  day: string
  date: string
  total: string
  entries: TimesheetEntry[]
}

interface TimesheetEntry {
  engagement: string
  task: string
  comment: string
  hours: number
  minutes: number
}

interface ApiTimesheetData {
  data?: {
    timesheetID: number
    userID: number
    startDate: string
    endDate: string
    status: number
    hoursTotal: number
    minutesTotal: number
    timesheetLines?: {
      day: string
      date: string
      engagement: string
      task: string
      comment: string
      hours: number
      minutes: number
    }[]
    displayTitle: string
    approvedBy?: string
    approvedOn?: string
    approvalComment?: string
    rejectedBy?: string
    rejectedOn?: string
    rejectionComment?: string
  }
}

// Alternate shape: endpoint returns an array of line items directly
interface ApiTimesheetLineItem {
  lineID: number
  timesheetID: number
  engagementID: number
  engagementName: string
  taskID: number
  taskName: string
  hours: number
  minutes: number
  date: string
  comment: string | null
}

interface TimesheetReviewModalProps {
  isOpen: boolean
  onClose: () => void
  timesheet: any
  isViewOnly?: boolean // New prop to control button visibility
  onActionComplete?: (result: "approved" | "rejected", id: number) => void
}

export function TimesheetReviewModal({ isOpen, onClose, timesheet, isViewOnly = false, onActionComplete }: TimesheetReviewModalProps) {
  const [comment, setComment] = useState("")
  const [expandedDays, setExpandedDays] = useState<string[]>(["wednesday"])
  
  // API state management
  const [timesheetData, setTimesheetData] = useState<ApiTimesheetData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockDays, setMockDays] = useState<TimesheetDayEntry[]>([])
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  // API function to fetch timesheet data
  const fetchTimesheetData = async (timesheetId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`https://localhost:7080/api/timesheet/${timesheetId}`, { withCredentials: true })
      console.log("timesheet id", timesheetId)
      setTimesheetData(response.data)

      // Two supported shapes: wrapped object with data.timesheetLines OR a flat array of line items
      const body = response.data
      if (body?.data?.timesheetLines && Array.isArray(body.data.timesheetLines)) {
        const transformedDays = transformApiDataToDays(body.data)
        setMockDays(transformedDays)
      } else if (Array.isArray(body) && body.length > 0) {
        const transformedDays = transformFlatLinesToDays(body as ApiTimesheetLineItem[])
        setMockDays(transformedDays)
      } else {
        // If API did not return any lines, avoid forcing mock fixed dates
        setMockDays([])
      }
    } catch (error: any) {
      console.error("Error fetching timesheet data:", error)
      setError("Failed to load timesheet data")
      // Keep prior mockDays; don't overwrite with fixed Dec week to avoid wrong display
    } finally {
      setLoading(false)
    }
  }

  // Transform API data (wrapped shape) to the expected format
  const transformApiDataToDays = (data: any): TimesheetDayEntry[] => {
    const daysMap = new Map<string, TimesheetDayEntry>()
    
    if (data.timesheetLines && Array.isArray(data.timesheetLines)) {
      data.timesheetLines.forEach((entry: any) => {
        const dayKey = entry.day.toLowerCase()
        if (!daysMap.has(dayKey)) {
          daysMap.set(dayKey, {
            day: entry.day,
            date: entry.date,
            total: "0h 0m",
            entries: []
          })
        }
        
        const dayEntry = daysMap.get(dayKey)!
        dayEntry.entries.push({
          engagement: entry.engagement,
          task: entry.task,
          comment: entry.comment,
          hours: entry.hours,
          minutes: entry.minutes
        })
        
        // Calculate total hours for the day
        const totalMinutes = dayEntry.entries.reduce((total, e) => total + (e.hours * 60) + e.minutes, 0)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        dayEntry.total = `${hours}h ${minutes}m`
      })
    }
    // Sort Monday->Sunday, include Sat/Sun only if they have entries
    const order = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
    const values = Array.from(daysMap.values())
    const filtered = values.filter(d => {
      const key = d.day.toLowerCase()
      if (key === "saturday" || key === "sunday") {
        return d.entries.length > 0
      }
      return true
    })
    filtered.sort((a,b) => order.indexOf(a.day.toLowerCase()) - order.indexOf(b.day.toLowerCase()))
    return filtered
  }

  // Transform flat array of line items to grouped days
  const transformFlatLinesToDays = (lines: ApiTimesheetLineItem[]): TimesheetDayEntry[] => {
    const daysMap = new Map<string, TimesheetDayEntry>()

    lines.forEach((entry) => {
      const jsDate = new Date(entry.date)
      const dayLabel = jsDate.toLocaleDateString(undefined, { weekday: 'long' })
      const dateLabel = jsDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
      const dayKey = dayLabel.toLowerCase()

      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          day: dayLabel,
          date: dateLabel,
          total: '0h 0m',
          entries: []
        })
      }

      const dayEntry = daysMap.get(dayKey)!
      dayEntry.entries.push({
        engagement: entry.engagementName,
        task: entry.taskName,
        comment: entry.comment || '',
        hours: entry.hours,
        minutes: entry.minutes
      })

      const totalMinutes = dayEntry.entries.reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      dayEntry.total = `${hours}h ${minutes}m`
    })
    // Sort Monday->Sunday, include Sat/Sun only if they have entries
    const order = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
    const values = Array.from(daysMap.values())
    const filtered = values.filter(d => {
      const key = d.day.toLowerCase()
      if (key === "saturday" || key === "sunday") {
        return d.entries.length > 0
      }
      return true
    })
    filtered.sort((a,b) => order.indexOf(a.day.toLowerCase()) - order.indexOf(b.day.toLowerCase()))
    return filtered
  }

  // removed mock fallback data

  // Fetch timesheet data when modal opens
  useEffect(() => {
    if (isOpen && timesheet?.id) {
      fetchTimesheetData(timesheet.id)
    }
  }, [isOpen, timesheet?.id])

  console.log("timesheet.tsstatus [inside tsreviewmodal func]:", timesheet?.tsstatus);
  
  // Get status from timesheetData if available, otherwise use timesheet prop
  const getStatusFromData = () => {
    if (timesheetData?.data?.status !== undefined) {
      return timesheetData.data.status
    }
    return timesheet?.tsstatus
  }
  
  const currentStatus = getStatusFromData()
  
  // Debug logging
  console.log("Modal timesheet prop:", timesheet)
  console.log("Modal timesheetData:", timesheetData)
  
  const TsApprovalStatus = {
    status: currentStatus === "approved" || currentStatus === 2
      ? "Approved"
      : currentStatus === "rejected" || currentStatus === 3
        ? "Rejected"
        : "Pending",

    approvedBy: timesheetData?.data?.approvedBy || "John Doe (Manager)",

    approvedOn: timesheetData?.data?.approvedOn ? new Date(timesheetData.data.approvedOn).toLocaleDateString() : "2025-07-20",

    comment: currentStatus === "rejected" || currentStatus === 3
      ? timesheetData?.data?.rejectionComment || "Timesheet rejected by manager."
      : timesheetData?.data?.approvalComment || "Timesheet approved by manager."
  }


  const toggleDay = (day: string) => {
    setExpandedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }


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

  const handleApprove = async () => {
    if (!timesheet?.id || actionLoading) return
    setActionLoading(true)
    try {
      await axios.post(
        `https://localhost:7080/api/timesheet/Approve`,
        { timesheetID: timesheet.id, approvalComment: comment || "", modUser: 0 },
        { withCredentials: true }
      )
      toast({ title: "Timesheet approved successfully", className: "border-green-500" })
      if (timesheet?.id) onActionComplete?.("approved", timesheet.id)
      onClose()
    } catch (err) {
      console.error("Approve failed", err)
      setError("Failed to approve timesheet")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!timesheet?.id || actionLoading) return
    setActionLoading(true)
    try {
      await axios.post(
        `https://localhost:7080/api/timesheet/Reject`,
        { timesheetID: timesheet.id, rejectionComment: comment || "", modUser: 0 },
        { withCredentials: true }
      )
      toast({ title: "Timesheet rejected successfully", className: "border-red-500" })
      if (timesheet?.id) onActionComplete?.("rejected", timesheet.id)
      onClose()
    } catch (err) {
      console.error("Reject failed", err)
      setError("Failed to reject timesheet")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: '1200px' }} className="w-full max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto sm:overflow-x-visible lg:scrollbar-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-600 pb-4 px-6 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-left break-words">
              {timesheet?.name || "Unknown User"}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 px-3 py-1 text-sm font-medium whitespace-normal">
                {timesheet?.duration || timesheetData?.data?.displayTitle || "Unknown Duration"}
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 px-3 py-1 text-sm font-medium whitespace-nowrap">
                {timesheet?.time || (timesheetData?.data ? `Total: ${timesheetData.data.hoursTotal}h ${timesheetData.data.minutesTotal}m` : "Total: 0h 0m")}
              </Badge>

              {getTsApprovalBadge(TsApprovalStatus.status)}

            </div>
          </div>
        </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading timesheet data...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="text-red-700 dark:text-red-300">{error}</div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => timesheet?.id && fetchTimesheetData(timesheet.id)}
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && mockDays.length === 0 && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 p-6 text-center text-gray-700 dark:text-gray-200">
              No data found for this timesheet.
            </div>
          )}

          {/* Timesheet Data */}
          {!loading && !error && mockDays.length > 0 && mockDays.map((dayData) => (
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
                disabled={TsApprovalStatus.status !== "Pending"}
                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
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
                    ) || actionLoading
                  }
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-base font-medium rounded-md shadow-sm">
                  <X className="h-2 w-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove}
                  disabled={
                    !(
                      TsApprovalStatus.status === "Pending"
                    ) || actionLoading
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

