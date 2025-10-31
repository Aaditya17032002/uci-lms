"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Search, Info, X } from "lucide-react"
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
  const [users, setUsers] = useState<UserLeaveSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserLeaveSummary | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get<ApiLeaveSummaryItem[]>("/Leave/GetUserLeaveSummary")
        const rows = res.data || []

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
          const total = (r.annualAlowance ?? (r.usedLeaves + r.remainingLeaves)) || 0
          grouped.get(key)!.leaveBalances.push({
            type: `${r.leaveTypeName} (${r.year})`,
            total,
            used: r.usedLeaves,
            remaining: r.remainingLeaves,
          })
        }

        setUsers(Array.from(grouped.values()))
      } catch (err) {
        console.error("LeaveSummary fetch error", err)
        setError("Failed to load leave summary.")
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  if (loading) return <p className="p-4 text-gray-600">Loading...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-0">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          User Leave Summary
        </CardTitle>
        <div className="relative mt-3 sm:mt-0 w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>

      {/* User Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {filteredUsers.length === 0 ? (
    <p className="text-sm text-gray-600 col-span-full text-center">
      No users found.
    </p>
  ) : (
    filteredUsers.map((user) => (
      <Card
        key={user.id}
        className="p-3 hover:shadow-md transition-all dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        {/* Header Row: Name + Policy on left, Info icon on right */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.policy}
            </p>
          </div>
          <button
            onClick={() => setSelectedUser(user)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            aria-label="View details"
          >
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </Card>
    ))
  )}
</div>


      {/* Popup Modal */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          ></div>

          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[90%] max-w-md p-6 z-10">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {selectedUser.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Policy: {selectedUser.policy}
            </p>

            <div className="space-y-3">
              {selectedUser.leaveBalances.map((b, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2 last:border-none text-sm"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">{b.type}</span>
                  <div className="flex gap-3 text-xs sm:text-sm">
                    <span className="text-gray-500">Total: {b.total}</span>
                    <span className="text-orange-600">Used: {b.used}</span>
                    <span className="text-green-600">Left: {b.remaining}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
