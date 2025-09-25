"use client"
 
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  BarChart3
} from 'lucide-react'
import { LeaveHistoryModal } from "../../modals/leave-history-modal"
import { useState } from "react"
import { useNavigate } from "react-router-dom" 
 
interface EmployeeDashboardProps {
  userRoles: string[]
}
 
export function EmployeeDashboard({ userRoles }: EmployeeDashboardProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState("upcoming")
  const router = useNavigate()
 
  const leaveOptions = [
    { value: "upcoming", label: "Sept 8, 2025 -- Sick Leave", status: "current" },
    { value: "aug1-5", label: "Aug 1, 2025-Aug 5, 2025 -- Casual Leave", status: "completed" },
    { value: "aug18", label: "Aug 18, 2025  -- Casual Leave Half Day", status: "submitted" }
  ]

  
 
  const getProgressStages = () => {
    const currentLeave = leaveOptions.find(option => option.value === selectedLeave)
    
    if (currentLeave?.status === "completed") {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-blue-500 hidden md:block"></div>
          {["Submitted", "Manager Approval", "HR Approval", "Approved"].map((stage, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-blue-600">{stage}</span>
            </div>
          ))}
        </div>
      )
    } else if (currentLeave?.status === "submitted") {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 hidden md:block"></div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Submitted</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-orange-500">Manager Approval</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">HR Approval</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Approved</span>
          </div>
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 hidden md:block"></div>
          <div className="absolute top-4 left-8 w-1/3 h-0.5 bg-blue-500 hidden md:block"></div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Submitted</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Manager Approval</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-orange-500">HR Approval</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Approved</span>
          </div>
        </div>
      )
    }
  }
 
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Pending Timesheet */}
        <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black-600">3</div>
              <div className="text-sm text-gray-600">Pending Timesheet</div>
            </div>
          </div>
        </div>

        
 
        {/* Leaves Remaining */}
        <div className="bg-white rounded-lg p-4 border-2 border-green-200 relative">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-black-600">7 SL, 6 CL</div>
              <div className="text-sm text-gray-600">Total Leaves Remaining</div>
            </div>
          </div>
        </div>
 
        {/* This Week */}
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black-600">32.5h</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Leave Approval Progress + Approvers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Leave Approval Progress</h3>
            <Select value={selectedLeave} onValueChange={setSelectedLeave}>
              <SelectTrigger className="w-full md:w-[290px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leaveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {getProgressStages()}
        </div>
 
        <Card className="md:col-span-4 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-black-800">
              <Users className="w-4 h-4" />
              Approvers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-500">PU</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Primary Approver</p>
                  <p className="text-sm font-semibold text-gray-600">Paritosh Unakar</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-500">NA</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Secondary Approver</p>
                  <p className="text-sm font-semibold text-gray-600">Not Assigned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
 
      {/* Recent Activity + Today’s Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">You applied for casual leave</p>
                <p className="text-xs text-gray-500">HR Pending approval • 2 hours ago</p>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                pending
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">You submitted July's 4th Week Timesheet</p>
                <p className="text-xs text-gray-500">Timesheet submitted • 2 days ago</p>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                submitted
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Your July's 3 Week Timesheet approved</p>
                <p className="text-xs text-gray-500">Timesheet Approved • 4 days ago</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                approved
              </Badge>
            </div>
          </div>
        </div>
 
        <Card className="md:col-span-4 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-black-800">
              <Calendar className="w-4 h-4" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-2">
              <div className="text-4xl font-bold text-black-700">7</div>
              <p className="text-base text-gray-600">September</p>
              <p className="text-base text-gray-300">2025</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <span className="font-medium">UI revamp meeting</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <span className="font-medium">ACS chatbot discussion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
 
      {/* My Engagements */}
      <div className="grid grid-cols-1">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-black-600" />
            <h3 className="font-semibold text-black-800">My Engagements</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
              <p className="font-semibold text-gray-800">Smart Attendance System</p>
              <p className="text-sm text-gray-400">Uses facial recognition and geofencing to automate employee attendance tracking.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-400">
              <p className="font-semibold text-gray-800">AI Chatbot for Customer Support</p>
              <p className="text-sm text-gray-400">A machine learning-powered assistant that answers user queries 24/7 across platforms.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
              <p className="font-semibold text-gray-800">IoT-Based Home Automation</p>
              <p className="text-sm text-gray-400">Controls lights, appliances, and security remotely via a mobile app.</p>
            </div>
          </div>
          <br />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400">
              <p className="font-semibold text-gray-800">Blockchain Voting Platform</p>
              <p className="text-sm text-gray-400">Enables secure and transparent online voting using decentralized ledger technology.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-400">
              <p className="font-semibold text-gray-800">E-commerce Product Recommendation Engine</p>
              <p className="text-sm text-gray-400">Suggests personalized products using user behavior and purchase history via machine learning.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400">
              <p className="font-semibold text-gray-800">Real-Time Traffic Monitoring System</p>
              <p className="text-sm text-gray-400">Analyzes live traffic data using computer vision to optimize signal timings and reduce congestion.</p>
            </div>
          </div>
        </div>
      </div>
 
      <LeaveHistoryModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </div>
  )
}