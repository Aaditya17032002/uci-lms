"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Circle, Plus, Edit } from 'lucide-react' // Import Edit icon
import { AddLeaveTypeModal } from "../../modals/add-leave-type-modal" // Import the modal
import { useToast } from "../../hooks/use-toast" // Import useToast

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

const initialMockLeaveTypes: LeaveType[] = [
  { id: 1, name: "Casual Leave", code: "CL", description: "Short-Term Leave for Personal Reasons or Unforeseen Circumstances", colorCode: "#FF6347", createdBy: "Paritosh Unakar", modifiedBy: "Zeel Sathwara", status: "Active" },
  { id: 2, name: "Sick Leave", code: "SL", description: "Leave due to illness", colorCode: "#32CD32", createdBy: "Paritosh Unakar", modifiedBy: "--", status: "Active" },
  { id: 3, name: "Leave Without Pay", code: "LWP", description: "Unpaid Leave for Personal/Medical/Professional reasons granted upon exhaustion of CL/SL", colorCode: "#A9A9A9", createdBy: "Paritosh Unakar", modifiedBy: "--", status: "Active" },
  { id: 4, name: "Work From Home", code: "WFH", description: "NOT A LEAVE - Carry out Work duties from home under special Circumstances", colorCode: "#1E90FF", createdBy: "Paritosh Unakar", modifiedBy: "--", status: "Active" },
  { id: 5, name: "Comp-Off", code: "CO", description: "Compensation for Working on Weekend or Holiday", colorCode: "#FFD700", createdBy: "Paritosh Unakar", modifiedBy: "Zeel Sathwara", status: "Active" },
  { id: 6, name: "Test Leave 1", code: "TL1", description: "Leave Type created", colorCode: "#911F47", createdBy: "Zeel Sathwara", modifiedBy: "Zeel Sathwara", status: "Inactive" },
  { id: 7, name: "Casual Leave", code: "CL/CL", description: "Short-Term Leave for Personal Reasons or Unforeseen Circumstances", colorCode: "#FF6347", createdBy: "Tushar Mishra", modifiedBy: "Tushar Mishra", status: "Inactive" },
  { id: 8, name: "Casual Leave", code: "CL", description: "Test Leave", colorCode: "#FF6347", createdBy: "Zeel Sathwara", modifiedBy: "Zeel Sathwara", status: "Inactive" },
  { id: 9, name: "Sick Leave", code: "SL", description: "Test Leave", colorCode: "#32CD32", createdBy: "Zeel Sathwara", modifiedBy: "Zeel Sathwara", status: "Inactive" },
  { id: 10, name: "Sick Leavee", code: "SL", description: "Test Leave Updated", colorCode: "#C91818", createdBy: "Zeel Sathwara", modifiedBy: "Zeel Sathwara", status: "Inactive" },
]

export function LeaveTypesDirectoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialMockLeaveTypes)
  const { toast } = useToast()

  const handleEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType)
    setIsAddModalOpen(true)
  }

  const handleSave = (data: any) => {
    if (editingLeaveType) {
      // Update existing leave type
      setLeaveTypes(prev => prev.map(type => type.id === editingLeaveType.id ? { ...type, ...data } : type))
      toast({
        title: "Success",
        description: `Leave type "${data.name}" updated successfully!`,
        duration: 3000,
      })
    } else {
      // Add new leave type
      const newId = Math.max(...leaveTypes.map(type => type.id), 0) + 1; // Generate a new ID
      // Simple code generation, you might want a more robust one
      const newCode = data.name.substring(0, 3).toUpperCase() + newId; 
      setLeaveTypes(prev => [...prev, { ...data, id: newId, code: newCode, createdBy: "Current User", modifiedBy: "--" }]);
      toast({
        title: "Success",
        description: `Leave type "${data.name}" added successfully!`,
        duration: 3000,
      })
    }
    setIsAddModalOpen(false)
    setEditingLeaveType(null)
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
        {leaveTypes.map((type) => (
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
