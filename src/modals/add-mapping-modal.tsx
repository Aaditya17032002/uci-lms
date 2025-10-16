"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Save, X } from 'lucide-react'

interface AddMappingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialData?: any // For editing existing mappings
  users?: { id: number, name: string }[]
  policies?: { id: number, name: string }[]
}

export function AddMappingModal({ isOpen, onClose, onSave, initialData, users = [], policies = [] }: AddMappingModalProps) {
  const [formData, setFormData] = useState({
    employee: "",
    policyName: "",
    startDate: "",
    endDate: "",
  })
  const [errors, setErrors] = useState<{ employee?: string; policyName?: string; startDate?: string; endDate?: string }>({})
  const isDateRangeInvalid = Boolean(
    formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)
  )

  // Data comes from props; fallback to empty arrays
  const availableUsers = users
  const availablePolicies = policies

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        employee: initialData.employee || "",
        policyName: initialData.policyName || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
      })
    } else if (isOpen && !initialData) {
      // Reset form for new entry when modal opens without initialData
      setFormData({
        employee: "",
        policyName: "",
        startDate: "",
        endDate: "",
      })
    }
  }, [isOpen, initialData]) // Depend on isOpen and initialData

  const validate = () => {
    const next: { employee?: string; policyName?: string; startDate?: string; endDate?: string } = {}
    if (!formData.employee.trim()) next.employee = "User is required"
    if (!formData.policyName.trim()) next.policyName = "Policy name is required"
    if (!formData.startDate) next.startDate = "Start date is required"
    if (!formData.endDate) next.endDate = "End date is required"
    if (!next.startDate && !next.endDate && isDateRangeInvalid) next.endDate = "End date must be on or after start date"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-0">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-6 pt-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? `Edit Mapping for ${initialData.employee}` : "Add New Mapping"}
          </DialogTitle>

        </DialogHeader>

        <div className="space-y-6 py-6 px-6">
          <div className="space-y-2">
            <Label htmlFor="user" className="text-sm font-medium text-gray-700 dark:text-gray-300">User</Label>
            {initialData ? (
              <div className="text-gray-900 dark:text-white font-semibold min-h-[40px] flex items-center px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                {formData.employee || initialData.employee}
              </div>
            ) : (
              <Select value={formData.employee} onValueChange={(value) => setFormData({...formData, employee: value})}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.name} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          {errors.employee && <p className="text-xs text-red-600">{errors.employee}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Policy Name</Label>
            <Select value={formData.policyName} onValueChange={(value) => setFormData({...formData, policyName: value})}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select Policy Name" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {availablePolicies.map(policy => (
                  <SelectItem key={policy.id} value={policy.name} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.policyName && <p className="text-xs text-red-600">{errors.policyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            {(isDateRangeInvalid || errors.endDate) && (
              <p className="text-xs text-red-600 mt-1">{errors.endDate || "Start date must be earlier than end date."}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="destructive" onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-base font-medium rounded-md shadow-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isDateRangeInvalid} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-2.5 text-base font-medium rounded-md shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
