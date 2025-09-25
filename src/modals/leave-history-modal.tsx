"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Calendar } from "lucide-react"

interface LeaveHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const leaveHistory = [
  {
    id: 1,
    type: "Casual Leave",
    startDate: "2024-01-15",
    endDate: "2024-01-16",
    days: 2,
    reason: "Personal work",
    status: "approved",
    appliedDate: "2024-01-10",
  },
  {
    id: 2,
    type: "Sick Leave",
    startDate: "2024-01-08",
    endDate: "2024-01-08",
    days: 1,
    reason: "Fever",
    status: "approved",
    appliedDate: "2024-01-08",
  },
  {
    id: 3,
    type: "Casual Leave",
    startDate: "2024-01-25",
    endDate: "2024-01-26",
    days: 2,
    reason: "Family function",
    status: "pending_manager_approval",
    appliedDate: "2024-01-20",
  },
  {
    id: 4,
    type: "Sick Leave",
    startDate: "2024-02-05",
    endDate: "2024-02-06",
    days: 2,
    reason: "Medical checkup",
    status: "pending_hr_approval",
    appliedDate: "2024-02-01",
  },
  {
    id: 5,
    type: "Casual Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-15",
    days: 1,
    reason: "Personal work",
    status: "rejected",
    appliedDate: "2024-02-10",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
    case "pending_manager_approval":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Pending Manager Approval</Badge>
    case "pending_hr_approval":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Pending HR Approval</Badge>
    case "submitted":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Submitted</Badge>
    case "cancelled":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Cancelled</Badge>
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function LeaveHistoryModal({ isOpen, onClose }: LeaveHistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Leave History
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {leaveHistory.map((leave) => (
            <div key={leave.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{leave.type}</h3>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Duration</p>
                      <p>
                        {leave.startDate} to {leave.endDate} ({leave.days} day{leave.days > 1 ? "s" : ""})
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Applied Date</p>
                      <p>{leave.appliedDate}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium text-sm text-gray-600">Reason</p>
                    <p className="text-sm text-gray-800">{leave.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
