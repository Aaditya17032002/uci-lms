"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Plus, Edit } from 'lucide-react'
import { Pagination } from "../../common/pagination"
import { AddMappingModal } from "../../modals/add-mapping-modal"
import { useToast } from "../../hooks/use-toast"

interface UserPolicyMapping {
  id: number
  employee: string
  policyName: string
  startDate: string
  endDate: string
  modifiedBy: string
  modifiedOn: string
}

const initialUserPolicyMappings: UserPolicyMapping[] = [
  { id: 1, employee: "Akash Patel", policyName: "Standard Policy (FTE)", startDate: "2025-05-07", endDate: "2026-06-07", modifiedBy: "Paritosh Unakar", modifiedOn: "09-May-2025 13:40" },
  { id: 2, employee: "Akshay Supare", policyName: "Executive Policy (FTE)", startDate: "2024-01-01", endDate: "2025-12-31", modifiedBy: "Paritosh Unakar", modifiedOn: "09-May-2025 13:42" },
  { id: 3, employee: "Zeel Sathwara", policyName: "Standard Policy (FTE)", startDate: "2025-01-01", endDate: "2026-01-01", modifiedBy: "Zeel Sathwara", modifiedOn: "09-Jun-2025 13:40" },
  { id: 4, employee: "Aditya Jangam", policyName: "Standard Policy (FTE)", startDate: "2025-06-09", endDate: "2026-06-29", modifiedBy: "Aditya Jangam", modifiedOn: "09-Jun-2025 20:10" },
  { id: 5, employee: "Tushar Mishra", policyName: "Standard Policy (FTE)", startDate: "2025-06-02", endDate: "2026-07-01", modifiedBy: "Tushar Mishra", modifiedOn: "10-Jun-2025 19:11" },
  { id: 6, employee: "Paritosh Unakar", policyName: "Standard Policy (FTE)", startDate: "2025-06-01", endDate: "2027-06-30", modifiedBy: "Paritosh Unakar", modifiedOn: "30-Jun-2025 20:53" },
  { id: 7, employee: "Vrushti Patel", policyName: "Standard Policy (FTE)", startDate: "2025-07-01", endDate: "2026-02-02", modifiedBy: "Vrushti Patel", modifiedOn: "01-Jul-2025 19:24" },
  { id: 8, employee: "Nancy Sheth", policyName: "Standard Policy (FTE)", startDate: "2025-06-17", endDate: "2025-12-31", modifiedBy: "Nancy Sheth", modifiedOn: "08-Jul-2025 18:24" },
]

export function UserPolicyMappingPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<UserPolicyMapping | null>(null)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [userPolicyMappings, setUserPolicyMappings] = useState<UserPolicyMapping[]>(initialUserPolicyMappings)
  const { toast } = useToast()

  const handleEdit = (mapping: UserPolicyMapping) => {
    setEditingMapping(mapping)
    setIsAddModalOpen(true)
  }

  const handleSave = (data: any) => {
    const now = new Date();
    const modifiedOn = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (editingMapping) {
      // Update existing mapping
      setUserPolicyMappings(prev => prev.map(mapping => mapping.id === editingMapping.id ? { ...mapping, ...data, modifiedOn } : mapping))
      toast({
        title: "Success",
        description: `Mapping for "${data.employee}" updated successfully!`,
        duration: 3000,
      })
    } else {
      // Add new mapping
      const newId = Math.max(...userPolicyMappings.map(mapping => mapping.id), 0) + 1; // Generate a new ID
      setUserPolicyMappings(prev => [...prev, { ...data, id: newId, modifiedBy: "Current User", modifiedOn }]);
      toast({
        title: "Success",
        description: `Mapping for "${data.employee}" added successfully!`,
        duration: 3000,
      })
    }
    setIsAddModalOpen(false)
    setEditingMapping(null)
  }

  const totalPages = Math.ceil(userPolicyMappings.length / parseInt(pageSize))
  const startIndex = (currentPage - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const currentData = userPolicyMappings.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            User - Policy Mapping
          </CardTitle>
          <Button onClick={() => { setEditingMapping(null); setIsAddModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Mapping
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Employee</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Policy Name</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Start Date</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">End Date</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Modified By</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">Modified On</TableHead>
              <TableHead className="w-20 font-semibold text-gray-700 dark:text-gray-200 p-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((mapping) => (
              <TableRow key={mapping.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <TableCell className="font-medium text-gray-900 dark:text-gray-100 p-4">{mapping.employee}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-200 p-4">{mapping.policyName}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-200 p-4">{mapping.startDate}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-200 p-4">{mapping.endDate}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-200 p-4">{mapping.modifiedBy}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-200 p-4">{mapping.modifiedOn}</TableCell>
                <TableCell className="p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(mapping)}
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={userPolicyMappings.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </CardContent>

      <AddMappingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        initialData={editingMapping}
      />
    </div>
  )
}
