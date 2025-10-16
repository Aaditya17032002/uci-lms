  "use client"

  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
  import { Badge } from "../ui/badge"
  import { Textarea } from "../ui/textarea"
  import { Button } from "../ui/button"
  import { CheckCircle, XCircle, Clock } from "lucide-react"

  interface LeaveReviewModalEmpProps {
    isOpen: boolean
    onClose: () => void
    leaveRequest: any // Ideally define a proper type
    isViewOnly?: boolean
  }

  export function LeaveReviewModalEmp({
    isOpen,
    onClose,
    leaveRequest,
    isViewOnly = false
  }: LeaveReviewModalEmpProps) {

    // Calculate total leave days from leaveDayDetails
    const totalDays = leaveRequest?.leaveDayDetails?.reduce((sum: number, d: any) => {
      if (d.dayType.toLowerCase() === "full day") return sum + 1
      if (d.dayType.toLowerCase() === "first-half" || d.dayType.toLowerCase() === "second-half") return sum + 0.5
      return sum
    }, 0) || 0

    // Helper for status badge
    const getApprovalBadge = (status: string) => {
      switch (status.toLowerCase()) {
        case "approved":
          return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
        case "pending":
          return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
        case "rejected":
          return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
        case "pending_manager_approval":
          return <Badge className="bg-orange-100 ..."><Clock /> Pending Manager Approval</Badge>
        case "pending_hr_approval":
          return (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending HR Approval
            </Badge>
          )
        default:
          return <Badge variant="outline">{status}</Badge>
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-6 pt-6 flex flex-row items-center justify-between">
            <div className="flex items-center ">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              </DialogTitle>
              <Badge className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 text-sm font-medium">
                {leaveRequest?.type || "Leave"}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 px-6">
            {/* Applied On */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">Applied On:</strong>{" "}
              {leaveRequest?.appliedDate ? leaveRequest?.appliedDate: "-"}
            </div>

            {/* If leave is cancelled, show a single info box */}
            {leaveRequest?.isCancelled ? (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-700 shadow-sm">
                <div className="font-medium text-gray-900 dark:text-white text-base">
                  User has already cancelled their leave
                </div>
              </div>
            ) : (
              <>
                {/* Manager Approval */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
                  <div className="font-medium text-gray-900 dark:text-white text-base flex items-center gap-2">
                    Manager Approval {getApprovalBadge(leaveRequest?.managerResponse || "pending_manager_approval")}
                  </div>
                  {leaveRequest?.managerComment &&
                    leaveRequest.managerComment.trim() !== "" &&
                    leaveRequest.managerResponse?.toLowerCase() !== "pending" && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong>Comment:</strong>{" "}
                          <span className="text-gray-700 dark:text-gray-300">
                            {leaveRequest.managerComment}
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* HR Approval */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
                  <div className="font-medium text-gray-900 dark:text-white text-base flex items-center gap-2">
                    HR Approval {getApprovalBadge(leaveRequest?.hrResponse || "Pending")}
                  </div>
                  {leaveRequest?.hrComment &&
                    leaveRequest.hrComment.trim() !== "" &&
                    leaveRequest.hrResponse?.toLowerCase() !== "pending" && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong>Comment:</strong>{" "}
                          <span className="text-gray-700 dark:text-gray-300">
                            {leaveRequest.hrComment}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}
            {/* Duration and Reason */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 shadow-sm">
              <div className="font-medium text-gray-900 dark:text-white text-base">
                Duration: {totalDays} {totalDays === 1 ? "Day" : "Days"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {leaveRequest?.startDate ? new Date(leaveRequest.startDate).toLocaleDateString() : "-"} -{" "}
                {leaveRequest?.endDate ? new Date(leaveRequest.endDate).toLocaleDateString() : "-"}
              </div>
              <div className="text-sm">
                <strong className="text-gray-900 dark:text-white">Reason:</strong>{" "}
                <span className="text-gray-700 dark:text-gray-300">{leaveRequest?.reason || "-"}</span>
              </div>
            </div>

            {/* Comments (optional) */}
            {leaveRequest?.comments && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Comments</label>
                <Textarea
                  value={leaveRequest.comments}
                  readOnly
                  className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
