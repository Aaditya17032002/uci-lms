// == responsive ==


"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { AlertTriangle, Calendar, Building, TrendingUp, AlertOctagon } from "lucide-react"
import { LeaveHistoryModal } from "../../modals/leave-history-modal"
import { useState, useEffect } from "react"
import { apiClient } from "../../lib/apiClient"

interface HRDashboardProps {
  userRoles: string[]
}

export function HRDashboard({ userRoles }: HRDashboardProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [pendingLeaveApprovalsCount, setPendingLeaveApprovalsCount] = useState(0)
  const [missingPrimaryApproverCount, setMissingPrimaryApproverCount] = useState(0)
  const [missingSecondaryApproverCount, setMissingSecondaryApproverCount] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch pending leave approvals count
        const leaveApprovalsResponse = await apiClient.post("/Leave/hr-approvals")
        if (leaveApprovalsResponse.data) {
          setPendingLeaveApprovalsCount(leaveApprovalsResponse.data.length || 0)
        }

        // Fetch missing approver counts
        const approverCountResponse = await apiClient.get("/Dashboard/getmissingapprovercount")
        if (approverCountResponse.data) {
          setMissingPrimaryApproverCount(approverCountResponse.data.noApproverCount || 0)
          setMissingSecondaryApproverCount(approverCountResponse.data.noSecApproverCount || 0)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black-600">{pendingLeaveApprovalsCount}</div>
              <div className="text-sm text-gray-500">Pending Leave Approvals</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-black-600">{missingPrimaryApproverCount}</div>
              <div className="text-sm text-gray-500">Missing Primary Approver</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black-600">{missingSecondaryApproverCount}</div>
              <div className="text-sm text-gray-500">Missing Secondary Approver</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Office Attendance Overview */}
        <div className="lg:col-span-8">
          <Card className="border-slate-200 shadow-sm h-full w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <Building className="w-5 h-5" />
                Office Attendance Overview
              </CardTitle>
              <p className="text-sm text-slate-600">Company-wide Attendance Status</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-sm">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-2xl font-bold text-black-600">142</div>
                  </div>
                  <p className="text-sm font-semibold text-black-800">Present</p>
                  <p className="text-xs text-gray-600">In office today</p>
                </div>
                <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-sm">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-2xl font-bold text-black-600">18</div>
                  </div>
                  <p className="text-sm font-semibold text-black-800">On Leave</p>
                  <p className="text-xs text-gray-600">Various leave types</p>
                </div>
                <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-sm">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-2xl font-bold text-black-600">2</div>
                  </div>
                  <p className="text-sm font-semibold text-black-800">Work From Home</p>
                  <p className="text-xs text-gray-600">Remote workers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 border-slate-200">

          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">John Smith applied for sick leave</p>
                <p className="text-xs text-gray-500">Pending HR approval • 2 hours ago</p>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                pending
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Emily Brown overtime request</p>
                <p className="text-xs text-gray-500">Rejected • 1 day ago</p>
              </div>
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
                Rejected
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Jake Thomas casual leave request</p>
                <p className="text-xs text-gray-500">approved • 2 days ago</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                approved
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Max Smith casual leave request</p>
                <p className="text-xs text-gray-500">approved • 3 days ago</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                approved
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <LeaveHistoryModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />
    </div>
  )
}
