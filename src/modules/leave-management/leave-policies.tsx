"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from "../../ui/badge"
import axios from "axios"

interface Policy {
  id: number
  name: string
  description: string
  status: string
  createdBy: string
  leaveTypes: string[]
}

type LeavePolicyRow = {
  policyID: number
  policyName: string
  leaveTypeID: number
  leaveName?: string
  description: string
  isActive: boolean
  createdBy: string
  createdOn?: string
  modifiedBy?: string
  modifiedOn?: string
}

type LeaveType = {
  leaveTypeId: number
  leaveName: string
  description?: string
  colorCode?: string
  isActive?: boolean
  createdBy?: string
  modifiedBy?: string
}

export function LeavePoliciesPage() {
  const [openPolicies, setOpenPolicies] = useState<number[]>([]) // will open first after load
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("[LeavePolicies] Fetching policies and leave types...")
        const [policiesResp, leaveTypesResp] = await Promise.all([
          axios.get<LeavePolicyRow[]>("https://localhost:7080/api/Leave/GetLeavePolicies", { withCredentials: true }),
          axios.get<LeaveType[]>("https://localhost:7080/api/Leave/GetLeaveTypes", { withCredentials: true }),
        ])

        console.log("[LeavePolicies] Raw policies response:", policiesResp.data)
        console.log("[LeavePolicies] Raw leave types response:", leaveTypesResp.data)

        const policyRows: LeavePolicyRow[] = Array.isArray(policiesResp.data) ? policiesResp.data : []
        const leaveTypes: LeaveType[] = Array.isArray(leaveTypesResp.data) ? leaveTypesResp.data : []

        // Build a map for leaveTypeId -> leaveName
        const leaveTypeIdToName = new Map<number, string>()
        for (const lt of leaveTypes) {
          leaveTypeIdToName.set(lt.leaveTypeId, lt.leaveName)
        }
        console.log("[LeavePolicies] leaveTypeIdToName:", Object.fromEntries(leaveTypeIdToName))

        // Group rows by policyID
        const grouped = new Map<number, Policy>()
        for (const row of policyRows) {
          const existing = grouped.get(row.policyID)
          const leaveTypeName = row.leaveName || leaveTypeIdToName.get(row.leaveTypeID)
          const safeLeaveTypeName = leaveTypeName ?? `Type #${row.leaveTypeID}`

          if (!existing) {
            grouped.set(row.policyID, {
              id: row.policyID,
              name: row.policyName,
              description: row.description,
              status: row.isActive ? "Active" : "Inactive",
              createdBy: row.createdBy,
              leaveTypes: [safeLeaveTypeName],
            })
          } else {
            // Avoid duplicates
            if (!existing.leaveTypes.includes(safeLeaveTypeName)) {
              existing.leaveTypes.push(safeLeaveTypeName)
            }
          }
        }

        const finalPolicies = Array.from(grouped.values())
        console.log("[LeavePolicies] Processed policies:", finalPolicies)
        setPolicies(finalPolicies)

        // Open the first policy by default
        if (finalPolicies.length > 0) {
          setOpenPolicies([finalPolicies[0].id])
        }
      } catch (e: any) {
        console.error("[LeavePolicies] Failed to fetch:", e)
        setError(e?.message || "Failed to load leave policies")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const togglePolicy = (id: number) => {
    setOpenPolicies(prev =>
      prev.includes(id) ? prev.filter(policyId => policyId !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Leave Policies Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {loading && (
          <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Loading policies...</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        {!loading && !error && policies.map(policy => (
          <Collapsible
            key={policy.id}
            open={openPolicies.includes(policy.id)}
            onOpenChange={() => togglePolicy(policy.id)}
            className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium text-left text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center gap-2">
                {openPolicies.includes(policy.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>{policy.name}</span>
              </div>
              <div className="ml-4">
                <Badge
                  variant="outline"
                  className={
                    policy.status === "Active"
                      ? "border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20"
                      : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"
                  }
                >
                  {policy.status}
                </Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">Description</p>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">{policy.description}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">Created By</p>
                  <p className="mt-1 text-gray-900 dark:text-gray-100 font-semibold">{policy.createdBy}</p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">Leave Types</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {policy.leaveTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </div>
  )
}
