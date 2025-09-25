"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from "../../ui/badge"

interface Policy {
  id: number
  name: string
  description: string
  status: string
  createdBy: string
  leaveTypes: string[]
}

const mockPolicies: Policy[] = [
  {
    id: 1,
    name: "Intern Policy",
    description: "For Interns/Trainees - Only LWP Allowed, No Approval Required",
    status: "Active",
    createdBy: "Paritosh Unakar",
    leaveTypes: ["Leave Without Pay (LWP)"]
  },
  {
    id: 2,
    name: "Standard Policy (FTE)",
    description: "Standard Leave Policy for Full-Time Employees",
    status: "Active",
    createdBy: "Zeel Sathwara",
    leaveTypes: ["Casual Leave (CL)", "Sick Leave (SL)", "Work From Home (WFH)"]
  },
  {
    id: 3,
    name: "Executive Policy (FTE)",
    description: "Enhanced Leave Policy for Executive Full-Time Employees",
    status: "Active",
    createdBy: "Tushar Mishra",
    leaveTypes: ["Casual Leave (CL)", "Sick Leave (SL)", "Work From Home (WFH)", "Comp-Off"]
  },
  {
    id: 4,
    name: "Probation Policy",
    description: "Leave Policy for Employees on Probation Period",
    status: "Active",
    createdBy: "Paritosh Unakar",
    leaveTypes: ["Sick Leave (SL)"]
  },
  {
    id: 5,
    name: "Contract-Employee Policy",
    description: "Leave Policy for Contractual Employees",
    status: "Active",
    createdBy: "Zeel Sathwara",
    leaveTypes: ["Leave Without Pay (LWP)", "Work From Home (WFH)"]
  },
]

export function LeavePoliciesPage() {
  const [openPolicies, setOpenPolicies] = useState<number[]>([1]) // Keep first policy open by default

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
        {mockPolicies.map(policy => (
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
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <p><strong className="text-gray-900 dark:text-gray-100">Policy Name:</strong> {policy.name}</p>
                  <p><strong className="text-gray-900 dark:text-gray-100">Description:</strong> {policy.description}</p>
                  <p><strong className="text-gray-900 dark:text-gray-100">Status:</strong> <Badge variant="outline" className={policy.status === "Active" ? "border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20" : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"}>{policy.status}</Badge></p>
                </div>
                <div>
                  <p><strong className="text-gray-900 dark:text-gray-100">Created By:</strong> {policy.createdBy}</p>
                  <p className="mt-2"><strong className="text-gray-900 dark:text-gray-100">Leave Types:</strong></p>
                  <div className="flex flex-wrap gap-2 mt-1">
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
