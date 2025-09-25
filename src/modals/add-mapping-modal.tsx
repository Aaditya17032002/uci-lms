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
}

export function AddMappingModal({ isOpen, onClose, onSave, initialData }: AddMappingModalProps) {
  const [formData, setFormData] = useState({
    employee: "",
    policyName: "",
    startDate: "",
    endDate: "",
  })

  // Dummy data for selects
  const availableUsers = [
    { id: "akash-patel", name: "Akash Patel" },
    { id: "akshay-supare", name: "Akshay Supare" },
    { id: "zeel-sathwara", name: "Zeel Sathwara" },
    { id: "aditya-jangam", name: "Aditya Jangam" },
    { id: "tushar-mishra", name: "Tushar Mishra" },
    { id: "paritosh-unakar", name: "Paritosh Unakar" },
    { id: "vrushti-patel", name: "Vrushti Patel" },
    { id: "nancy-sheth", name: "Nancy Sheth" },
  ]

  const availablePolicies = [
    { id: "intern-policy", name: "Intern Policy" },
    { id: "standard-policy-fte", name: "Standard Policy (FTE)" },
    { id: "executive-policy-fte", name: "Executive Policy (FTE)" },
    { id: "probation-policy", name: "Probation Policy" },
    { id: "contract-employee-policy", name: "Contract-Employee Policy" },
  ]

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

  const handleSave = () => {
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
            <Select value={formData.employee} onValueChange={(value) => setFormData({...formData, employee: value})}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.name} className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
