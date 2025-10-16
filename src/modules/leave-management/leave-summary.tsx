"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { Badge } from "../../ui/badge"
import { apiClient } from "../../lib/apiClient"

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

interface ApiLeaveSummaryItem {
  userName: string
  policyName: string
  leaveTypeName: string
  year: number
  annualAlowance: number | null
  monthlyLimit: number | null
  usedLeaves: number
  remainingLeaves: number
  carriedLeaves: number
  carriedLeavesExpiry: string
}

export function LeaveSummaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [openLeaveTypes, setOpenLeaveTypes] = useState<Record<number, string[]>>({}) // { userId: [leaveType, ...]}
  const [users, setUsers] = useState<UserLeaveSummary[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<ApiLeaveSummaryItem[]>("/Leave/GetUserLeaveSummary")
        const rows = res.data || []

        // Group by userName + policyName
        const grouped = new Map<string, UserLeaveSummary>()
        let autoId = 1
        for (const r of rows) {
          const key = `${r.userName}|||${r.policyName}`
          if (!grouped.has(key)) {
            grouped.set(key, {
              id: autoId++,
              name: r.userName,
              policy: r.policyName,
              leaveBalances: [],
            })
          }
          const total = (r.annualAlowance ?? (Number(r.usedLeaves) + Number(r.remainingLeaves))) || 0
          const typeLabel = `${r.leaveTypeName} (${r.year})`
          grouped.get(key)!.leaveBalances.push({
            type: typeLabel,
            total: Number(total),
            used: Number(r.usedLeaves || 0),
            remaining: Number(r.remainingLeaves || 0),
          })
        }

        // Sort for consistent UI
        const normalized = Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name))
        setUsers(normalized)
      } catch (e: any) {
        // Fallback to empty state and show error briefly
        setError("Failed to load leave summary")
        // eslint-disable-next-line no-console
        console.error("LeaveSummary fetch error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  const uniquePolicies = useMemo(() => {
    const policies = new Set(users.map(user => user.policy))
    return ["All", ...Array.from(policies)].sort()
  }, [users])

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (activeTab !== "all") {
      filtered = filtered.filter(user => user.policy.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '') === activeTab)
    }
    return filtered
  }, [users, searchTerm, activeTab])

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

  if (loading) {
    return <div className="space-y-6"><CardHeader className="p-0"><CardTitle className="text-xl font-semibold">User Leave Summary</CardTitle></CardHeader><CardContent className="p-0"><p className="text-sm text-gray-600">Loading...</p></CardContent></div>
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          User Leave Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}
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
                {policy} ({policy === "All" ? users.length : users.filter(u => u.policy === policy).length})
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
