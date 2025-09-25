"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { Badge } from "../../ui/badge"

interface LeaveBalance {
  type: string
  total: number
  used: number
  remaining: number
}

interface UserLeaveSummary {
  id: number
  name: string
  policy: string
  leaveBalances: LeaveBalance[]
}

const mockUserLeaveSummaries: UserLeaveSummary[] = [
  {
    id: 1,
    name: "Abdul Bilal",
    policy: "Standard Policy (FTE)",
    leaveBalances: [
      { type: "Casual Leave (CL) (2025)", total: 7, used: 2, remaining: 5 },
      { type: "Sick Leave (SL) (2025)", total: 5, used: 1, remaining: 4 },
      { type: "Work From Home (WFH) (2025)", total: 10, used: 3, remaining: 7 },
      { type: "Comp-Off (2025)", total: 2, used: 0, remaining: 2 },
    ]
  },
  {
    id: 2,
    name: "Aditya Jangam",
    policy: "Standard Policy (FTE)",
    leaveBalances: [
      { type: "Casual Leave (CL) (2025)", total: 7, used: 3, remaining: 4 },
      { type: "Sick Leave (SL) (2025)", total: 5, used: 0, remaining: 5 },
      { type: "Work From Home (WFH) (2025)", total: 10, used: 5, remaining: 5 },
      { type: "Comp-Off (2025)", total: 2, used: 1, remaining: 1 },
    ]
  },
  {
    id: 3,
    name: "Aksh Desai",
    policy: "Standard Policy (FTE)",
    leaveBalances: [
      { type: "Casual Leave (CL) (2025)", total: 7, used: 2, remaining: 5 },
      { type: "Sick Leave (SL) (2025)", total: 5, used: 2, remaining: 3 },
      { type: "Work From Home (WFH) (2025)", total: 10, used: 1, remaining: 9 },
      { type: "Comp-Off (2025)", total: 2, used: 0, remaining: 2 },
    ]
  },
  {
    id: 4,
    name: "Akshay Supare",
    policy: "Executive Policy (FTE)", // Changed policy for demonstration
    leaveBalances: [
      { type: "Casual Leave (CL) (2025)", total: 10, used: 2, remaining: 8 },
      { type: "Sick Leave (SL) (2025)", total: 7, used: 1, remaining: 6 },
      { type: "Work From Home (WFH) (2025)", total: 15, used: 3, remaining: 12 },
      { type: "Comp-Off (2025)", total: 5, used: 0, remaining: 5 },
    ]
  },
  {
    id: 5,
    name: "Aryan Ginoya",
    policy: "Standard Policy (FTE)",
    leaveBalances: [
      { type: "Casual Leave (CL) (2025)", total: 7, used: 2, remaining: 5 },
      { type: "Sick Leave (SL) (2025)", total: 5, used: 1, remaining: 4 },
      { type: "Work From Home (WFH) (2025)", total: 10, used: 3, remaining: 7 },
      { type: "Comp-Off (2025)", total: 2, used: 0, remaining: 2 },
    ]
  },
  {
    id: 6,
    name: "Bankit Dhameliya",
    policy: "Intern Policy", // Changed policy for demonstration
    leaveBalances: [
      { type: "Leave Without Pay (LWP) (2025)", total: 999, used: 10, remaining: 989 },
    ]
  },
]

export function LeaveSummaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [openLeaveTypes, setOpenLeaveTypes] = useState<Record<number, string[]>>({}) // { userId: [leaveType, ...]}

  const uniquePolicies = useMemo(() => {
    const policies = new Set(mockUserLeaveSummaries.map(user => user.policy))
    return ["All", ...Array.from(policies)].sort()
  }, [])

  const filteredUsers = useMemo(() => {
    let users = mockUserLeaveSummaries.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (activeTab !== "all") {
      users = users.filter(user => user.policy.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '') === activeTab)
    }
    return users
  }, [searchTerm, activeTab])

  const toggleLeaveType = (userId: number, leaveType: string) => {
    setOpenLeaveTypes(prev => {
      const currentOpen = prev[userId] || []
      return {
        ...prev,
        [userId]: currentOpen.includes(leaveType)
          ? currentOpen.filter(type => type !== leaveType)
          : [...currentOpen, leaveType]
      }
    })
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          User Leave Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search by user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-start rounded-md bg-gray-100 dark:bg-gray-700 h-auto p-1 overflow-x-auto whitespace-nowrap">
            {uniquePolicies.map(policy => (
              <TabsTrigger
                key={policy}
                value={policy.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')} // Create a valid ID from policy name
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {policy} ({policy === "All" ? mockUserLeaveSummaries.length : mockUserLeaveSummaries.filter(u => u.policy === policy).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {uniquePolicies.map(policy => (
            <TabsContent
              key={policy}
              value={policy.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')}
              className="mt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.filter(user => policy === "All" || user.policy === policy).map(user => (
                  <Card key={user.id} className="border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                    <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-600">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.policy}</p>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {user.leaveBalances.map((balance, index) => (
                        <Collapsible
                          key={index}
                          open={(openLeaveTypes[user.id] || []).includes(balance.type)}
                          onOpenChange={() => toggleLeaveType(user.id, balance.type)}
                          className="border border-gray-100 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700"
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                            <div className="flex items-center gap-2">
                              {(openLeaveTypes[user.id] || []).includes(balance.type) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span>{balance.type}</span>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="grid grid-cols-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">TOTAL</p>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">{balance.total}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">USED</p>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">{balance.used}</Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">REMAINING</p>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">{balance.remaining}</Badge>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </div>
  )
}
