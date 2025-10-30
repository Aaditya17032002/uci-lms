"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Plus, Edit } from 'lucide-react'
import { Pagination } from "../../common/pagination"
import { AddMappingModal } from "../../modals/add-mapping-modal"
import { useToast } from "../../hooks/use-toast"
import axios from "axios"

interface UserPolicyMapping {
  id: number
  employee: string
  policyName: string
  startDate: string
  endDate: string
  modifiedBy: string
  modifiedOn: string
}

type ApiUserPolicyMapping = {
  userID: number
  userName: string
  policyID: number
  policyName: string
  startDate: string
  endDate: string
  modifiedBy: string
  modifiedOn: string
}

type ApiUser = {
  userID: number
  userName: string
}

type ApiPolicyRow = {
  policyID: number
  policyName: string
}

export function UserPolicyMappingPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<UserPolicyMapping | null>(null)
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [userPolicyMappings, setUserPolicyMappings] = useState<UserPolicyMapping[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [userNameToId, setUserNameToId] = useState<Map<string, number>>(new Map())
  const [policyNameToId, setPolicyNameToId] = useState<Map<string, number>>(new Map())
  const [availableUsers, setAvailableUsers] = useState<{ id: number, name: string }[]>([])
  const [availablePolicies, setAvailablePolicies] = useState<{ id: number, name: string }[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[UserPolicyMapping] Fetching mappings, users, and policies...")
      const [mappingsResp, usersResp, policiesResp] = await Promise.all([
        axios.get<ApiUserPolicyMapping[]>("https://localhost:7080/api/Leave/GetUserPolicyMapping", { withCredentials: true }),
        axios.get<ApiUser[]>("https://localhost:7080/api/Leave/GetAllUsersWithoutPolicy", { withCredentials: true }),
        axios.get<ApiPolicyRow[]>("https://localhost:7080/api/Leave/GetAllActiveLeavePolicies", { withCredentials: true }),
      ])

      console.log("[UserPolicyMapping] Raw mappings:", mappingsResp.data)
      console.log("[UserPolicyMapping] Raw users:", usersResp.data)
      console.log("[UserPolicyMapping] Raw policies:", policiesResp.data)

      const mappings: UserPolicyMapping[] = (mappingsResp.data || []).map((m) => ({
        id: m.userID,
        employee: m.userName,
        policyName: m.policyName,
        startDate: m.startDate?.split("T")[0] || "",
        endDate: m.endDate?.split("T")[0] || "",
        modifiedBy: m.modifiedBy,
        modifiedOn: new Date(m.modifiedOn).toLocaleString(),
      }))
      setUserPolicyMappings(mappings)

      // Build user name -> id map from HRAdmin endpoint, try common field names
      const uMap = new Map<string, number>()
      const usersArr: { id: number, name: string }[] = []
      for (const u of usersResp.data || []) {
        const name = (u.userName || "").toString()
        const id = Number(u.userID)
        if (name && !Number.isNaN(id)) {
          uMap.set(name, id)
          usersArr.push({ id, name })
        }
      }
      setUserNameToId(uMap)
      setAvailableUsers(usersArr)

      // Build policy name -> id map from policy rows
      const pMap = new Map<string, number>()
      const policiesArr: { id: number, name: string }[] = []
      for (const p of policiesResp.data || []) {
        if (p.policyName && p.policyID) pMap.set(p.policyName, p.policyID)
        if (p.policyName && p.policyID) policiesArr.push({ id: p.policyID, name: p.policyName })
      }
      setPolicyNameToId(pMap)
      setAvailablePolicies(policiesArr)
      console.log("[UserPolicyMapping] Built name->id maps", { users: Array.from(uMap.entries()), policies: Array.from(pMap.entries()) })
    } catch (e: any) {
      console.error("[UserPolicyMapping] Load failed:", e)
      setError(e?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (mapping: UserPolicyMapping) => {
    setEditingMapping(mapping)
    setIsAddModalOpen(true)
  }

  const handleSave = async (data: any) => {
    try {
      // Resolve names from form or fall back to the editing record values
      const selectedUserName: string | undefined = (data.employee || editingMapping?.employee)
      const selectedPolicyName: string | undefined = (data.policyName || editingMapping?.policyName)

      // Map display names to IDs with fallbacks
      const userID = (selectedUserName ? userNameToId.get(selectedUserName) : undefined) ?? editingMapping?.id
      const policyID = selectedPolicyName ? policyNameToId.get(selectedPolicyName) : undefined

      if (!userID || !policyID) {
        toast({
          title: "Missing IDs",
          description: "Could not resolve User or Policy ID. Please ensure valid selections.",
          duration: 4000,
          className: "border border-red-300",
        })
        return
      }

      const payload = {
        userID,
        policyID,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : (editingMapping?.startDate ? new Date(editingMapping.startDate).toISOString() : new Date().toISOString()),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : (editingMapping?.endDate ? new Date(editingMapping.endDate).toISOString() : new Date().toISOString()),
        modUser: 0,
      }
      // Validate date ordering before calling API
      if (new Date(payload.startDate) > new Date(payload.endDate)) {
        toast({
          title: "Invalid Dates",
          description: "Start date must be earlier than end date.",
          duration: 4000,
          className: "border border-red-300",
        })
        return
      }
      console.log("[UserPolicyMapping] POST payload:", payload)

      await axios.post("https://localhost:7080/api/Leave/SaveUserPolicyMapping", payload, { withCredentials: true })

      toast({
        title: "Success",
        description: editingMapping ? `Mapping for "${selectedUserName}" updated successfully!` : `Mapping for "${selectedUserName}" added successfully!`,
        duration: 3000,
        className: "border border-green-300",
      })

      await loadData()
    } catch (e: any) {
      console.error("[UserPolicyMapping] Save failed:", e)
      toast({
        title: "Error",
        description: e?.message || "Failed to save mapping",
        duration: 4000,
        className: "border border-red-300",
      })
    } finally {
      setIsAddModalOpen(false)
      setEditingMapping(null)
    }
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
        {loading && (
          <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Loading mappings...</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
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
        users={availableUsers}
        policies={availablePolicies}
      />
    </div>
  )
}
