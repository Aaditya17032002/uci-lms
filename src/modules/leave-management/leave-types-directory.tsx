"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Circle, Plus, Edit } from 'lucide-react' // Import Edit icon
import { AddLeaveTypeModal } from "../../modals/add-leave-type-modal" // Import the modal
import { useToast } from "../../hooks/use-toast" // Import useToast
import axios from "axios"

interface LeaveType {
  id: number
  name: string
  code: string
  description: string
  colorCode: string
  createdBy: string
  modifiedBy: string
  status: "Active" | "Inactive"
}

type ApiLeaveType = {
  leaveTypeId: number
  leaveName: string
  description: string
  colorCode: string
  isActive: boolean
  createdBy: string
  modifiedBy: string
}

export function LeaveTypesDirectoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const parseCodeFromName = (leaveName: string): string => {
    const match = leaveName.match(/\(([^)]+)\)/)
    return match ? match[1] : leaveName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 4)
  }

  const loadLeaveTypes = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[LeaveTypes] Fetching leave types...")
      const resp = await axios.get<ApiLeaveType[]>("https://localhost:7080/api/Leave/GetLeaveTypes", { withCredentials: true })
      console.log("[LeaveTypes] Raw response:", resp.data)
      const apiItems: ApiLeaveType[] = Array.isArray(resp.data) ? resp.data : []
      const uiItems: LeaveType[] = apiItems.map(item => ({
        id: item.leaveTypeId,
        name: item.leaveName.replace(/\s*\([^)]*\)\s*$/, "").trim() || item.leaveName,
        code: parseCodeFromName(item.leaveName),
        description: item.description,
        colorCode: item.colorCode,
        createdBy: item.createdBy,
        modifiedBy: item.modifiedBy,
        status: item.isActive ? "Active" : "Inactive",
      }))
      setLeaveTypes(uiItems)
      console.log("[LeaveTypes] Processed items:", uiItems)
    } catch (e: any) {
      console.error("[LeaveTypes] Failed to fetch:", e)
      setError(e?.message || "Failed to load leave types")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaveTypes()
  }, [])

  const handleEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType)
    setIsAddModalOpen(true)
  }

  const handleSave = async (data: any) => {
    try {
      console.log("[LeaveTypes] Saving leave type with form data:", data)
      const payload = {
        leaveTypeId: editingLeaveType?.id ?? 0,
        leaveName: data.name,
        description: data.description,
        isActive: data.status === true || data.status === "Active",
        colorCode: data.colorCode,
        modUser: 0,
      }
      console.log("[LeaveTypes] POST payload:", payload)
      await axios.post("https://localhost:7080/api/Leave/SaveLeaveType", payload, { withCredentials: true })
      toast({
        title: "Success",
        description: editingLeaveType ? `Leave type "${data.name}" updated successfully!` : `Leave type "${data.name}" added successfully!`,
        duration: 3000,
        className: "border border-green-300",
      })
      await loadLeaveTypes()
    } catch (e: any) {
      console.error("[LeaveTypes] Save failed:", e)
      toast({
        title: "Error",
        description: e?.message || "Failed to save leave type",
        duration: 4000,
      })
    } finally {
      setIsAddModalOpen(false)
      setEditingLeaveType(null)
    }
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between"> {/* Added flex container */}
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Leave Types Directory
          </CardTitle>
          <Button onClick={() => { setEditingLeaveType(null); setIsAddModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Leave Type
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full p-4 text-sm text-gray-600 dark:text-gray-300">Loading leave types...</div>
        )}
        {error && (
          <div className="col-span-full p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        {!loading && !error && leaveTypes.map((type) => (
          <Card key={type.id} className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between"> {/* Added flex and justify-between */}
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" style={{ color: type.colorCode }} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{type.name} ({type.code})</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(type)}
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[40px]">{type.description}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Created By: {type.createdBy}</p>
                <p>Modified By: {type.modifiedBy}</p>
              </div>
              <Badge
                className={
                  type.status === "Active"
                    ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                }
              >
                {type.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </CardContent>

      <AddLeaveTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        initialData={editingLeaveType}
      />
    </div>
  )
}
