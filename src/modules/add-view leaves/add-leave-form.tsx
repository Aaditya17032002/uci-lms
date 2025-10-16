
"use client"

import type React from "react"
import axios from "axios"
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
import { Loader2 } from "lucide-react"

export interface LeaveRecordWithDetails {
  requestID: number
  leaveType: string
  startDate: Date
  endDate: Date
  reason: string
  leaveDayDetails: LeaveDayDetail[]
}

interface AddLeaveFormProps {
  leaveToEdit?: LeaveRecordWithDetails
  defaultValues?: {
    requestID?: number
    leaveType: string
    startDate: Date
    endDate: Date
    reason: string
    leaveDayDetails: LeaveDayDetail[]
  }
  onSubmitSuccess?: () => void
}

interface LeaveDayDetail {
  date: string // YYYY-MM-DD format
  type: "Full Day" | "First-Half" | "Second-Half"
}
interface LeaveType {
  leaveTypeId: number
  leaveName: string
  remainingLeaves: number | null
}

export function AddLeaveForm({
  defaultValues,
  leaveToEdit,
  onSubmitSuccess,
}: AddLeaveFormProps) {
  const [leaveType, setLeaveType] = useState(defaultValues?.leaveType || "")
  const [startDate, setStartDate] = useState<Date | undefined>(defaultValues?.startDate)
  const [endDate, setEndDate] = useState<Date | undefined>(defaultValues?.endDate)
  const [reason, setReason] = useState(defaultValues?.reason || "")
  const [leaveDayDetails, setLeaveDayDetails] = useState<LeaveDayDetail[]>(defaultValues?.leaveDayDetails || [])
  const [successOpen, setSuccessOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const { toast } = useToast()
  const [popupMessage, setPopupMessage] = useState("")
  const [isErrorPopup, setIsErrorPopup] = useState(false)
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [notification, setNotification] = useState<{
  message: string
  type: "error" | "success" | "info"
} | null>(null)
const [isStartPickerOpen, setIsStartPickerOpen] = useState(false)
const [isEndPickerOpen, setIsEndPickerOpen] = useState(false)



  const fetchLeaveTypes = async (force = false) => {
    if (!force && leaveTypes.length > 0) return

    try {
      setLoadingLeaves(true)
      const res = await axios.get("https://localhost:7080/api/Leave/GetUserRemainingLeaves", {
        withCredentials: true,
      })

      if (res.data?.result) {
        setLeaveTypes(res.data.result)
      } else {
        setLeaveTypes([])
      }
    } catch (err: any) {
      console.error("Fetch leave types failed:", err)
      toast({ title: "Error", description: "Failed to fetch leave balances.", variant: "destructive" })
      setLeaveTypes([])
    } finally {
      setLoadingLeaves(false)
    }
  }
useEffect(() => {
  fetchLeaveTypes()
}, []) // only once on mount

  const getLeaveTextClass = (name: string) => {
  if (name.includes("Casual")) return "text-yellow-600 bg-yellow-100"
  if (name.includes("Sick")) return "text-red-600 bg-red-100"
  if (name.includes("Leave Without Pay")) return "text-orange-600 bg-orange-100"
  if (name.includes("Work From Home")) return "text-blue-600 bg-blue-100"
  if (name.includes("Comp-Off")) return "text-green-600 bg-green-100"
  return "text-gray-900 dark:text-white"
}

const getLeavePillClass = (name: string) => {
  if (name.includes("Casual")) return "bg-yellow-50 text-yellow-700"
  if (name.includes("Sick")) return "bg-red-50 text-red-700"
  if (name.includes("Leave Without Pay")) return "bg-orange-50 text-orange-700"
  if (name.includes("Work From Home")) return "bg-blue-50 text-blue-700"
  if (name.includes("Comp-Off")) return "bg-green-50 text-green-700"
  return "bg-gray-50 text-gray-800"
}


  const selectedTextClass = leaveType ? getLeaveTextClass(leaveType) : "text-gray-900 dark:text-white"
  

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

  // 🔹 Converts frontend leave type name to backend leaveTypeID
  const mapLeaveTypeToId = (leaveType: string): number => {
    const map: Record<string, number> = {
      "Casual Leave": 1,
      "Sick Leave": 2,
      "Leave Without Pay": 3,
      "Work From Home": 4,
      "Comp-Off": 5,
    }

    return map[leaveType] || 0
  }


    const handleSubmit = async () => {
  if (!leaveType || !startDate || !endDate || !reason || leaveDayDetails.length === 0) {
  setNotification({
    message: "Please fill all required fields, including reason.",
    type: "error",
  });
  return;
}



  // Helper: format Date to YYYY-MM-DD (local date, no timezone)
  const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedLeaveType = leaveTypes.find((t) => t.leaveName === leaveType);
  if (!selectedLeaveType) {
    setNotification({
      message: "Please select a valid leave type.",
      type: "error",
    });
    return;
  }

  const payload = {
    requestID: defaultValues?.requestID || 0,
    userID: 123, // Replace with actual logged-in user ID
    leaveTypeID: selectedLeaveType.leaveTypeId,
    leaveStartDate: formatDateToYMD(startDate), // ✅ local date only
    leaveEndDate: formatDateToYMD(endDate),     // ✅ local date only
    reason,
    comments: undefined,
    cancelledByUserID: 0,
    cancelledOn: null,
    cancelReason: null,
    modUserId: 123,
    leaveDayDetails: leaveDayDetails.map((d) => ({
      leaveDate: d.date, // Already in YYYY-MM-DD from your state
      dayType: d.type,
    })),
  };

  try {
    setLoading(true);
    const res = await fetch(
      "https://localhost:7080/api/Leave/InsertOrUpdateLeaveRequest",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.status === -1) {
      const errorMsg = data?.message || data?.error || "Something went wrong while submitting your leave request.";
      setPopupMessage(errorMsg);
      setIsErrorPopup(true);
      setSuccessOpen(true);
      return;
    }

    setPopupMessage(data?.message || "Leave Request submitted successfully.");
    setIsErrorPopup(false);
    setSuccessOpen(true);

    if (onSubmitSuccess) {
  onSubmitSuccess(); // parent can close modal & refresh leave history
}

    // Re-fetch leave balances
    fetchLeaveTypes(true);

    // Reset form
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    setLeaveDayDetails([]);
  } catch (error: any) {
    console.error("Error submitting leave request:", error);
    setPopupMessage(error.message || "Failed to submit leave request.");
    setIsErrorPopup(true);
    setSuccessOpen(true);
  } finally {
    setLoading(false);
  }
};



  const handleCancel = () => {
    setLeaveType("")
    setStartDate(undefined)
    setEndDate(undefined)
    setReason("")
    setLeaveDayDetails([])
    toast({
      title: "Cancelled",
      description: "Leave request form cleared.",
      duration: 2000,
    })
  }


  // Disable all past dates
const disablePastDates = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today // disables any date before today
}

// Combined function to disable weekends and past dates
const disableInvalidDates = (date: Date) => disableWeekends(date) || disablePastDates(date)

  return (
    <>
      <div className="space-y-6 px-3 sm:px-6">
        {notification && (
  <div
    className={`
      px-4 py-3 rounded-md mb-4 text-sm font-medium flex items-center justify-between
      ${notification.type === "error" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" : ""}
      ${notification.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : ""}
      ${notification.type === "info" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : ""}
    `}
  >
    <span>{notification.message}</span>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setNotification(null)}
      className="ml-2 p-0"
    >
      ✕
    </Button>
  </div>
)}

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          </h2>


          <div className="space-y-4">
            {/* Leave Type Dropdown */}
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
                  {leaveTypes.map((type : LeaveType) => (
                    <SelectItem
                      key={type.leaveTypeId}
                      value={type.leaveName}
                      className={cn(
                        "flex items-center justify-between px-2 py-2 rounded-md cursor-pointer gap-2",
                        getLeavePillClass(type.leaveName) || "bg-gray-50 text-gray-800",
                      )}
                    >
                      <span>{type.leaveName}</span>
                      <span className="ml-2 text-xs font-semibold rounded-full bg-white/40 px-2 py-0.5">
                        {type.remainingLeaves === null ? "" : `${type.remainingLeaves} left`}
                      </span>
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
            <Popover open={isStartPickerOpen} onOpenChange={setIsStartPickerOpen}>
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
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-auto p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-in fade-in-80">
                  
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (!date) return
                        setStartDate(date)
                        setIsStartPickerOpen(false) // ✅ closes the popover
                        if (endDate && date > endDate) {
                          setEndDate(undefined)
                          setNotification({
                            message: "End date has been cleared because it cannot be before start date.",
                            type: "error",
                          });
                        }
                      }}
                      disabled={disableInvalidDates}
                      className={cn(
                        "rounded-xl text-sm font-medium shadow-inner bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3",
                        "[&_.rdp-head_cell]:text-gray-500 dark:[&_.rdp-head_cell]:text-gray-400",
                        "[&_.rdp-day]:h-9 [&_.rdp-day]:w-9 [&_.rdp-day]:rounded-full [&_.rdp-day]:transition-all [&_.rdp-day]:duration-150",
                        "[&_.rdp-day:hover]:bg-gray-200 dark:[&_.rdp-day:hover]:bg-gray-700",
                        "[&_.rdp-day_selected]:bg-green-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-green-700",
                        "[&_.rdp-day_today]:border [&_.rdp-day_today]:border-green-600 [&_.rdp-day_today]:font-bold",
                        "[&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:opacity-40 [&_.rdp-day_disabled]:line-through"
                      )}
                      initialFocus
                    />
                </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full">
              End Date
            </Label>
            <Popover open={isEndPickerOpen} onOpenChange={setIsEndPickerOpen}>
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
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-in fade-in-80">
                  
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (!date) return;

                        if (startDate && date < startDate) {
                          setNotification({ message: "End date cannot be before start date.", type: "error" });
                          return; // don't set invalid end date
                        }

                        setEndDate(date);
                        setIsEndPickerOpen(false) // ✅ closes the popover
                      }}
                    disabled={disableInvalidDates}
                    className={cn(
                      "rounded-xl text-sm font-medium shadow-inner bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3",
                      "[&_.rdp-head_cell]:text-gray-500 dark:[&_.rdp-head_cell]:text-gray-400",
                      "[&_.rdp-day]:h-9 [&_.rdp-day]:w-9 [&_.rdp-day]:rounded-full [&_.rdp-day]:transition-all [&_.rdp-day]:duration-150",
                      "[&_.rdp-day:hover]:bg-gray-200 dark:[&_.rdp-day:hover]:bg-gray-700",
                      "[&_.rdp-day_selected]:bg-green-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-green-700",
                      "[&_.rdp-day_today]:border [&_.rdp-day_today]:border-green-600 [&_.rdp-day_today]:font-bold",
                      "[&_.rdp-day_disabled]:text-gray-400 [&_.rdp-day_disabled]:opacity-40 [&_.rdp-day_disabled]:line-through"
                    )}
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
            Reason*
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
              <DialogTitle
                className={`text-lg font-semibold ${
                  isErrorPopup ? "text-red-600" : "text-green-600"
                }`}
              >
                {isErrorPopup ? "Leave Submission Failed" : "Leave Request Submitted Successfully"}
              </DialogTitle>
            </DialogHeader>

            <div className="text-gray-700 dark:text-gray-300 mt-3 text-sm">
              {popupMessage}
            </div>

            <DialogFooter>
              <Button
                onClick={() => setSuccessOpen(false)}
                className={
                  isErrorPopup
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
    {/* Full-Screen Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center gap-3 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Submitting your leave request...
            </p>
          </div>
        </div>
      )}

      {/* Full-Screen Page Loader for fetching leave types */}
    {loadingLeaves && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center gap-3 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Loading leave balances...
          </p>
        </div>
      </div>
    )}
    </>
  )
}
