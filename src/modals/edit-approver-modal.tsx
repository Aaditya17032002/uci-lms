
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { X, Save } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface EditApproverModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  employee: {
    userId: number
    userName: string
    primaryApproverName?: string
    secondaryApproverName?: string
  }
  managers: { id: number; name: string }[]
  secondaryUsers: { id: number; name: string }[]
}

export function EditApproverModal({
  isOpen,
  onClose,
  onSave,
  employee,
  managers,
  secondaryUsers
}: EditApproverModalProps) {
  const [formData, setFormData] = useState({
    primaryApprover: "",
    secondaryApprover: ""
  })

  const [openPrimary, setOpenPrimary] = useState(false)
  const [openSecondary, setOpenSecondary] = useState(false)

  const [primarySearch, setPrimarySearch] = useState("")
  const [secondarySearch, setSecondarySearch] = useState("")

  useEffect(() => {
  if (employee && isOpen && managers.length > 0 && secondaryUsers.length > 0) {
    // Match primary approver from managers
    const primaryManager = managers.find(m => m.name === employee.primaryApproverName);

    // Match secondary approver from secondaryUsers
    const secondary = secondaryUsers.find(u => u.name === employee.secondaryApproverName);

    setFormData({
      primaryApprover: primaryManager?.id?.toString() ?? "",
      secondaryApprover:
        secondary?.id?.toString() ?? (!employee.secondaryApproverName || employee.secondaryApproverName === "--"
      ? "none"
      : "")
    });

    setPrimarySearch("");
    setSecondarySearch("");
  }
}, [employee, isOpen, managers, secondaryUsers]);



  const filteredPrimaryManagers = managers.filter(m =>
    m.name.toLowerCase().includes(primarySearch.toLowerCase())
  )

  const filteredSecondaryUsers = secondaryUsers.filter(u =>
    u.name.toLowerCase().includes(secondarySearch.toLowerCase())
  )

  const handleSave = () => {
    if (!formData.primaryApprover) {
      alert("Primary Approver is required")
      return
    }

    onSave({
      userID: employee.userId,
      primaryApprover: Number(formData.primaryApprover),
      secondaryApprover: formData.secondaryApprover === "none" || !formData.secondaryApprover ? 0 : Number(formData.secondaryApprover),
      modUserID: employee.userId
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
            Edit Approver
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{employee.userName}</h3>
          </div>

          {/* Primary Approver */}
          <div className="space-y-2">
            <Label htmlFor="primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Approver</Label>
            <Popover open={openPrimary} onOpenChange={setOpenPrimary}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800"
                >
                  <span className={formData.primaryApprover ? "" : "text-gray-500 dark:text-gray-400"}>
                    {formData.primaryApprover
                      ? managers.find(m => m.id.toString() === formData.primaryApprover)?.name
                      : "Select Primary Approver"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                  <input
                    type="text"
                    placeholder="Search approver..."
                    value={primarySearch}
                    onChange={(e) => setPrimarySearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredPrimaryManagers.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No approver found.</div>
                  ) : (
                    filteredPrimaryManagers.map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setFormData({ ...formData, primaryApprover: m.id.toString() })
                          setOpenPrimary(false)
                          setPrimarySearch("")
                        }}
                        className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {m.name}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Secondary Approver */}
          <div className="space-y-2">
            <Label htmlFor="secondary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Approver</Label>
            <Popover open={openSecondary} onOpenChange={setOpenSecondary}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-left font-normal bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800"
                >
                  <span className={formData.secondaryApprover ? "" : "text-gray-500 dark:text-gray-400"}>
                    {formData.secondaryApprover === "none"
                      ? "None"
                      : formData.secondaryApprover
                        ? secondaryUsers.find(u => u.id.toString() === formData.secondaryApprover)?.name
                        : "Select Secondary Approver"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                  <input
                    type="text"
                    placeholder="Search secondary approver..."
                    value={secondarySearch}
                    onChange={(e) => setSecondarySearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, secondaryApprover: "none" })
                      setOpenSecondary(false)
                      setSecondarySearch("")
                    }}
                    className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    None
                  </div>
                  {filteredSecondaryUsers.length === 0 && secondarySearch ? (
                    <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No approver found.</div>
                  ) : (
                    filteredSecondaryUsers.map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setFormData({ ...formData, secondaryApprover: u.id.toString() })
                          setOpenSecondary(false)
                          setSecondarySearch("")
                        }}
                        className="px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {u.name}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="destructive" onClick={onClose} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
