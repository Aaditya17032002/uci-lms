"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Pagination } from "../../common/pagination"
import { Eye, Pencil, Ban, BellRing } from "lucide-react"
import { LeaveReviewModalEmp } from "../../modals/leave-review-modal-emp"
import { CancelLeaveConfirmationModal } from "../../modals/cancel-leave-confirmation-modal"
import { NotificationPopup } from "../../common/notification-popup"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { AddLeaveForm } from "./add-leave-form";


interface LeaveDayDetail {
  date: string; // YYYY-MM-DD
  type: "Full Day" | "First-Half" | "Second-Half";
}
const formatDateToYMD = (date: Date | string) => {
  const d = new Date(date); // convert string → Date if needed
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function generateLeaveDayDetails(start: string, end: string, totalDays: number): LeaveDayDetail[] {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const daysArray: LeaveDayDetail[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const dayType: LeaveDayDetail["type"] =
      totalDays % 1 !== 0 ? (current.getTime() === startDate.getTime() ? "First-Half" : "Second-Half") : "Full Day";

    if (current.getDay() !== 0 && current.getDay() !== 6) { // skip weekends
      

daysArray.push({
  date: formatDateToYMD(current), // ✅ local date, no UTC conversion
  type: dayType,
});
    }

    current.setDate(current.getDate() + 1);
  }

  return daysArray;
}



export interface LeaveRecord {
  id: number;            // ← must exist
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  appliedDate: string;
  hrName?: string;
  managerName?: string;
  hrResponse?: string | null;
  managerResponse?: string | null;
  hrComment?: string | null;
  managerComment?: string | null;
  isCancelled?: boolean;
}



const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
          Approved
        </Badge>
      )
    case "pending manager approval":
    case "pending_manager_approval":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400">
          Pending Manager Approval
        </Badge>
      )
    case "pending hr approval":
    case "pending_hr_approval":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
          Pending HR Approval
        </Badge>
      )
    case "cancelled":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400">
          Cancelled
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
          Rejected
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
          Submitted
        </Badge>
      )
  }
}
interface LeaveRecordWithDetails extends LeaveRecord {
  leaveDayDetails: LeaveDayDetail[];
  requestID : number,
}


