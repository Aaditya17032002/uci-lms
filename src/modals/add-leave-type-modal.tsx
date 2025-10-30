"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Save, X } from 'lucide-react'

interface AddLeaveTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialData?: any // For editing existing leave types
}

export function AddLeaveTypeModal({ isOpen, onClose, onSave, initialData }: AddLeaveTypeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    colorCode: "",
    status: true, // true for Active, false for Inactive
  })
  const [errors, setErrors] = useState<{ name?: string; description?: string; colorCode?: string }>({})

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        colorCode: initialData.colorCode || "",
        status: initialData.status === "Active",
      })
    } else if (isOpen && !initialData) {
      // Reset form for new entry when modal opens without initialData
      setFormData({
        name: "",
        description: "",
        colorCode: "",
        status: true,
      })
    }
  }, [isOpen, initialData]) // Depend on isOpen and initialData

  const validate = () => {
    const next: { name?: string; description?: string; colorCode?: string } = {}
    if (!formData.name.trim()) next.name = "Leave type name is required"
    if (!formData.description.trim()) next.description = "Description is required"
    const hex = /^#([0-9A-Fa-f]{6})$/
    if (!formData.colorCode.trim()) next.colorCode = "Color code is required"
    else if (!hex.test(formData.colorCode.trim())) next.colorCode = "Color code must be like #RRGGBB"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...formData,
      status: formData.status ? "Active" : "Inactive", // Convert boolean back to string
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-0">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-6 pt-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Edit Leave Type" : "Add New Leave Type"}
          </DialogTitle>
          
        </DialogHeader>

        <div className="space-y-6 py-6 px-6">
          <div className="space-y-2">
            <Label htmlFor="leaveTypeName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type Name</Label>
            <Input
              id="leaveTypeName"
              placeholder="Enter leave type name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Code</Label>
            <Input
              id="colorCode"
              placeholder="#RRGGBB"
              value={formData.colorCode}
              onChange={(e) => setFormData({...formData, colorCode: e.target.value})}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.colorCode && <p className="text-xs text-red-600">{errors.colorCode}</p>}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="activeStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</Label>
            <Switch
              id="activeStatus"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({...formData, status: checked})}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="destructive" onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-base font-medium rounded-md shadow-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-base font-medium rounded-md shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
