"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Calendar } from "../../ui/calendar"
import { AlertTriangle } from 'lucide-react'

interface WeekSelectorProps {
  isOpen: boolean
  onClose: () => void
  currentWeek: string
  onWeekSelect: (week: string) => void
  rejectedRanges?: { timesheetID: number; startDate: string; endDate: string }[]
  selectedDate?: string // Add selected date prop
}

export function WeekSelector({ isOpen, onClose, currentWeek, onWeekSelect, rejectedRanges = [], selectedDate: selectedDateProp }: WeekSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showWarning, setShowWarning] = useState(false)
  const [hasValidSelection, setHasValidSelection] = useState(false)
  const [maxSelectableDate, setMaxSelectableDate] = useState<Date | undefined>(undefined)
  const [defaultMonth, setDefaultMonth] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (!isOpen) return
    // Fetch the current filling week's range to disable selecting future weeks until it's submitted
    const loadCurrentWeek = async () => {
      try {
        const res = await fetch(`https://localhost:7080/api/timesheet/v1`, { credentials: "include" })
        if (res.ok) {
          const payload = await res.json()
          const data = payload?.data
          if (data?.endDate) {
            // Allow selection up to today, not just the current week's end date
            const today = new Date()
            const currentWeekEnd = new Date(data.endDate)
            setMaxSelectableDate(today > currentWeekEnd ? today : currentWeekEnd)
            //setMaxSelectableDate(currentWeekEnd)
          }
        }
      } catch {
        // ignore and keep calendar unrestricted
      }
    }
    loadCurrentWeek()
    // Parse currentWeek string to set default month/year in the calendar
    try {
      const [range, yearStr] = currentWeek.split(", ")
      const [startStr] = range.split(" - ")
      const [monAbbr, dayStr] = startStr.split(" ")
      const mm: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }
      const month = mm[monAbbr]
      const year = parseInt(yearStr,10)
      const day = parseInt(dayStr,10)
      setDefaultMonth(new Date(year, month, day))
    } catch {}
    
    // Set selected date from prop if provided
    if (selectedDateProp) {
      try {
        // Parse selectedDateProp like "Monday, August 18"
        const parts = selectedDateProp.split(", ")
        if (parts.length === 2) {
          const monthDay = parts[1].split(" ")
          const monthName = monthDay[0]
          const day = parseInt(monthDay[1])
          const monthMap: Record<string, number> = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 }
          const month = monthMap[monthName]
          if (month !== undefined) {
            // Use current year as default
            const year = new Date().getFullYear()
            setSelectedDate(new Date(year, month, day))
          }
        }
      } catch {
        // ignore parsing errors
      }
    }
  }, [isOpen, selectedDateProp])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const today = new Date() // Current date
      if (date > today) {
        setShowWarning(true)
        setHasValidSelection(false)
      } 
  //     const maxDate = maxSelectableDate || new Date()
  //     if (date > maxDate) {
  //       setShowWarning(true)
  //       setHasValidSelection(false)
  //  }
      else {
        setShowWarning(false)
        setHasValidSelection(true)
      }
    }
  }

// Build rejected markers across Mon-Fri from props
const rejectedMondays = (rejectedRanges || []).map(r => new Date(r.startDate))
const rejectedDays: Date[] = []
rejectedRanges.forEach(r => {
  const base = new Date(r.startDate)
  for (let i=0;i<5;i++) { const d = new Date(base); d.setDate(base.getDate()+i); rejectedDays.push(d) }
})

  const handleApply = () => {
    if (selectedDate && !showWarning) {
      // Get the Monday of the selected week
      const selectedDay = selectedDate.getDay()
      const mondayOffset = selectedDay === 0 ? -6 : 1 - selectedDay // Sunday = 0, Monday = 1
      const monday = new Date(selectedDate)
      monday.setDate(selectedDate.getDate() + mondayOffset)
      
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      
      const formatDate = (date: Date) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`
      }
      
      const weekString = `${formatDate(monday)} - ${formatDate(sunday)}, ${monday.getFullYear()}`
      onWeekSelect(weekString)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-sm bg-white`}>
        <DialogHeader>
          <DialogTitle className={'text-gray-900'}>Add New Timesheet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium text-gray-600`}>Week:</span>
              <span className={`text-sm text-gray-600`}>{currentWeek}</span>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border w-full"
            captionLayout="dropdown"
            fromYear={2024}
            toYear={new Date().getFullYear() + 1}
            defaultMonth={defaultMonth || selectedDate}
            disabled={maxSelectableDate ? { after: maxSelectableDate } : { before: new Date(2024, 9, 1) }} // Allow current week selection even with rejected timesheets
            modifiers={{
              rejected: rejectedDays
            }}
            modifiersClassNames={{
              rejected:
                "rounded-full border-1 border-red-200 bg-red-100 text-red-700 font-semibold"
            }}           
          />

          {showWarning && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Please fill previous timesheets first before filling future timesheets.
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={showWarning || !hasValidSelection}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