export function ViewLeaveHistory() {
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [leaveToCancelId, setLeaveToCancelId] = useState<number | null>(null)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // ✅ Move these inside the component
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false)
  const [leaveToEdit, setLeaveToEdit] = useState<LeaveRecordWithDetails | null>(null)

  const handleEditLeave = (leave: LeaveRecord) => {
    const leaveDayDetails = generateLeaveDayDetails(leave.startDate, leave.endDate, leave.days);

    setLeaveToEdit({
      ...leave,
      leaveDayDetails,
      requestID: leave.id,
    });
    setIsAddLeaveModalOpen(true);
  }

  const fetchLeaveHistory = async () => {
      try {
      const response = await axios.get("https://localhost:7080/api/Leave/GetAllLRApprovalWorkflows", {
        withCredentials: true, // ✅ include credentials (cookies, tokens)
      })

        // Map API response to LeaveRecord structure
        const formattedData: LeaveRecord[] = response.data.map((item: any) => ({
          id: item.requestID,
          type: item.leaveName,
          startDate: new Date(item.leaveStartDate),
          endDate: new Date(item.leaveEndDate),
          days: item.leaveDayDetails?.reduce((sum: number, day: any) => {
            if (day.dayType === "First-Half" || day.dayType === "Second-Half") return sum + 0.5;
            return sum + 1; // Full day
          }, 0) || 0
,
          reason: item.reason,
          status: item.statusName
            .toLowerCase()
            .replace(/\s+/g, "_") as LeaveRecord["status"],
          appliedDate: new Date(item.createdOn).toLocaleDateString(),
        }))

        setLeaveHistory(formattedData)
      } catch (error) {
        console.error("Error fetching leave history:", error)
      } finally {
        setLoading(false)
      }
    }

  // 🔹 Fetch data from API
  useEffect(() => {
    

    fetchLeaveHistory()
  }, [])

  const handleViewDetails = async (leave: LeaveRecord) => {
  setSelectedLeave(null);

  try {
    const response = await axios.get(
      `https://localhost:7080/api/Leave/GetAllLRApprovalWorkflows`,
      { withCredentials: true }
    );

    const item = response.data.find((wf: any) => wf.requestID === leave.id);
    if (!item) throw new Error("Leave record not found.");

    // calculate total days
    const totalDays =
      item.leaveDayDetails?.reduce((sum: number, day: any) => {
        if (day.dayType === "First-Half" || day.dayType === "Second-Half") return sum + 0.5;
        return sum + 1;
      }, 0) || 0;

    const detailedLeave: LeaveRecordWithDetails = {
  id: item.requestID,
  type: item.leaveName,
  startDate: item.leaveStartDate, // ← must match interface
  endDate: item.leaveEndDate,     // ← must match interface
  days: totalDays,                // you already calculated total days
  reason: item.reason,
  status: item.statusName?.toLowerCase().replace(/\s+/g, "_") || "unknown",
  appliedDate: new Date(item.createdOn).toLocaleDateString(),
  managerName: item.managerName,
  hrName: item.hrName,
  managerResponse: item.managerResponse,
  managerComment: item.managerComment,
  hrResponse: item.hrResponse,
  hrComment: item.hrComment,
  isCancelled: item.isCancelled,
  leaveDayDetails: item.leaveDayDetails || [],
  requestID: item.requestID,
};


    setSelectedLeave(detailedLeave);
    setIsReviewModalOpen(true);
  } catch (error) {
    console.error("Error fetching leave details:", error);
    setNotificationMessage("Failed to fetch leave details.");
    setShowNotificationPopup(true);
  }
};







  const handleCancelClick = (leaveId: number) => {
    setLeaveToCancelId(leaveId)
    setIsCancelModalOpen(true)
  }

  const handleNotifyClick = (leaveId: number) => {
    setNotificationMessage("Notified Successfully")
    setShowNotificationPopup(true)
    console.log(`Notifying approvers for leave request ID: ${leaveId}`)
  }

  const handleConfirmCancel = async (leaveId: number) => {
  setIsLoading(true);
  try {
    const payload = { requestID: leaveId, modUser: 0 };
    const response = await axios.post(
      "https://localhost:7080/api/Leave/CancelLeaveRequest",
      payload,
      { withCredentials: true }
    );

    // Check if response indicates success
    if (response.data && response.data.status === 1) { // assuming status=1 means success
      setLeaveHistory(prev =>
        prev.map(l => (l.id === leaveId ? { ...l, status: "cancelled" } : l))
      );
      setNotificationMessage(`Leave request cancelled successfully.`);
    } else {
      setNotificationMessage(`Failed to cancel leave request : ${response.data?.message || "Unknown error"}`);
    }
  } catch (error: any) {
    console.error("Error cancelling leave:", error);
    setNotificationMessage(`Error cancelling leave request : ${error?.response?.data?.message || error.message}`);
  } finally {
    setShowNotificationPopup(true);
    setIsCancelModalOpen(false);
    setLeaveToCancelId(null);
    setIsLoading(false);
  }
};


  const totalPages = Math.ceil(leaveHistory.length / parseInt(pageSize))
  const startIndex = (currentPage - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const currentData = leaveHistory.slice(startIndex, endIndex)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Leave History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : leaveHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No leave records found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200 p-4">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Leave Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Duration
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Total Days
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Applied On
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Status
                    </TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Actions
                    </TableHead>
                    <TableHead className="w-24 font-semibold text-gray-700 dark:text-gray-200 p-4">
                      Notify
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((leave, index) => (
                    <TableRow
                      key={leave.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                    >
                      <TableCell>
                        {startIndex + index + 1} <span className="text-xs text-gray-400"></span>
                      </TableCell>

                      <TableCell className="font-medium text-gray-900 dark:text-gray-100 p-4">
                        {leave.type}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200 p-4">
                        {formatDateToYMD(leave.startDate)} to {formatDateToYMD(leave.endDate)}
                      </TableCell>

                      <TableCell className="text-gray-700 dark:text-gray-200 p-4">
                        {leave.days}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200 p-4">
                        {leave.appliedDate}
                      </TableCell>
                      <TableCell className="p-4">
                        {getStatusBadge(leave.status)}
                      </TableCell>
                      <TableCell className="p-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditLeave(leave)}
                          disabled={new Date(leave.startDate) <= new Date()}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(leave)}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              ["approved", "rejected", "cancelled"].includes(leave.status) ||
                              new Date(leave.startDate) <= new Date() // disable if started or past
                            }
                            onClick={() => handleCancelClick(leave.id)}
                            className="text-gray-700 dark:text-gray-300 flex items-center gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            Cancel
                        </Button>
                      </TableCell>
                      <TableCell className="p-4">
                        <Button
                          size="sm"
                          disabled
                          className="bg-gray-400 text-white flex items-center gap-2 font-medium cursor-not-allowed opacity-60"
                        >
                          <BellRing className="h-4 w-4" />
                          Notify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={leaveHistory.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />

            {selectedLeave && (
  <LeaveReviewModalEmp
    isOpen={isReviewModalOpen}
    onClose={() => setIsReviewModalOpen(false)}
    leaveRequest={selectedLeave}
    isViewOnly={true} // if you just want to view details
  />
)}


            <CancelLeaveConfirmationModal
              isOpen={isCancelModalOpen}
              onClose={() => setIsCancelModalOpen(false)}
              onConfirm={handleConfirmCancel}
              leaveId={leaveToCancelId}
            />
          </>
        )}
        <Dialog open={isAddLeaveModalOpen} onOpenChange={setIsAddLeaveModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{leaveToEdit ? "Edit Leave" : "New Leave Request"}</DialogTitle>
            </DialogHeader>
            <AddLeaveForm
              defaultValues={
                leaveToEdit
                  ? {
                    requestID: leaveToEdit.requestID,
                      leaveType: leaveToEdit.type, // rename 'type' → 'leaveType'
                      startDate: new Date(leaveToEdit.startDate), // convert string → Date
                      endDate: new Date(leaveToEdit.endDate),
                      reason: leaveToEdit.reason,
                      leaveDayDetails: leaveToEdit.leaveDayDetails || [],
                    }
                  : undefined
              }
                onSubmitSuccess={() => {
                  setIsAddLeaveModalOpen(false); // ✅ Close the modal
                  fetchLeaveHistory();           // Refresh the table
                }}

            />
          </DialogContent>
        </Dialog>

        {showNotificationPopup && (
          <NotificationPopup
            message={notificationMessage}
            onClose={() => setShowNotificationPopup(false)}
          />
        )}

        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
