// == responsive ==


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Label } from "../../ui/label"
import { CalendarIcon, Save, X } from "lucide-react"
import { Calendar } from "../../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { format, isWeekend, eachDayOfInterval } from "date-fns"
import { cn } from "../../lib/utils"
import { useToast } from "../../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog"

interface LeaveDayDetail {
  date: string // YYYY-MM-DD format
  type: "Full Day" | "First-Half" | "Second-Half"
}

export function AddLeaveForm() {
  const [leaveType, setLeaveType] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [leaveDayDetails, setLeaveDayDetails] = useState<LeaveDayDetail[]>([])
  const [successOpen, setSuccessOpen] = useState(false)

  // Multiple attachments, up to 5
  const [attachments, setAttachments] = useState<File[]>([])
  const { toast } = useToast()

  const availableLeaveTypes = [
    { name: "Casual Leave", code: "CL", left: 7 },
    { name: "Sick Leave", code: "SL", left: 4 },
    { name: "Leave Without Pay", code: "LWP", left: null },
    { name: "Work From Home", code: "WFH", left: null },
    { name: "Comp-Off", code: "CO", left: null },
  ]

  const leaveTextColorMap: Record<string, string> = {
    "Casual Leave": "text-yellow-600 bg-yellow-100",
    "Sick Leave": "text-red-600 bg-red-100",
    "Leave Without Pay": "text-orange-600 bg-orange-100",
    "Work From Home": "text-blue-600 bg-blue-100",
    "Comp-Off": "text-green-600 bg-green-100",
  }

  const leavePillMap: Record<string, string> = {
    "Casual Leave": "bg-yellow-50 text-yellow-700",
    "Sick Leave": "bg-red-50 text-red-700",
    "Leave Without Pay": "bg-orange-50 text-orange-700",
    "Work From Home": "bg-blue-50 text-blue-700",
    "Comp-Off": "bg-green-50 text-green-700",
  }

  const selectedTextClass = leaveType ? leaveTextColorMap[leaveType] : "text-gray-900 dark:text-white"

  // File constraints
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf", "application/msword"]
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const MAX_FILES:number = 5

  const handleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files
    if (!filesList || filesList.length === 0) {
      e.currentTarget.value = ""
      return
    }

    const incoming = Array.from(filesList)
    const remainingSlots = Math.max(0, MAX_FILES - attachments.length)

    const errors: string[] = []
    const dedupeKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`

    // Build a set of existing keys for duplicate detection
    const existingKeys = new Set(attachments.map(dedupeKey))

    // Validate type/size and exclude duplicates
    const validated: File[] = []
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: invalid type`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: exceeds 5MB`)
        continue
      }
      const key = dedupeKey(file)
      if (existingKeys.has(key)) {
        errors.push(`${file.name}: already added`)
        continue
      }
      validated.push(file)
    }

    // Respect remaining slots
    let added: File[] = validated
    let ignoredForCount = 0
    if (validated.length > remainingSlots) {
      added = validated.slice(0, remainingSlots)
      ignoredForCount = validated.length - remainingSlots
    }

    if (errors.length || ignoredForCount > 0) {
      const parts = []
      if (errors.length) parts.push(`Issues: ${errors.join(", ")}`)
      if (ignoredForCount > 0) parts.push(`Only ${remainingSlots} more allowed; ignored ${ignoredForCount}`)
      toast({
        title: "File upload notice",
        description: parts.join(" | "),
        variant: "destructive",
        duration: 4500,
      })
    }

    if (added.length > 0) {
      setAttachments((prev) => [...prev, ...added])
    }

    // Reset input value to allow re-selecting the same files later
    e.currentTarget.value = ""
  }

  const removeAttachmentAt = (index: number) => {
    setAttachments((prev) => {
      const copy = [...prev]
      copy.splice(index, 1)
      return copy
    })
  }

  const clearAllAttachments = () => {
    setAttachments([])
  }

  // Function to disable weekends
  const disableWeekends = (date: Date) => isWeekend(date)

  // Generate leave day details when start or end date changes
  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      const newDetails: LeaveDayDetail[] = days
        .filter((day) => !isWeekend(day)) // Filter out weekends
        .map((day) => ({
          date: format(day, "yyyy-MM-dd"),
          type: "Full Day",
        }))
      setLeaveDayDetails(newDetails)
    } else {
      setLeaveDayDetails([])
    }
  }, [startDate, endDate])

  const handleDayDetailChange = (date: string, type: "Full Day" | "First-Half" | "Second-Half") => {
    setLeaveDayDetails((prev) => prev.map((detail) => (detail.date === date ? { ...detail, type } : detail)))
  }

  const handleSubmit = () => {
    if (!leaveType || !startDate || !endDate || !reason || leaveDayDetails.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Require at least one attachment for Sick Leave
    if (leaveType === "Sick Leave" && attachments.length === 0) {
      toast({
        title: "Attachment required",
        description: "Please upload supporting document(s) for Sick Leave.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Safety validation for selected files
    for (const file of attachments) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Allowed types: .png, .jpg, .jpeg, .pdf, .doc",
          variant: "destructive",
          duration: 3000,
        })
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Maximum allowed size is 5MB.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }
    }

    const totalDays = leaveDayDetails.length

    const submissionData = {
      leaveType,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      totalDays,
      leaveDayDetails,
      reason,
      attachments:
        attachments.length > 0
          ? attachments.map((f) => ({
              name: f.name,
              type: f.type,
              size: f.size,
            }))
          : [],
    }
    console.log("Leave Request Submitted:", submissionData)
    toast({
      title: "Success",
      description: "Leave request submitted successfully!",
      duration: 3000,
    })
    setSuccessOpen(true)

    // Reset form
    setLeaveType("")
    setStartDate(undefined)
    setEndDate(undefined)
    setReason("")
    setLeaveDayDetails([])
    setAttachments([])
  }

  const handleCancel = () => {
    setLeaveType("")
    setStartDate(undefined)
    setEndDate(undefined)
    setReason("")
    setLeaveDayDetails([])
    setAttachments([])
    toast({
      title: "Cancelled",
      description: "Leave request form cleared.",
      duration: 2000,
    })
  }

  const remainingSlots = Math.max(0, MAX_FILES - attachments.length)

  return (
  <div className="space-y-6 px-3 sm:px-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Leave Request</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="leaveType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Leave Type
          </Label>
          <Select value={leaveType} onValueChange={setLeaveType}>
            <SelectTrigger
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600",
                !leaveType ? "text-gray-500 dark:text-gray-400" : selectedTextClass,
              )}
            >
              <SelectValue placeholder="Select Leave Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2">
              <div className="space-y-3">
                {availableLeaveTypes.map((type) => (
                  <SelectItem
                    key={type.name}
                    value={type.name}
                    className={cn(
                      "flex items-center justify-between px-2 py-2 rounded-md cursor-pointer gap-2",
                      leavePillMap[type.name],
                    )}
                  >
                    <span>{type.name}</span>
                    {type.left !== null && (
                      <span className="ml-2 text-xs font-semibold rounded-full bg-white/40 px-2 py-0.5">
                        {type.left} left
                      </span>
                    )}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white",
                    !startDate && "text-gray-500 dark:text-gray-400",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={disableWeekends}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white",
                    !endDate && "text-gray-500 dark:text-gray-400",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={disableWeekends}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {leaveType === "Sick Leave" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full">Attachments</Label>

            {/* Keep chooser visible until 5 files are attached */}
            {remainingSlots > 0 && (
              <>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,application/pdf,application/msword"
                  onChange={handleFilesAdd}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can add {remainingSlots} more file{remainingSlots === 1 ? "" : "s"}. Accepted: .png, .jpg, .jpeg,
                  .pdf, .doc. Max size 5MB each.
                </p>
              </>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 w-full">
                  {attachments.map((file, idx) => (
                    <div key={file.name + idx} className="flex items-center justify-between px-3 py-2 text-sm w-full">
                      <div className="min-w-0 flex-1 truncate">
                        <span className="truncate">{file.name}</span>{" "}
                        <span className="text-gray-500 dark:text-gray-400">
                          {"\u2022"} {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachmentAt(idx)}
                        aria-label={`Remove ${file.name}`}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {attachments.length} of {MAX_FILES} file{MAX_FILES === 1 ? "" : "s"} attached
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllAttachments}
                    className="text-gray-700 dark:text-gray-300 bg-transparent"
                    aria-label="Clear all attachments"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {leaveDayDetails.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Leave Day Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leaveDayDetails.map((dayDetail) => (
                <div key={dayDetail.date} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {format(new Date(dayDetail.date), "yyyy-MM-dd")}
                  </Label>
                  <Select
                    value={dayDetail.type}
                    onValueChange={(value: "Full Day" | "First-Half" | "Second-Half") =>
                      handleDayDetailChange(dayDetail.date, value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 w-full",
                        !leaveType ? "text-gray-500 dark:text-gray-400" : selectedTextClass,
                      )}
                    >
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <SelectItem
                        value="Full Day"
                        className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Full Day
                      </SelectItem>
                      <SelectItem
                        value="First-Half"
                        className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        First-Half
                      </SelectItem>
                      <SelectItem
                        value="Second-Half"
                        className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Second-Half
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason
          </Label>
          <Textarea
            id="reason"
            placeholder="Justify your reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700  w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
        >
          <X className="h-4 w-4" />
          Clear Form
        </Button>
        <Button onClick={handleSubmit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Save className="h-4 w-4" />
          Submit
        </Button>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{"Leave Request submitted successfully"}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>{"OK"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
