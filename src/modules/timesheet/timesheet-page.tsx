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
import { Clock, Calendar, Plus, Edit, Trash2, Info, ChevronDown, Send, X } from "lucide-react"
import { BulkEntryModal } from "./bulk-entry-modal"
import { WeekSelector } from "./week-selector"

interface TimesheetEntry {
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

  const [currentWeek, setCurrentWeek] = useState("Aug 18 - Aug 22, 2025")
  const [selectedDate, setSelectedDate] = useState("Monday, August 18")
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false)
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [weekDays, setWeekDays] = useState([
    { day: "Mon", date: "18", full: "Monday, August 18", status: "filled", isWeekend: false },
    { day: "Tue", date: "19", full: "Tuesday, August 19", status: "filled", isWeekend: false },
    { day: "Wed", date: "20", full: "Wednesday, August 20", status: "filled", isWeekend: false },
    { day: "Thu", date: "21", full: "Thursday, August 21", status: "filled", isWeekend: false },
    { day: "Fri", date: "22", full: "Friday, August 22", status: "filled", isWeekend: false },
    { day: "Sat", date: "23", full: "Saturday, August 23", status: "optional", isWeekend: true },
    { day: "Sun", date: "24", full: "Sunday, August 24", status: "optional", isWeekend: true },
  ])

  const [newEntry, setNewEntry] = useState({
    engagement: "",
    task: "",
    hours: 0,
    minutes: 0,
    comments: "",
  })

  const handleNotify = () => {
    setShowPopup(true)
    setTimeout(() => {
      setShowPopup(false)
    }, 3000) // hides after 3 seconds
  }

  // Sample data for different weeks
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    // July 28 - Aug 03 week entries
    {
      id: "1",
      engagement: "Smart Attendance System",
      task: "Frontend Development",
      hours: 4,
      minutes: 30,
      comments: "Implemented user authentication module",
      date: "Monday, August 18",
    },
    {
      id: "2",
      engagement: "Smart Attendance System",
      task: "Testing",
      hours: 3,
      minutes: 30,
      comments: "Implemented user authentication module",
      date: "Monday, August 18",
    },
    {
      id: "3",
      engagement: "AI Chatbot for Customer Support",
      task: "Backend Development",
      hours: 3,
      minutes: 30,
      comments: "API integration for chat responses",
      date: "Monday, August 19",
    },
    {
      id: "4",
      engagement: "IoT-Based Home Automation",
      task: "UI/UX Design",
      hours: 5,
      minutes: 0,
      comments: "Dashboard wireframes and prototypes",
      date: "Tuesday, August 19",
    },
    {
      id: "5",
      engagement: "Smart Attendance System",
      task: "Testing",
      hours: 3,
      minutes: 0,
      comments: "Unit testing for authentication",
      date: "Tuesday, August 19",
    },
    {
      id: "6",
      engagement: "Blockchain Voting Platform",
      task: "Frontend Development",
      hours: 6,
      minutes: 0,
      comments: "Voting interface implementation",
      date: "Wednesday, August 20",
    },
    {
      id: "7",
      engagement: "AI Chatbot for Customer Support",
      task: "Documentation",
      hours: 2,
      minutes: 0,
      comments: "API documentation updates",
      date: "Wednesday, August 20",
    },
    {
      id: "8",
      engagement: "E-commerce Product Recommendation Engine",
      task: "Backend Development",
      hours: 7,
      minutes: 0,
      comments: "Machine learning model optimization",
      date: "Thursday, August 21",
    },
    {
      id: "9",
      engagement: "Smart Attendance System",
      task: "Code Review",
      hours: 1,
      minutes: 0,
      comments: "Peer code review session",
      date: "Thursday, August 21",
    },
    {
      id: "10",
      engagement: "E-commerce Product Recommendation Engine",
      task: "Backend Development",
      hours: 6,
      minutes: 0,
      comments: "Machine learning model optimization",
      date: "Friday, August 22",
    },
    {
      id: "11",
      engagement: "Blockchain Voting Platform",
      task: "Testing",
      hours: 2,
      minutes: 0,
      comments: "Peer code review session",
      date: "Friday, August 22",
    },
    // Aug 04 - Aug 10 week entries (different week)
    {
      id: "12",
      engagement: "Smart Attendance System",
      task: "Frontend Development",
      hours: 4,
      minutes: 30,
      comments: "Implemented user authentication module",
      date: "Monday, August 25",
    },
    {
      id: "13",
      engagement: "AI Chatbot for Customer Support",
      task: "Backend Development",
      hours: 3,
      minutes: 30,
      comments: "API integration for chat responses",
      date: "Monday, August 25",
    },
    {
      id: "14",
      engagement: "IoT-Based Home Automation",
      task: "UI/UX Design",
      hours: 5,
      minutes: 0,
      comments: "Dashboard wireframes and prototypes",
      date: "Tuesday, August 26",
    },
    {
      id: "15",
      engagement: "Smart Attendance System",
      task: "Testing",
      hours: 3,
      minutes: 0,
      comments: "Unit testing for authentication",
      date: "Tuesday, August 26",
    },
    {
      id: "16",
      engagement: "Blockchain Voting Platform",
      task: "Frontend Development",
      hours: 6,
      minutes: 0,
      comments: "Voting interface implementation",
      date: "Wednesday, August 27",
    },
    {
      id: "17",
      engagement: "AI Chatbot for Customer Support",
      task: "Documentation",
      hours: 2,
      minutes: 0,
      comments: "API documentation updates",
      date: "Wednesday, August 27",
    },
    {
      id: "18",
      engagement: "E-commerce Product Recommendation Engine",
      task: "Backend Development",
      hours: 7,
      minutes: 0,
      comments: "Machine learning model optimization",
      date: "Thursday, August 28",
    },
    {
      id: "19",
      engagement: "Smart Attendance System",
      task: "Code Review",
      hours: 1,
      minutes: 0,
      comments: "Peer code review session",
      date: "Thursday, August 28",
    },
    {
      id: "20",
      engagement: "E-commerce Product Recommendation Engine",
      task: "Backend Development",
      hours: 6,
      minutes: 0,
      comments: "Machine learning model optimization",
      date: "Friday, August 29",
    },
    {
      id: "21",
      engagement: "Blockchain Voting Platform",
      task: "Testing",
      hours: 2,
      minutes: 0,
      comments: "Peer code review session",
      date: "Friday, August 29",
    },
  ])

  const engagements = [
    "Smart Attendance System",
    "AI Chatbot for Customer Support",
    "IoT-Based Home Automation",
    "Blockchain Voting Platform",
    "E-commerce Product Recommendation Engine",
  ]

  const tasks = [
    "Frontend Development",
    "Backend Development",
    "UI/UX Design",
    "Testing",
    "Documentation",
    "Code Review",
    "Meeting",
  ]

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

  // Get day hours for each day
  const getDayHours = (dayFull: string) => {
    const dayEntries = getCurrentWeekEntries().filter((entry) => entry.date === dayFull)
    return dayEntries.reduce((sum, entry) => sum + entry.hours + entry.minutes / 60, 0)
  }

  // Check if weekends should be enabled (all weekdays filled with 8h each)
  const weekdaysFilled = weekDays
    .filter((day) => !day.isWeekend)
    .every((day) => {
      return getDayHours(day.full) >= 8
    })

  // Today's date for comparison (August 6, 2025)
  const today = new Date("2025-09-02")

  const updateWeekDays = (weekString: string) => {
    // Parse week string like "Jul 28 - Aug 03, 2025"
    const [startStr] = weekString.split(" - ")
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

    const startDate = new Date(2025, monthMap[month], Number.parseInt(day))

    // Find the Monday of this week
    const dayOfWeek = startDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(startDate)
    monday.setDate(startDate.getDate() + mondayOffset)

    const newWeekDays = []
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
      })
    }

    setWeekDays(newWeekDays)
    setSelectedDate(newWeekDays[0].full)
  }

  useEffect(() => {
    updateWeekDays(currentWeek)
  }, [currentWeek])

  const handleAddEntry = () => {
    if (newEntry.engagement && newEntry.task) {
      const entry: TimesheetEntry = {
        ...newEntry,
        id: Date.now().toString(),
        date: selectedDate,
      }
      setEntries([...entries, entry])
      setNewEntry({
        engagement: "",
        task: "",
        hours: 0,
        minutes: 0,
        comments: "",
      })
      setIsAddingEntry(false)
    }
  }

  const handleEditEntry = (entry: TimesheetEntry) => {
    setNewEntry({
      engagement: entry.engagement,
      task: entry.task,
      hours: entry.hours,
      minutes: entry.minutes,
      comments: entry.comments,
    })
    setEditingEntry(entry.id)
  }

  const handleUpdateEntry = () => {
    if (editingEntry && newEntry.engagement && newEntry.task) {
      setEntries(entries.map((entry) => (entry.id === editingEntry ? { ...entry, ...newEntry } : entry)))
      setNewEntry({
        engagement: "",
        task: "",
        hours: 0,
        minutes: 0,
        comments: "",
      })
      setEditingEntry(null)
    }
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const canFillDay = (day: any) => {
    if (day.status === "future") return false
    if (day.isWeekend) {
      return weekdaysFilled
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
    if (dayHours >= 8)
      return "bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40"
    if (day.status === "future")
      return "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
    if (day.isWeekend && !weekdaysFilled)
      return "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"

    return "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
  }

  const handleSubmitTimesheet = () => {
    if (weekTotalHours >= 40) {
      alert("Timesheet submitted successfully!")
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

  return (
    <div className={`p-3 sm:p-6 space-y-4 sm:space-y-6 text-gray-900 bg-gray-50`}>


      {/* Nags Section */}
      <div className="space-y-2">
        {showNag1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-red-100 border border-red-300 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-700 gap-2">
            <span className="text-sm text-red-800 dark:text-red-300 pr-2">
              Your Timesheet for 4th Week of August has been rejected.
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 bg-transparent text-xs sm:text-sm"
              >
                View Details
              </Button>
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
              Your Timesheet for 2nd Week of August has been submitted and it's been a while your manager reviewed it.
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotify}
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
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className={"text-gray-600"}>Weekly Total: </span>
                <span className="font-semibold text-blue-600">{weekTotalHours.toFixed(1)}h</span>
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
                className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 hover:dark:bg-gray-600 text-sm"
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
                className={`grid grid-cols-12 gap-4 text-sm font-medium border-b pb-2 min-w-[800px] text-gray-600 border-gray-200`}
              >
                <div className="col-span-3">ENGAGEMENT</div>
                <div className="col-span-2">TASK</div>
                <div className="col-span-1">HOURS</div>
                <div className="col-span-1">MINUTES</div>
                <div className="col-span-3">COMMENTS</div>
                <div className="col-span-2">ACTIONS</div>
              </div>


              {/* Add/Edit Entry Form */}
              {(isAddingEntry || editingEntry) && (
                <div
                  className={`border-b rounded-lg p-3 border-gray-200 bg-blue-50 min-w-[820px]`}
                >
                  {/* Desktop Grid Layout */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 py-3">
                    <div className="col-span-3">
                      <Select
                        value={newEntry.engagement}
                        onValueChange={(value) => setNewEntry({ ...newEntry, engagement: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                          <SelectValue placeholder="Select Engagement" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                          {engagements.map((engagement) => (
                            <SelectItem
                              key={engagement}
                              value={engagement}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {engagement}
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
                        <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                          {tasks.map((task) => (
                            <SelectItem key={task} value={task} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                              {task}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="0"
                        max="24"
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
                        placeholder="0"
                        value={newEntry.minutes === 0 ? "" : newEntry.minutes}
                        onChange={(e) => setNewEntry({ ...newEntry, minutes: Number.parseInt(e.target.value) || 0 })}
                        className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-3">
                      <Textarea
                        placeholder="Add comments..."
                        value={newEntry.comments}
                        onChange={(e) => setNewEntry({ ...newEntry, comments: e.target.value })}
                        className="min-h-[40px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {editingEntry ? "Update" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingEntry(false)
                          setEditingEntry(null)
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
                    <div className="flex gap-3 min-w-[800px]">
                      <div className="w-48">
                        <Select
                          value={newEntry.engagement}
                          onValueChange={(value) => setNewEntry({ ...newEntry, engagement: value })}
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                            <SelectValue placeholder="Select Engagement" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                            {engagements.map((engagement) => (
                              <SelectItem
                                key={engagement}
                                value={engagement}
                              >
                                {engagement}
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
                          <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                            {tasks.map((task) => (
                              <SelectItem key={task} value={task}>
                                {task}
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
                            max="24"
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
                          onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          {editingEntry ? "Update" : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingEntry(false)
                            setEditingEntry(null)
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
                <div className="min-w-[800px]">
                  {currentDayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-4 py-3 border-b last:border-b-0 border-gray-100`}
                    >
                      <div className={`col-span-3 font-medium text-gray-800`}>
                        {entry.engagement}
                      </div>
                      <div className={`col-span-2 text-gray-600`}>{entry.task}</div>
                      <div className="col-span-1 text-center font-medium text-gray-900 dark:text-gray-100">
                        {entry.hours}
                      </div>
                      <div className="col-span-1 text-center font-medium text-gray-900 dark:text-gray-100">
                        {entry.minutes.toString().padStart(2, "0")}
                      </div>
                      <div className={`col-span-3 text-gray-600`}>{entry.comments}</div>
                      <div className="col-span-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEntry(entry)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                  Weekly Total: <strong>{weekTotalHours.toFixed(1)}h</strong> / 40h required
                </span>
              </div>
              <Button
                onClick={handleSubmitTimesheet}
                disabled={weekTotalHours < 40}
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
        </CardContent>
      </Card>

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
        onWeekSelect={(week) => {
          setCurrentWeek(week)
          setIsWeekSelectorOpen(false)
        }}
      />
    </div>
  )
}
