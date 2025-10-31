// =================================================================== responsive ======================================================================================

"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import { Clock, Calendar, Plus, Edit, Trash2, Info, ChevronDown, Send, X,MessageSquare } from "lucide-react"
import { BulkEntryModal } from "./bulk-entry-modal"
import { WeekSelector } from "./week-selector"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { CommentsModalEmp } from "../../modals/comments-emp"
import { toast } from "../../hooks/use-toast"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card"

interface TimesheetEntry {
  lineID: number
  id: string
  engagement: string
  task: string
  hours: number
  minutes: number
  comments: string
  date: string
}

interface TimesheetPageProps {
  isDarkMode: boolean
}

export function TimesheetPage() {
  const [showNag1, setShowNag1] = useState(true)
  const [showNag2, setShowNag2] = useState(true)
  const [showPopup, setShowPopup] = useState(false)

  const [currentWeek, setCurrentWeek] = useState("")
  const [selectedDate, setSelectedDate] = useState("Monday, August 18")
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false)
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [weekDays, setWeekDays] = useState([
    { day: "Mon", date: "18", full: "Monday, August 18", status: "filled", isWeekend: false, iso: "" },
    { day: "Tue", date: "19", full: "Tuesday, August 19", status: "filled", isWeekend: false, iso: "" },
    { day: "Wed", date: "20", full: "Wednesday, August 20", status: "filled", isWeekend: false, iso: "" },
    { day: "Thu", date: "21", full: "Thursday, August 21", status: "filled", isWeekend: false, iso: "" },
    { day: "Fri", date: "22", full: "Friday, August 22", status: "filled", isWeekend: false, iso: "" },
    { day: "Sat", date: "23", full: "Saturday, August 23", status: "optional", isWeekend: true, iso: "" },
    { day: "Sun", date: "24", full: "Sunday, August 24", status: "optional", isWeekend: true, iso: "" },
  ])

  const [newEntry, setNewEntry] = useState({
    engagement: "",
    task: "",
    hours: 0,
    minutes: 0,
    comments: "",
  })
  const [editEntryDraft, setEditEntryDraft] = useState({
       engagement: "",
       task: "",
      hours: 0,
       minutes: 0,
       comments: "",
     })

  const [engagementOptions, setEngagementOptions] = useState<{ engagementID: number; title: string }[]>([])
  const [taskOptions, setTaskOptions] = useState<{ taskID: number; taskName: string }[]>([])

  const [timesheetId, setTimesheetId] = useState<number | null>(null)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [submitComment, setSubmitComment] = useState("")
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [warnMessage, setWarnMessage] = useState<string>("")
  const [showWarnToast, setShowWarnToast] = useState(false)
  const [originalEntry, setOriginalEntry] = useState<TimesheetEntry | null>(null)
  const [isViewingSpecificWeek, setIsViewingSpecificWeek] = useState(false)
  const [selectedWeekTimesheetId, setSelectedWeekTimesheetId] = useState<number | null>(null)
  const [timesheetStatus, setTimesheetStatus] = useState<number | null>(null) // 1-Pending,2-Submitted,3-Approved,4-Rejected
  const [isSaving, setIsSaving] = useState(false) // Prevent multiple save operations
  const [isCommentsDisabled, setIsCommentsDisabled] = useState(false)

  // Comments modal state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentsData, setCommentsData] = useState<any[]>([])

  // V1 meta: current week range and rejected summary
  const [v1CurrentStartISO, setV1CurrentStartISO] = useState<string | null>(null)
  const [v1CurrentEndISO, setV1CurrentEndISO] = useState<string | null>(null)
  const [rejectedCount, setRejectedCount] = useState<number>(0)
  const [rejectedRanges, setRejectedRanges] = useState<{ timesheetID: number; startDate: string; endDate: string }[]>([])

  const handleNotify = () => {
    setShowPopup(true)
    setTimeout(() => {
      setShowPopup(false)
    }, 3000) // hides after 3 seconds
  }

  // Entries loaded for the selected week
  const [entries, setEntries] = useState<TimesheetEntry[]>([])

  // Helper function to get current week's date range
  const getCurrentWeekDates = () => {
    return weekDays.map((day) => day.full)
  }

  // Filter entries for current week only
  const getCurrentWeekEntries = () => {
    const currentWeekDates = getCurrentWeekDates()
    return entries.filter((entry) => currentWeekDates.includes(entry.date))
  }

  const currentDayEntries = getCurrentWeekEntries().filter((entry) => entry.date === selectedDate)
  const totalHours = currentDayEntries.reduce((sum, entry) => sum + entry.hours + entry.minutes / 60, 0)

  // Calculate total week hours for CURRENT WEEK ONLY
  const weekTotalHours = getCurrentWeekEntries().reduce((sum, entry) => sum + entry.hours + entry.minutes / 60, 0)
  
  // Format weekly hours as hours and minutes
  const formatWeeklyHours = (totalHours: number) => {
    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours - hours) * 60)
    return `${hours}h ${minutes}m`
  }

  // Get day hours for each day
  const getDayHours = (dayFull: string) => {
    const dayEntries = getCurrentWeekEntries().filter((entry) => entry.date === dayFull)
    return dayEntries.reduce((sum, entry) => sum + entry.hours + entry.minutes / 60, 0)
  }

  const getDayTotalsMinutes = (dayFull: string) => {
    const dayEntries = getCurrentWeekEntries().filter((entry) => entry.date === dayFull)
    return dayEntries.reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0)
  }

  const getWeekTotalsMinutes = () => {
    return getCurrentWeekEntries().reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0)
  }

  // Check if weekends should be enabled (all weekdays filled with 8h each)
  const weekdaysFilled = weekDays
    .filter((day) => !day.isWeekend)
    .every((day) => {
      return getDayHours(day.full) >= 8
    })

  // Today's date for comparison
  const today = new Date()

  const updateWeekDays = (weekString: string) => {
    // Parse week string like "Jul 28 - Aug 03, 2025" (start is Monday)
    const [range, yearStr] = weekString.split(", ")
    const [startStr] = range.split(" - ")
    const [month, day] = startStr.split(" ")

    const monthMap: { [key: string]: number } = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    }

    const year = Number.parseInt(yearStr)
    const monday = new Date(year, monthMap[month], Number.parseInt(day))

    const newWeekDays = [] as any[]
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const toISODate = (date: Date) => {
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, "0")
      const d = date.getDate().toString().padStart(2, "0")
      return `${y}-${m}-${d}`
    }

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday)
      currentDate.setDate(monday.getDate() + i)

      const isWeekend = i >= 5
      const isPastOrToday = currentDate <= today

      newWeekDays.push({
        day: dayNames[i],
        date: currentDate.getDate().toString().padStart(2, "0"),
        full: `${fullDayNames[i]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`,
        status: isPastOrToday ? (isWeekend ? "optional" : "filled") : "future",
        isWeekend,
        iso: toISODate(currentDate),
      })
    }

    setWeekDays(newWeekDays)
    setSelectedDate(newWeekDays[0].full)
  }

  useEffect(() => {
    if (!currentWeek) return
    updateWeekDays(currentWeek)
  }, [currentWeek])

  // Util: build ISO yyyy-MM-dd
  const toISODate = (date: Date) => {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, "0")
    const d = date.getDate().toString().padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // Load week entries from backend
  const loadWeekEntries = async (monday: Date) => {
    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)

    try {
      const res = await fetch(`https://localhost:7080/api/timesheet/GetTSbyWeek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userID: 0, // server reads from session
          startDate: toISODate(monday),
          endDate: toISODate(friday),
        }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data: any[] = await res.json()

      // Set the timesheet ID and status for the selected week (use first entry if available)
      if (data.length > 0) {
        const firstEntry = data[0]
        const weekTimesheetId = firstEntry.timesheetID ?? firstEntry.TimesheetID
        if (weekTimesheetId) {
          setSelectedWeekTimesheetId(weekTimesheetId)
          setTimesheetId(weekTimesheetId) // Use this ID for operations on this week
        }
        const statusVal = firstEntry.status ?? firstEntry.Status ?? null
        setTimesheetStatus(typeof statusVal === "number" ? statusVal : null)
       } else {
         // No entries found - check if this is the current week
         // If it's the current week, it should be "Pending" status
         // If it's a past week with no entries, it could be "Draft" or "Pending"
         setTimesheetStatus(null) // This will show as "Pending" in the badge
         setTimesheetId(null)
         setSelectedWeekTimesheetId(null)
       }
      
      // Check if this is the current week and update v1 metadata if needed
      // This ensures the "Go to current TS" button works correctly
      if (v1CurrentStartISO && v1CurrentEndISO) {
        const mondayISO = toISODate(monday)
        const fridayISO = toISODate(friday)
        if (mondayISO === v1CurrentStartISO && fridayISO === v1CurrentEndISO) {
          // This is the current week, ensure we have the correct metadata
          // The v1 metadata should already be set, but we can verify it here
        }
      }

      const mapped: TimesheetEntry[] = data.map((d) => {
        const dateObj = new Date(d.date)
        const weekday = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][dateObj.getDay()]
        const monthName = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][dateObj.getMonth()]
        const label = `${weekday}, ${monthName} ${dateObj.getDate()}`
        return {
          lineID: d.lineID ?? d.LineID ?? 0,
          id: String(d.lineID ?? d.LineID ?? `${d.engagementID}-${d.taskID}-${d.date}`),
          engagement: d.engagementName ?? d.EngagementName ?? "",
          task: d.taskName ?? d.TaskName ?? "",
          hours: d.hours ?? d.Hours ?? 0,
          minutes: d.minutes ?? d.Minutes ?? 0,
          comments: d.comment ?? d.Comment ?? "",
          date: label,
        }
      })
      setEntries(mapped)
      setIsViewingSpecificWeek(true)
    } catch (e) {
      console.error("Failed to load week entries", e)
      setEntries([])
    }
  }

  // Reload data based on current viewing state
  const reloadCurrentData = async () => {
    if (isViewingSpecificWeek) {
      // If viewing a specific week, reload that week's data
      try {
        const [range, yearStr] = currentWeek.split(", ")
        const [startStr] = range.split(" - ")
        const [monAbbr, dayStr] = startStr.split(" ")
        const mm: { [k: string]: number } = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
        const monday = new Date(Number.parseInt(yearStr), mm[monAbbr], Number.parseInt(dayStr))
        await loadWeekEntries(monday)
      } catch (e) {
        console.error("Failed to reload specific week", e)
        await loadCurrentTimesheet()
      }
    } else {
      // If viewing current timesheet, reload that
      await loadCurrentTimesheet()
    }
  }

  // Load current timesheet data and set week label + timesheet ID
  const loadCurrentTimesheet = async () => {
    try {
      const res = await fetch(`https://localhost:7080/api/timesheet/v1`, { credentials: "include" })
      console.log("timehseett",res)
      if (!res.ok) throw new Error(`${res.status}`)
      const payload = await res.json()
      const data = payload?.data
      console.log("data : ",data)
      const lines: any[] = data?.timesheetLines || []

      // set v1 meta for current and rejected summary
      if (data?.currentWeekStartDate && data?.currentWeekEndDate) {
        const start = new Date(data.currentWeekStartDate)
        const end = new Date(data.currentWeekEndDate)
        const toISO = (d: Date) => `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
        setV1CurrentStartISO(toISO(start))
        setV1CurrentEndISO(toISO(end))
      }
      setRejectedCount(data?.totalRejectedCount ?? 0)
      setRejectedRanges(Array.isArray(data?.rejectedTimesheetRanges) ? data.rejectedTimesheetRanges : [])
      
      if (data?.startDate && data?.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        const monthsAbbr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        const wk = `${monthsAbbr[start.getMonth()]} ${start.getDate().toString().padStart(2,'0')} - ${monthsAbbr[end.getMonth()]} ${end.getDate().toString().padStart(2,'0')}, ${start.getFullYear()}`
        setCurrentWeek(wk)
        updateWeekDays(wk)
      }
      
      if (data?.timesheetID) setTimesheetId(data.timesheetID)
      // Use status from v1 payload (may be rejected or current pending)
      if (typeof data?.status === 'number') setTimesheetStatus(data.status)
      setIsViewingSpecificWeek(false) // Reset to viewing current timesheet
      
      const mapped: TimesheetEntry[] = lines.map((d) => {
        const dateObj = new Date(d.date)
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObj.getDay()]
        const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"][dateObj.getMonth()]
        const label = `${weekday}, ${monthName} ${dateObj.getDate()}`
        return {
          lineID: d.lineID ?? d.LineID ?? 0,
          id: String(d.lineID ?? d.LineID ?? `${d.engagementID}-${d.taskID}-${d.date}`),
          engagement: d.engagementName ?? d.EngagementName ?? "",
          task: d.taskName ?? d.TaskName ?? "",
          hours: d.hours ?? d.Hours ?? 0,
          minutes: d.minutes ?? d.Minutes ?? 0,
          comments: d.comment ?? d.Comment ?? "",
          date: label,
        }
      })
      setEntries(mapped)
    } catch (e) {
      console.error("Failed to load current timesheet", e)
      setEntries([])
    }
  }

  const handleSaveEntry = async () => {
    if (isSaving) return // Prevent multiple saves
    if (newEntry.minutes % 5 !== 0) {
      setWarnMessage("Minutes must be in multiples of 5 (0,5,10,...,55)")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return
    }
    if (newEntry.hours > 12 || (newEntry.hours === 12 && newEntry.minutes > 0)) {
      setWarnMessage("Time cannot exceed 12 hours")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return
    }
    
    // Check daily total hours
    const existingMinutes = getDayTotalsMinutes(selectedDate)
    const newEntryMinutes = (newEntry.hours * 60) + newEntry.minutes
    const dayTotalMinutes = existingMinutes + newEntryMinutes
    const dayTotalHours = Math.floor(dayTotalMinutes / 60)
    const dayTotalMinutesRemainder = dayTotalMinutes % 60
    
    if (dayTotalHours > 12 || (dayTotalHours === 12 && dayTotalMinutesRemainder > 0)) {
      setWarnMessage("Daily total hours cannot exceed 12 hours")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return
    }
    const pickedEng = engagementOptions.find(e => e.title === newEntry.engagement)
    const pickedTask = taskOptions.find(t => t.taskName === newEntry.task)
    const day = weekDays.find(d => d.full === selectedDate)
    if (!pickedEng || !pickedTask || !day) return

    // Compute totals including this new entry
    const baseMinutes = getDayTotalsMinutes(selectedDate)
    const newMinutes = (newEntry.hours * 60) + newEntry.minutes
    const dayTotal = baseMinutes + newMinutes
    const totalDayHours = Math.floor(dayTotal / 60)
    const totalDayMinutes = dayTotal % 60

    setIsSaving(true)
    try {
      const res = await fetch(`https://localhost:7080/api/timesheet/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lineID: null,
          timesheetID: timesheetId ?? 0,
          engagementID: pickedEng.engagementID,
          taskID: pickedTask.taskID,
          hours: newEntry.hours,
          minutes: newEntry.minutes,
          date: `${day.iso}T00:00:00`,
          comment: newEntry.comments,
          totalDayHours,
          totalDayMinutes,
          modUser: 0,
        })
      })
      console.log("res data:",res)

      if (!res.ok) throw new Error(`${res.status}`)
        // Reload data from backend to get the actual lineID
      await reloadCurrentData()
      // Only reload current timesheet if not viewing a specific week
      if (!isViewingSpecificWeek) {
        await loadCurrentTimesheet()
      }
      //    // Get the saved entry data from response
      // const savedData = await res.json()
      // console.log("Saved entry data:", savedData)
      
      // // Extract lineID from response (adjust property name based on your API response)
      // const returnedLineID = savedData.lineID ?? savedData.LineID ?? savedData.data?.lineID ?? savedData.data?.LineID
      // // optimistic update
      // const entry: TimesheetEntry = {
      //   lineID: returnedLineID,
      //   ...newEntry,
      //   id: String(returnedLineID || Date.now()),
      //   date: selectedDate,
      // }
      // setEntries([...entries, entry])
      setNewEntry({ engagement: "", task: "", hours: 0, minutes: 0, comments: "" })
      setIsAddingEntry(false)
    } catch (e) {
      console.error("Failed to save entry", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddEntry = () => {
    if (editingEntry) { 
      setWarnMessage("Add/Edit cannot be done at the same time")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return 
    }
    if (newEntry.engagement && newEntry.task) {
      handleSaveEntry()
    }
  }

  // Load engagements for add or inline edit based on the row/day being edited/added
  useEffect(() => {
    if (!isAddingEntry && !editingEntry) return
    // Determine the date context: when editing, use that entry's date; otherwise use selectedDate
    const targetDateLabel = editingEntry
      ? (entries.find(e => e.id === editingEntry)?.date ?? selectedDate)
      : selectedDate
    const day = weekDays.find((d) => d.full === targetDateLabel)
    if (!day) return
    const iso = day.iso

    fetch(`https://localhost:7080/api/Engagement/GetEngagementsByUserAndDate/${iso}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((list: any[]) => {
        setEngagementOptions(list.map(x => ({ engagementID: x.engagementID, title: x.title ?? String(x.engagementID) })))
      })
      .catch(() => setEngagementOptions([]))
  }, [isAddingEntry, editingEntry])

 // When an engagement is picked (for add OR edit), load its tasks
  useEffect(() => {
      const selectedEngagementTitle = editingEntry ? editEntryDraft.engagement : newEntry.engagement
      const picked = engagementOptions.find(e => e.title === selectedEngagementTitle)
      if (!picked) { setTaskOptions([]); return }
      fetch(`https://localhost:7080/api/Engagement/${picked.engagementID}`, { credentials: "include" })
       .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then((list: any[]) => setTaskOptions(list.map(t => ({ taskID: t.taskID, taskName: t.taskName ?? String(t.taskID) }))))
        .catch(() => setTaskOptions([]))
    }, [newEntry.engagement, editEntryDraft.engagement, editingEntry])

    const handleEditEntry = (entry: TimesheetEntry) => {
          if (isAddingEntry) { 
            setWarnMessage("Add/Edit cannot be done at the same time")
            setShowWarnToast(true)
            setTimeout(()=>setShowWarnToast(false),3000)
            return 
          }
          setEditEntryDraft({
            engagement: entry.engagement,
            task: entry.task,
            hours: entry.hours,
            minutes: entry.minutes,
            comments: entry.comments,
          })
    setEditingEntry(entry.id)
    setOriginalEntry(entry)
    // Do not open the top add row; we will inline-edit the selected row
  }

  const handleUpdateEntry = async () => {
    if (isSaving) return // Prevent multiple saves
    if (!editingEntry || !editEntryDraft.engagement || !editEntryDraft.task) return
    if (editEntryDraft.minutes % 5 !== 0) {
      setWarnMessage("Minutes must be in multiples of 5 (0,5,10,...,55)")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return
    }
    if (editEntryDraft.hours > 12 || (editEntryDraft.hours === 12 && editEntryDraft.minutes > 0)) {
      setWarnMessage("Time cannot exceed 12 hours")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return
    }

    // Find the current entry from the entries array to get the most up-to-date lineID
    const currentEntry = entries.find(e => e.id === editingEntry)
    if (!currentEntry) return

    // Check daily total hours
    const existingMinutes = getDayTotalsMinutes(currentEntry.date) - (currentEntry.hours * 60 + currentEntry.minutes)
    const newEntryMinutes = (editEntryDraft.hours * 60) + editEntryDraft.minutes
    const dayTotalMinutes = existingMinutes + newEntryMinutes
    const dayTotalHours = Math.floor(dayTotalMinutes / 60)
    const dayTotalMinutesRemainder = dayTotalMinutes % 60
    
    if (dayTotalHours > 12 || (dayTotalHours === 12 && dayTotalMinutesRemainder > 0)) {
      setWarnMessage("Daily total hours cannot exceed 12 hours")
      setShowWarnToast(true)
      setTimeout(()=>setShowWarnToast(false),3000)
      return
    }

    const pickedEng = engagementOptions.find(e => e.title === editEntryDraft.engagement)
    const pickedTask = taskOptions.find(t => t.taskName === editEntryDraft.task)
    const day = weekDays.find(d => d.full === currentEntry.date)
    if (!pickedEng || !pickedTask || !day) return

    // Compute totals including this updated entry
    const baseMinutes = getDayTotalsMinutes(currentEntry.date) - (currentEntry.hours * 60 + currentEntry.minutes)
    const newMinutes = (editEntryDraft.hours * 60) + editEntryDraft.minutes
    const dayTotal = baseMinutes + newMinutes
    const totalDayHours = Math.floor(dayTotal / 60)
    const totalDayMinutes = dayTotal % 60

    setIsSaving(true)
    try {
      const res = await fetch(`https://localhost:7080/api/timesheet/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lineID: currentEntry.lineID,// Use the current entry's lineID for updates
          timesheetID: timesheetId ?? 0,
          engagementID: pickedEng.engagementID,
          taskID: pickedTask.taskID,
          hours: editEntryDraft.hours,
          minutes: editEntryDraft.minutes,
          date: `${day.iso}T00:00:00`,
          comment: editEntryDraft.comments,
          totalDayHours,
          totalDayMinutes,
          modUser: 0,
        })
      })

      if (!res.ok) throw new Error(`${res.status}`)
      
      // Reload current data to get updated data
      await reloadCurrentData()
      // Only reload current timesheet if not viewing a specific week
      if (!isViewingSpecificWeek) {
        await loadCurrentTimesheet()
      }
      setEditEntryDraft({ engagement: "", task: "", hours: 0, minutes: 0, comments: "" })
      setEditingEntry(null)
      setOriginalEntry(null)
      // Do not touch add row state when finishing edit
    } catch (e) {
      console.error("Failed to update entry", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`https://localhost:7080/api/timesheet/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      if (!res.ok) throw new Error(`${res.status}`)
      
      // Reload current data to get updated data
      await reloadCurrentData()
    } catch (e) {
      console.error("Failed to delete entry", e)
    }
  }

  const canFillDay = (day: any) => {
    if (day.status === "future") return false
    if (day.isWeekend) {
      // Weekends are selectable if weekdays are complete OR if there are already entries on that weekend day
      return weekdaysFilled || getDayHours(day.full) > 0
    }
    return true
  }

  const getDayStatus = (day: any) => {
    const dayHours = getDayHours(day.full)
    if (day.isWeekend && dayHours === 0) return null
    return dayHours >= 8 ? "complete" : "incomplete"
  }

  const getDayColor = (day: any) => {
    if (selectedDate === day.full) return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"

    const dayHours = getDayHours(day.full)
    if (!day.isWeekend && dayHours >= 8)
      return "bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40"
    // Weekend: green if any entries present
    if (day.isWeekend && dayHours > 0)
      return "bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40"
    if (day.status === "future")
      return "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
    if (day.isWeekend)
      return "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"

    return "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
  }


  const handleSubmitTimesheet = () => {
    // Validate min daily hours Mon-Fri
    const anyWeekdayUnderMin = weekDays
      .filter((d) => !d.isWeekend)
      .some((d) => getDayHours(d.full) < 8)
    if (anyWeekdayUnderMin) {
      setWarnMessage("Please fill min daily hours.")
      setShowWarnToast(true)
      setTimeout(() => setShowWarnToast(false), 3000)
      return
    }
    setIsSubmitOpen(true)
  }

  const doSubmitTimesheet = async () => {
    try {
      const totalWeekMin = getWeekTotalsMinutes()
      const hoursTotal = Math.floor(totalWeekMin / 60)
      const minutesTotal = totalWeekMin % 60
      const res = await fetch(`https://localhost:7080/api/timesheet/Submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          timesheetID: timesheetId ?? 0,
          userID: 0,
          hoursTotal,
          minutesTotal,
          submissionComment: submitComment,
        })
      })
      if (!res.ok) throw new Error(`${res.status}`)
      
      setIsSubmitOpen(false)
      setSubmitComment("")
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)

      // After submission, automatically load the next/current timesheet (pending) using v1 meta and GetTSbyWeek
      await new Promise(r => setTimeout(r, 800))
      try {
        const v1Res = await fetch(`https://localhost:7080/api/timesheet/v1`, { credentials: "include" })
        if (v1Res.ok) {
          const p = await v1Res.json()
          const d = p?.data
          if (d?.currentWeekStartDate && d?.currentWeekEndDate) {
            const monday = new Date(d.currentWeekStartDate)
            const friday = new Date(d.currentWeekEndDate)
            await loadWeekEntries(monday)
            const monthsAbbr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            const wk = `${monthsAbbr[monday.getMonth()]} ${monday.getDate().toString().padStart(2,'0')} - ${monthsAbbr[friday.getMonth()]} ${friday.getDate().toString().padStart(2,'0')}, ${monday.getFullYear()}`
            setCurrentWeek(wk)
            updateWeekDays(wk)
            setIsViewingSpecificWeek(true)
          } else {
            // fallback to reload current timesheet
            setIsViewingSpecificWeek(false)
            await loadCurrentTimesheet()
          }
        } else {
          setIsViewingSpecificWeek(false)
          await loadCurrentTimesheet()
        }
      } catch {
        setIsViewingSpecificWeek(false)
        await loadCurrentTimesheet()
      }
      // Reload rejected count after submission
      await loadCurrentTimesheet()
      //await reloadCurrentData()
      // Removed--- Follow Ajax pattern: Get dropdown list first by ddr
    } catch (e) {
      console.error("Failed to submit timesheet", e)
    }
  }

  const handleBulkSubmit = (bulkEntries: any[], selectedDays: string[]) => {
    // Add bulk entries to the timesheet
    const newEntries: TimesheetEntry[] = []

    selectedDays.forEach((dayKey) => {
      const dayData = weekDays.find((d) => d.day === dayKey)
      if (dayData) {
        bulkEntries.forEach((bulkEntry) => {
          newEntries.push({
            lineID: 0,
            id: `${Date.now()}-${Math.random()}`,
            engagement: bulkEntry.engagement,
            task: bulkEntry.task,
            hours: bulkEntry.hours,
            minutes: bulkEntry.minutes,
            comments: bulkEntry.comments,
            date: dayData.full,
          })
        })
      }
    })

    setEntries([...entries, ...newEntries])
  }

  // Initial load: fetch current timesheet data
  useEffect(() => {
    loadCurrentTimesheet()
  }, [])

  return (
    <div className={`p-3 sm:p-6 space-y-4 sm:space-y-6 text-gray-900 bg-gray-50`}>


      {/* Nags Section */}
      <div className="space-y-2">
        {showNag1 && rejectedCount > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-red-100 border border-red-300 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-700 gap-2">
            <div className="text-sm text-red-800 dark:text-red-300 pr-2">
              {rejectedCount > 0 ? (
                <span>
                  You have {rejectedCount} rejected timesheets:
                  {rejectedRanges.map((r, idx) => {
                    const s = new Date(r.startDate)
                    const e = new Date(r.endDate)
                    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                    const label = `${months[s.getMonth()]} '${String(s.getFullYear()).slice(-2)} (${s.getDate()}-${e.getDate()})`
                    return (
                      <button
                        key={r.timesheetID}
                        className="underline text-blue-700 hover:text-blue-900 ml-1"
                        onClick={async () => {
                          try {
                            const monday = new Date(r.startDate)
                            const friday = new Date(r.endDate)
                            await loadWeekEntries(monday)
                            const monthsAbbr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                            const wk = `${monthsAbbr[monday.getMonth()]} ${monday.getDate().toString().padStart(2,'0')} - ${monthsAbbr[friday.getMonth()]} ${friday.getDate().toString().padStart(2,'0')}, ${monday.getFullYear()}`
                            setCurrentWeek(wk)
                            updateWeekDays(wk)
                          } catch {}
                        }}
                      >
                        {label}{idx < rejectedRanges.length - 1 ? ',' : ''}
                      </button>
                    )
                  })}
                </span>
              ) : (
                <span>No rejected timesheets.</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <X
                className="h-4 w-4 cursor-pointer text-gray-500 dark:text-gray-400"
                onClick={() => setShowNag1(false)}
              />
            </div>
          </div>
        )}

        {showNag2 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-yellow-100 border border-yellow-300 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-700 gap-2">
            <span className="text-sm text-yellow-800 dark:text-yellow-300 pr-2">
              Notify Manger For Pending Timesheet Approval Feature. Coming Soon........
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                //onClick={handleNotify}
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-transparent text-xs sm:text-sm"
              >
                Notify
              </Button>
              <X
                className="h-4 w-4 cursor-pointer text-gray-500 dark:text-gray-400"
                onClick={() => setShowNag2(false)}
              />
            </div>
          </div>
        )}

        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              backgroundColor: "#708090",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              zIndex: 1000,
              height: "50px",
              width: "240px",
              textAlign: "center",
            }}
          >
            Notified Successfully
          </div>
        )}
      </div>

      {/* Week Navigation */}
      <Card className={`bg-white border-gray-200`}>
        <CardContent className="p-3 sm:p-4">
          {/* Page Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className={`text-lg sm:text-xl font-semibold text-gray-800`}>Add/View Timesheet</h1>
          </div>

          {/* Timesheet Guidelines */}
          <Collapsible open={isGuidelinesOpen} onOpenChange={setIsGuidelinesOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
              >
                <Info className="w-4 h-4" />
                <span className="font-medium text-sm sm:text-base">Timesheet Guidelines</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isGuidelinesOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mb-4">
              <div
                className={`p-3 sm:p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800`}
              >
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <li>• Working days: Monday to Friday (5 days per week)</li>
                  <li>• Minimum working hours: 8 hours per day, 40 hours per week</li>
                  <li>• Saturday and Sunday are optional working days</li>
                  <li>• Weekend entries are only available after completing all weekday timesheets</li>
                  <li>• Fill previous week timesheets before accessing future weeks</li>
                  <li>• All entries must include engagement, task, and time details</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className={`text-sm font-medium text-gray-600`}>Week:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="font-medium bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 text-sm"
                  onClick={() => setIsWeekSelectorOpen(true)}
                >
                  {currentWeek}
                  <Calendar className="w-4 h-4 ml-2" />
                </Button>
                {/* Go To Current TS Button */}
                <Button 
                  variant="outline"
                  disabled={(() => {
                    if (!v1CurrentStartISO || !v1CurrentEndISO) return false
                    // Check if currentWeek label matches v1 current range
                    // We compare by computing the monday of currentWeekDays and last day (Fri)
                    try {
                      const [range, yearStr] = currentWeek.split(", ")
                      const [startStr, endStr] = range.split(" - ")
                      const monthsAbbr: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }
                      const parsePart = (p: string) => { const [m, d] = p.split(" "); return { m: monthsAbbr[m], d: parseInt(d,10) } }
                      const sPart = parsePart(startStr)
                      const yr = parseInt(yearStr,10)
                      const sDate = new Date(yr, sPart.m, sPart.d)
                      const toISO = (d: Date) => `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
                      const currentStartISO = toISO(sDate)
                      // Consider week the same if the Monday matches the v1 Monday (end may differ Fri vs Sun)
                      const isCurrentWeek = currentStartISO === v1CurrentStartISO
                      console.log('Go to Current TS disabled check:', {
                        currentWeek,
                        currentStartISO,
                        v1CurrentStartISO,
                        v1CurrentEndISO,
                        isCurrentWeek
                      })
                      return isCurrentWeek
                    } catch (e) { 
                      console.log('Error in disabled check:', e)
                      return false 
                    }
                  })()}
                  className="font-medium bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 text-sm"
                  onClick={async () => {
                    try {
                      if (!v1CurrentStartISO || !v1CurrentEndISO) return
                      const monday = new Date(v1CurrentStartISO)
                      const friday = new Date(v1CurrentEndISO)
                      // Use GetTSbyWeek as requested
                      await loadWeekEntries(monday)
                      const monthsAbbr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                      const wk = `${monthsAbbr[monday.getMonth()]} ${monday.getDate().toString().padStart(2,'0')} - ${monthsAbbr[friday.getMonth()]} ${friday.getDate().toString().padStart(2,'0')}, ${monday.getFullYear()}`
                      setCurrentWeek(wk)
                      updateWeekDays(wk)
                      setIsCommentsDisabled(true) // Disable comments when going to current TS
                    } catch (e) {
                      setWarnMessage("Failed to load current timesheet")
                      setShowWarnToast(true)
                      setTimeout(()=>setShowWarnToast(false),3000)
                    }
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Go To Current TS
                </Button>
                {/* Status Badge - Always show when status is available */}
                {timesheetStatus !== null && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      timesheetStatus === 4 
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
                        : timesheetStatus === 3
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                        : timesheetStatus === 2
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700"
                        : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {timesheetStatus === 4 ? "Rejected" : 
                     timesheetStatus === 3 ? "Approved" : 
                     timesheetStatus === 2 ? "Submitted" : "Pending"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className={"text-gray-600"}>Weekly Total: </span>
                <span className="font-semibold text-blue-600">{formatWeeklyHours(weekTotalHours)}</span>
                <span className={`ml-2 text-gray-500 hidden sm:inline`}>Target: 40h</span>
                <div className={`sm:hidden text-gray-500 text-xs`}>Target: 40h</div>
              </div>
            </div>
          </div>

          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((day) => (
              <button
                key={day.day}
                onClick={() => {
                  if (canFillDay(day)) {
                    setSelectedDate(day.full)
                  }
                }}
                className={`p-2 sm:p-3 rounded-lg text-center transition-colors relative ${getDayColor(day)}`}
                disabled={!canFillDay(day)}
              >
                <div className="text-xs font-medium">{day.day}</div>
                <div className="text-base sm:text-lg font-bold">{day.date}</div>
                {day.isWeekend && <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Optional</div>}
                {!day.isWeekend && <div className="text-xs mt-1 font-medium">{getDayHours(day.full).toFixed(1)}h</div>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      <Card className={`bg-white border-gray-200`}>
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <CardTitle className={`text-base sm:text-lg text-gray-900`}>{selectedDate}</CardTitle>
              <div className="flex items-center gap-2">
                {getDayStatus(weekDays.find((d) => d.full === selectedDate)) && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${getDayStatus(weekDays.find((d) => d.full === selectedDate)) === "complete"
                      ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                      : "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700"
                      }`}
                  >
                    {getDayStatus(weekDays.find((d) => d.full === selectedDate)) === "complete"
                      ? "Complete"
                      : "Incomplete"}
                  </Badge>
                )}
                <span className={`text-sm text-gray-600`}>
                  {totalHours.toFixed(1)}h
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsAddingEntry(true)}
                disabled={timesheetStatus === 2 || timesheetStatus === 3}
                className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(true)}
                disabled
                className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 text-sm opacity-50 cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Bulk Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {/* Timesheet Entries Table */}
          <div className="space-y-4">
            {/* Table Header - Now visible on mobile with horizontal scroll */}
            <div className="overflow-x-auto">
              <div
                className={`grid grid-cols-12 gap-2 text-sm font-medium border-b pb-2 min-w-[1000px] text-gray-600 border-gray-200`}
              >
                <div className="col-span-5">ENGAGEMENT</div>
                <div className="col-span-2">TASK</div>
                <div className="col-span-1">HOURS</div>
                <div className="col-span-1">MINUTES</div>
                <div className="col-span-2">COMMENTS</div>
                <div className="col-span-1">ACTIONS</div>
              </div>


              {/* Add Entry Form (top row) */}
              {isAddingEntry && (
                <div
                  className={`border-b rounded-lg p-3 border-gray-200 bg-blue-50 min-w-[1000px]`}
                >
                  {/* Desktop Grid Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-2 py-3">
                    <div className="col-span-5">
                      <Select
                        value={newEntry.engagement}
                        onValueChange={(value) => setNewEntry({ ...newEntry, engagement: value, task: "" })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                          <SelectValue placeholder="Select Engagement" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                          {engagementOptions.map((e) => (
                            <SelectItem
                              key={e.engagementID}
                              value={e.title}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {e.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Select value={newEntry.task} onValueChange={(value) => setNewEntry({ ...newEntry, task: value })}>
                        <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                          <SelectValue placeholder="Select Task" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                          {taskOptions.map((t) => (
                            <SelectItem key={t.taskID} value={t.taskName} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                              {t.taskName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="0"
                        max="12"
                        placeholder="0"
                        value={newEntry.hours === 0 ? "" : newEntry.hours}
                        onChange={(e) => setNewEntry({ ...newEntry, hours: Number.parseInt(e.target.value) || 0 })}
                        className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        step="5"
                        placeholder="0"
                        value={newEntry.minutes === 0 ? "" : newEntry.minutes}
                        onChange={(e) => setNewEntry({ ...newEntry, minutes: Number.parseInt(e.target.value) || 0 })}
                        className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <Textarea
                        placeholder="Add comments..."
                        value={newEntry.comments}
                        onChange={(e) => setNewEntry({ ...newEntry, comments: e.target.value })}
                        className="min-h-[40px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-1 flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddEntry}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingEntry(false)
                          setEditingEntry(null)
                          setOriginalEntry(null)
                          setNewEntry({
                            engagement: "",
                            task: "",
                            hours: 0,
                            minutes: 0,
                            comments: "",
                          })
                        }}
                        className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Stack Layout */}
                  <div className="lg:hidden">
                    <div className="flex gap-3 min-w-[1000px]">
                      <div className="w-48">
                        <Select
                          value={newEntry.engagement}
                          onValueChange={(value) => setNewEntry({ ...newEntry, engagement: value, task: "" })}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                            <SelectValue placeholder="Select Engagement" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                            {engagementOptions.map((e) => (
                              <SelectItem
                                key={e.engagementID}
                                value={e.title}
                              >
                                {e.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-48">
                        <Select value={newEntry.task} onValueChange={(value) => setNewEntry({ ...newEntry, task: value })}>
                          <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                            <SelectValue placeholder="Select Task" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                            {taskOptions.map((t) => (
                              <SelectItem key={t.taskID} value={t.taskName}>
                                {t.taskName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-17">
                          <Input
                            type="number"
                            min="0"
                            max="12"
                            placeholder="0"
                            value={newEntry.hours === 0 ? "" : newEntry.hours}
                            onChange={(e) => setNewEntry({ ...newEntry, hours: Number.parseInt(e.target.value) || 0 })}
                            className="flex-1 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                          />
                        </div> <div className="w-17">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            step="5"
                            placeholder="0"
                            value={newEntry.minutes === 0 ? "" : newEntry.minutes}
                            onChange={(e) => setNewEntry({ ...newEntry, minutes: Number.parseInt(e.target.value) || 0 })}
                            className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="w-64">
                        <Textarea
                          placeholder="Add comments..."
                          value={newEntry.comments}
                          onChange={(e) => setNewEntry({ ...newEntry, comments: e.target.value })}
                          className="min-h-[40px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                      </div>

                      <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddEntry}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        Save
                      </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingEntry(false)
                            setEditingEntry(null)
                            setOriginalEntry(null)
                            setNewEntry({
                              engagement: "",
                              task: "",
                              hours: 0,
                              minutes: 0,
                              comments: "",
                            })
                          }}
                          className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Entries with horizontal scroll container */}

              {currentDayEntries.length === 0 ? (
                <div className={`text-center py-8 text-gray-500`}>
                  <Clock className={`w-12 h-12 mx-auto mb-3 text-gray-300`} />
                  <p>No entries for this day</p>
                  <p className="text-sm">Click "Add Entry" to get started</p>
                </div>
              ) : (
                <div className="min-w-[1000px]">
                  {currentDayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-2 py-3 border-b last:border-b-0 border-gray-100`}
                    >
                      {editingEntry === entry.id ? (
                        <>
                          <div className="col-span-5">
                            <Select
                               value={editEntryDraft.engagement}
                              onValueChange={(value) => setEditEntryDraft({ ...editEntryDraft, engagement: value, task: "" })}
                            >
                              <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                                <SelectValue placeholder="Select Engagement" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                                {engagementOptions.map((e) => (
                                  <SelectItem key={e.engagementID} value={e.title} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {e.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                          <Select value={editEntryDraft.task} onValueChange={(value) => setEditEntryDraft({ ...editEntryDraft, task: value })}>
                              <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                                <SelectValue placeholder="Select Task" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto">
                                {taskOptions.map((t) => (
                                  <SelectItem key={t.taskID} value={t.taskName} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {t.taskName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <Input
                              type="number"
                              min="0"
                              max="12"
                              placeholder="0"
                              value={editEntryDraft.hours === 0 ? "" : editEntryDraft.hours}
                              onChange={(e) => setEditEntryDraft({ ...editEntryDraft, hours: Number.parseInt(e.target.value) || 0 })}
                              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                              type="number"
                              min="0"
                              max="59"
                              step="5"
                              placeholder="0"
                              value={editEntryDraft.minutes === 0 ? "" : editEntryDraft.minutes}
                              onChange={(e) => setEditEntryDraft({ ...editEntryDraft, minutes: Number.parseInt(e.target.value) || 0 })}
                              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                            />
                          </div>
                          <div className="col-span-2">
                            <Textarea
                              placeholder="Add comments..."
                              value={editEntryDraft.comments}
                              onChange={(e) => setEditEntryDraft({ ...editEntryDraft, comments: e.target.value })}
                              className="min-h-[40px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                            />
                          </div>
                          <div className="col-span-1 flex gap-2">
                            <Button size="sm" onClick={handleUpdateEntry} className="bg-green-600 hover:bg-green-700">Update</Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEntry(null)
                                setOriginalEntry(null)
                                setEditEntryDraft({ engagement: "", task: "", hours: 0, minutes: 0, comments: "" })
                              }}
                              className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`col-span-5 font-medium text-gray-800 truncate overflow-hidden`} title={entry.engagement}>
                            <span className="block truncate">{entry.engagement}</span>
                          </div>
                          <div className={`col-span-2 text-gray-600 truncate overflow-hidden`} title={entry.task}>
                            <span className="block truncate">{entry.task}</span>
                          </div>
                          <div className="col-span-1 text-center font-medium text-gray-900 dark:text-gray-100">{entry.hours}</div>
                          <div className="col-span-1 text-center font-medium text-gray-900 dark:text-gray-100">{entry.minutes.toString().padStart(2, "0")}</div>
                          <div className={`col-span-2 text-gray-600 truncate overflow-hidden`} title={entry.comments}>
                            <span className="block truncate">{entry.comments}</span>
                          </div>
                          <div className="col-span-1 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEntry(entry)}
                              disabled={timesheetStatus === 2 || timesheetStatus === 3} // Disable if submitted or approved
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              disabled={timesheetStatus === 2 || timesheetStatus === 3} // Disable if submitted or approved
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className={"text-gray-600"}>
                  Weekly Total: <strong>{formatWeeklyHours(weekTotalHours)}</strong> / 40h required
                </span>
              </div>
            {/* Right: Buttons */}
              <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                disabled={timesheetStatus === 1 || isCommentsDisabled} // Disable if pending or when going to current TS
                onClick={async () => {
                  if (!timesheetId) { setCommentsData([]); setIsCommentsOpen(true); return }
                  try {
                    const res = await fetch(`https://localhost:7080/api/timesheet/getvptimesheetcomments?timesheetid=${timesheetId}`, { credentials: "include" })
                    if (res.ok) {
                      const list = await res.json()
                      setCommentsData(Array.isArray(list) ? list : [])
                    } else {
                      setCommentsData([])
                    }
                  } catch {
                    setCommentsData([])
                  }
                  setIsCommentsOpen(true)
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments for TS
              </Button>
              <Button
                onClick={handleSubmitTimesheet}
                disabled={
                  weekTotalHours < 40 ||
                  timesheetStatus === 2 || timesheetStatus === 3
                }
                className={`${weekTotalHours >= 40
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                  }`}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Timesheet
              </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit confirmation modal */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className={`max-w-sm bg-white`}>
          <DialogHeader>
            <DialogTitle className={'text-gray-900'}>Submit Confirmation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Are you sure you want to submit?</p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Comments</label>
              <Textarea value={submitComment} onChange={(e) => setSubmitComment(e.target.value)} placeholder="Optional comments" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsSubmitOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={doSubmitTimesheet} className="flex-1 bg-blue-600 hover:bg-blue-700">Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
        {(showSuccessToast || showWarnToast) && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "white",
            color: showWarnToast ? "#92400e" : "black",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            border: showWarnToast ? "2px solid #fbbf24" : "2px solid #10b981",
          }}
        >
          {showWarnToast ? warnMessage : "Timesheet Submitted Successfully"}
        </div>
      )}

      {/* Modals */}
      <BulkEntryModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={handleBulkSubmit}
      />

      <WeekSelector
        isOpen={isWeekSelectorOpen}
        onClose={() => setIsWeekSelectorOpen(false)}
        currentWeek={currentWeek}
        rejectedRanges={rejectedRanges}
        selectedDate={selectedDate}
        maxSelectableISO={v1CurrentEndISO ?? undefined}
        onWeekSelect={(week) => {
          setCurrentWeek(week)
          // derive Monday from label
          try {
            const [range, yearStr] = week.split(", ")
            const [startStr] = range.split(" - ")
            const [monAbbr, dayStr] = startStr.split(" ")
            const mm: { [k: string]: number } = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
            const monday = new Date(Number.parseInt(yearStr), mm[monAbbr], Number.parseInt(dayStr))
            loadWeekEntries(monday)
          } catch (e) {
            console.error("Failed to parse week label", e)
          }
          setIsWeekSelectorOpen(false)
        }}
      />

      {/* Comments Modal */}
      <CommentsModalEmp
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        title={`Timesheet #${timesheetId ?? ''}`}
        comments={
          commentsData.map((c: any, idx: number) => ({
            id: idx + 1,
            user: {
              name: c.commentByUser ?? "",
              initials: (c.commentByUser?.split(' ').map((p: string) => p[0]).join('') ?? 'U').slice(0,2).toUpperCase(),
            },
            action: c.commentTypeText ?? "",
            timestamp: new Date(c.commentDate).toLocaleString(),
            commentText: c.commentText && c.commentText.trim().length > 0 ? c.commentText : undefined,
          }))
        }
      />
    </div>
  )
}
