"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

interface BulkEntry {
  id: string
  engagement: string
  task: string
  hours: number
  minutes: number
  comments: string
}

interface BulkEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entries: BulkEntry[], selectedDays: string[]) => void
}

export function BulkEntryModal({ isOpen, onClose, onSubmit }: BulkEntryModalProps) {
  const [entries, setEntries] = useState<BulkEntry[]>([
    {
      id: "1",
      engagement: "",
      task: "",
      hours: 0,
      minutes: 0,
      comments: "",
    },
  ])
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon"])

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

  const weekDays = [
    { key: "Mon", label: "Mon" },
    { key: "Tue", label: "Tue" },
    { key: "Wed", label: "Wed" },
    { key: "Thu", label: "Thu" },
    { key: "Fri", label: "Fri" },
  ]

  const dayIndexMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 }
  const todayDow = new Date().getDay() // 0=Sun, 1=Mon, ... 6=Sat

  function isFutureDay(key: string) {
    const idx = dayIndexMap[key]
    // If today is Mon-Fri: disable days after today
    if (todayDow >= 1 && todayDow <= 5) {
      return idx > todayDow
    }
    // If Sat/Sun, no weekdays in the current week are "future" anymore
    return false
  }

  const addEntry = () => {
    const newEntry: BulkEntry = {
      id: Date.now().toString(),
      engagement: "",
      task: "",
      hours: 0,
      minutes: 0,
      comments: "",
    }
    setEntries([...entries, newEntry])
  }

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id))
    }
  }

  const updateEntry = (id: string, field: keyof BulkEntry, value: any) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const toggleDay = (day: string) => {
    if (isFutureDay(day)) return
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = () => {
    const validEntries = entries.filter((entry) => entry.engagement && entry.task)
    if (validEntries.length > 0 && selectedDays.length > 0) {
      onSubmit(validEntries, selectedDays)
      // Reset form
      setEntries([{ id: "1", engagement: "", task: "", hours: 0, minutes: 0, comments: "" }])
      setSelectedDays(["Mon"])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{ maxWidth: "1200px" }}
        className={`w-full max-h-[95vh] overflow-y-auto bg-white`}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-gray-900`}>
            <Plus className="w-5 h-5 text-blue-600" />
            Bulk Time Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entries */}
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-4 border rounded-lg bg-gray-50 border-gray-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-medium text-gray-800`}>Entry {index + 1}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                  <div className="col-span-6 sm:col-span-7 lg:col-span-6">
                    <label className="block text-sm font-medium mb-1">Engagement</label>
                    <Select
                      value={entry.engagement}
                      onValueChange={(value) => updateEntry(entry.id, "engagement", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Engagement" />
                      </SelectTrigger>
                      <SelectContent>
                        {engagements.map((engagement) => (
                          <SelectItem key={engagement} value={engagement}>
                            {engagement}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-8 sm:col-span-2 lg:col-span-6">
                    <label className="block text-sm font-medium mb-1">Task</label>
                    <Select value={entry.task} onValueChange={(value) => updateEntry(entry.id, "task", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.map((task) => (
                          <SelectItem key={task} value={task}>
                            {task}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3 sm:col-span-1 lg:col-span-2">
                    <label className="block text-sm font-medium mb-1">Hours</label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      placeholder="0"
                      value={entry.hours === 0 ? "" : entry.hours}
                      onChange={(e) => updateEntry(entry.id, "hours", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1 lg:col-span-2">
                    <label className="block text-sm font-medium mb-1">Minutes</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={entry.minutes === 0 ? "" : entry.minutes}
                      onChange={(e) => updateEntry(entry.id, "minutes", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 lg:col-span-6">
                    <label className="block text-sm font-medium mb-1">Comments</label>
                    <Textarea
                      placeholder="Add comments..."
                      value={entry.comments}
                      onChange={(e) => updateEntry(entry.id, "comments", e.target.value)}
                      className="min-h-[40px] resize-none"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-1 lg:col-span-1 flex items-end">
                    {entries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addEntry} className="w-full border-dashed bg-transparent">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Entry
            </Button>
          </div>

          {/* Select Days */}
          <div>
            <h3 className={`text-base font-medium mb-3 text-gray-900`}>Select Days</h3>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map((day) => {
                const disabled = isFutureDay(day.key)
                const isSelected = selectedDays.includes(day.key)
                return (
                  <Button
                    key={day.key}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day.key)}
                    disabled={disabled}
                    aria-disabled={disabled}
                    className={[
                      isSelected ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "",
                      disabled ? "opacity-50 cursor-not-allowed" : "",
                    ]
                      .join(" ")
                      .trim()}
                  >
                    {day.label}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">{"Future weekdays are disabled for bulk entry."}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
