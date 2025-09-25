"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"

interface AddEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: {
    engagement: string
    task: string
    hours: number
    minutes: number
    comments: string
  }) => void
}

export function AddEntryModal({ isOpen, onClose, onSubmit }: AddEntryModalProps) {
  const [formData, setFormData] = useState({
    engagement: "",
    task: "",
    hours: 0,
    minutes: 0,
    comments: ""
  })

  const engagements = [
    "Smart Attendance System",
    "AI Chatbot for Customer Support",
    "IoT-Based Home Automation",
    "Blockchain Voting Platform",
    "E-commerce Product Recommendation Engine"
  ]

  const tasks = [
    "Frontend Development",
    "Backend Development",
    "UI/UX Design",
    "Testing",
    "Documentation",
    "Code Review",
    "Meeting"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.engagement && formData.task) {
      onSubmit(formData)
      setFormData({
        engagement: "",
        task: "",
        hours: 0,
        minutes: 0,
        comments: ""
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:rounded-lg px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex gap-4 items-start overflow-x-auto no-scrollbar py-4"  style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex-shrink-0 min-w-[200px]">
            <Label htmlFor="engagement">Select Engagement</Label>
            <Select 
              value={formData.engagement} 
              onValueChange={(value) => setFormData({...formData, engagement: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose engagement" />
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

          <div className="flex-shrink-0 min-w-[180px]">
            <Label htmlFor="task">Select Task</Label>
            <Select 
              value={formData.task} 
              onValueChange={(value) => setFormData({...formData, task: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose task" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex-shrink-0 w-20">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="24"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="flex-shrink-0 w-20">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({...formData, minutes: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex-shrink-0 min-w-[220px]">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              placeholder="Add comments..."
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
            />
          </div>

          <div className="flex-shrink-0 flex items-end gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}