"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  BarChart3,
} from "lucide-react";
import { LeaveHistoryModal } from "../../modals/leave-history-modal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/utils";

interface EmployeeDashboardProps {
  userRoles: string[];
}

interface ApproverInfo {
  userID: number;
  userName: string;
  primaryManagerName: string;
  secondaryManagerName: string;
  modUserName: string;
  modifiedOn: string;
}

interface LeaveSummary {
  policyName: string;
  leaveTypeName: string;
  maxAllotedPerYear: number;
  remainingLeaves: number;
  usedLeaves: number;
  carryForwardExpiry: string | null;
}

interface LeaveDayDetail {
  leaveDate: string;
  dayType: string;
}

interface LeaveApprovalWorkflow {
  statusName: string;
  leaveStartDate: string;
  leaveEndDate: string;
  hrName: string;
  managerName: string;
  reason: string;
  lrApprovalID: number;
  requestID: number;
  userID: number;
  managerID: number;
  managerResponse: string;
  managerComment: string | null;
  hrid: number;
  hrResponse: string | null;
  hrComment: string | null;
  isCancelled: boolean;
  createdBy: number;
  createdOn: string;
  modifiedBy: number;
  modifiedOn: string;
  leaveTypeID: number;
  leaveName: string;
  createdByName: string | null;
  leaveDayDetails: LeaveDayDetail[];
}

interface MyEngagement {
  engagementID: number;
  title: string;
  description: string;
  owners: string;
  startDate: string;
  endDate: string;
  teamMembers: string;
  isActive: boolean;
}

export function EmployeeDashboard({ userRoles }: EmployeeDashboardProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeaveIndex, setSelectedLeaveIndex] = useState(0);
  const [pendingTimesheetCount, setPendingTimesheetCount] = useState(0);
  const [approverInfo, setApproverInfo] = useState<ApproverInfo | null>(null);
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary[]>([]);
  const [leaveApprovals, setLeaveApprovals] = useState<LeaveApprovalWorkflow[]>(
    []
  );
  const [myEngagements, setMyEngagements] = useState<MyEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // First fetch approver info to get userId
        const approverResponse = await apiClient.get(
          "/Dashboard/getuserapproverinfo"
        );
        console.log("Approver Info Response:", approverResponse);

        // Set approver info
        if (approverResponse) {
          setApproverInfo(approverResponse);
        }

        const userId = approverResponse?.userID;

        // Then fetch other data including leave summary, leave approvals, and engagements
        const [
          defaultsResponse,
          leaveSummaryResponse,
          leaveApprovalsResponse,
          myEngagementsResponse,
        ] = await Promise.all([
          apiClient.get("/Dashboard/getemployeedefaults"),
          userId
            ? apiClient.get(
                `/Leave/GetUserLeaveSummaryDetails?userId=${userId}`
              )
            : Promise.resolve([]),
          apiClient.get("/Leave/GetAllLRApprovalWorkflows"),
          apiClient.get("/Engagement/myengagements"),
        ]);

        console.log("Dashboard API Response:", defaultsResponse);
        console.log("Leave Summary Response:", leaveSummaryResponse);
        console.log("Leave Approvals Response:", leaveApprovalsResponse);
        console.log("My Engagements Response:", myEngagementsResponse);

        // Count pending timesheets from the response
        if (Array.isArray(defaultsResponse)) {
          // If response is directly an array
          setPendingTimesheetCount(defaultsResponse.length);
        } else if (
          defaultsResponse?.pendingTimesheets &&
          Array.isArray(defaultsResponse.pendingTimesheets)
        ) {
          // If response has pendingTimesheets property
          setPendingTimesheetCount(defaultsResponse.pendingTimesheets.length);
        } else if (
          defaultsResponse?.data &&
          Array.isArray(defaultsResponse.data)
        ) {
          // If response has data property
          setPendingTimesheetCount(defaultsResponse.data.length);
        } else {
          setPendingTimesheetCount(0);
        }

        // Set leave summary
        if (Array.isArray(leaveSummaryResponse)) {
          setLeaveSummary(leaveSummaryResponse);
        }

        // Set leave approvals
        if (Array.isArray(leaveApprovalsResponse)) {
          setLeaveApprovals(leaveApprovalsResponse);
        }

        // Set my engagements
        if (Array.isArray(myEngagementsResponse)) {
          setMyEngagements(myEngagementsResponse);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setPendingTimesheetCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to format leave label for dropdown
  const formatLeaveLabel = (leave: LeaveApprovalWorkflow) => {
    const startDate = formatDate(leave.leaveStartDate);
    const endDate = formatDate(leave.leaveEndDate);

    if (startDate === endDate) {
      return `${startDate} -- ${leave.leaveName}`;
    }
    return `${startDate} - ${endDate} -- ${leave.leaveName}`;
  };

  // Helper function to get leave status stage
  const getLeaveStatus = (leave: LeaveApprovalWorkflow) => {
    const managerApproved =
      leave.managerResponse &&
      leave.managerResponse.toLowerCase().includes("approved");
    const hrApproved =
      leave.hrResponse && leave.hrResponse.toLowerCase().includes("approved");

    if (hrApproved && managerApproved) {
      return "approved";
    } else if (managerApproved && !hrApproved) {
      return "hr-pending";
    } else if (!managerApproved) {
      return "manager-pending";
    }
    return "submitted";
  };

  // Helper function to get initials from name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get remaining leaves by type
  const getRemainingLeaves = (leaveType: string) => {
    const leave = leaveSummary.find((l) =>
      l.leaveTypeName.toLowerCase().includes(leaveType.toLowerCase())
    );
    return leave?.remainingLeaves ?? 0;
  };

  // Get formatted leave text
  const getLeaveText = () => {
    const sickLeaves = getRemainingLeaves("sick");
    const casualLeaves = getRemainingLeaves("casual");
    return `${sickLeaves} SL, ${casualLeaves} CL`;
  };

  const getProgressStages = () => {
    if (leaveApprovals.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          No leave requests found
        </div>
      );
    }

    const currentLeave = leaveApprovals[selectedLeaveIndex];
    const status = getLeaveStatus(currentLeave);

    if (status === "approved") {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-blue-500 hidden md:block"></div>
          {["Submitted", "Manager Approval", "HR Approval", "Approved"].map(
            (stage, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center relative z-10 flex-1"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {stage}
                </span>
              </div>
            )
          )}
        </div>
      );
    } else if (status === "manager-pending") {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 hidden md:block"></div>
          <div className="absolute top-4 left-8 w-[8%] h-0.5 bg-blue-500 hidden md:block"></div>
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
            <span className="text-sm font-medium text-orange-500">
              Manager Approval
            </span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              HR Approval
            </span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Approved</span>
          </div>
        </div>
      );
    } else if (status === "hr-pending") {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 hidden md:block"></div>
          <div className="absolute top-4 left-8 w-[41%] h-0.5 bg-blue-500 hidden md:block"></div>
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
            <span className="text-sm font-medium text-blue-600">
              Manager Approval
            </span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-orange-500">
              HR Approval
            </span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Approved</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-between relative flex-wrap gap-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 hidden md:block"></div>
          <div className="absolute top-4 left-8 w-[8%] h-0.5 bg-blue-500 hidden md:block"></div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Submitted</span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Manager Approval
            </span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              HR Approval
            </span>
          </div>
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Approved</span>
          </div>
        </div>
      );
    }
  };

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
              <div className="text-2xl font-bold text-black-600">
                {loading ? "..." : pendingTimesheetCount}
              </div>
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
              <div className="text-lg font-bold text-black-600">
                {loading ? "Loading..." : getLeaveText()}
              </div>
              <div className="text-sm text-gray-600">
                Total Leaves Remaining
              </div>
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
            <h3 className="text-lg font-semibold text-gray-800">
              Leave Approval Progress
            </h3>
            {leaveApprovals.length > 0 && (
              <Select
                value={selectedLeaveIndex.toString()}
                onValueChange={(value) =>
                  setSelectedLeaveIndex(parseInt(value))
                }
              >
                <SelectTrigger className="w-full md:w-[380px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaveApprovals.map((leave, index) => (
                    <SelectItem
                      key={leave.lrApprovalID}
                      value={index.toString()}
                    >
                      {formatLeaveLabel(leave)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                  <span className="text-sm font-semibold text-gray-500">
                    {loading
                      ? "..."
                      : getInitials(approverInfo?.primaryManagerName)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Primary Approver
                  </p>
                  <p className="text-sm font-semibold text-gray-600">
                    {loading
                      ? "Loading..."
                      : approverInfo?.primaryManagerName || "Not Assigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-500">
                    {loading
                      ? "..."
                      : getInitials(approverInfo?.secondaryManagerName)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Secondary Approver
                  </p>
                  <p className="text-sm font-semibold text-gray-600">
                    {loading
                      ? "Loading..."
                      : approverInfo?.secondaryManagerName || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Today’s Schedule */}
      {/* <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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
      </div> */}

      {/* My Engagements */}
      <div className="grid grid-cols-1">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-black-600" />
            <h3 className="font-semibold text-black-800">My Engagements</h3>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading engagements...
            </div>
          ) : myEngagements.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No engagements found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEngagements.map((engagement, index) => {
                const colors = [
                  "blue",
                  "green",
                  "yellow",
                  "purple",
                  "pink",
                  "indigo",
                ];
                const color = colors[index % colors.length];
                return (
                  <div
                    key={engagement.engagementID}
                    className={`bg-white rounded-lg p-4 border-l-4 border-${color}-400`}
                  >
                    <p className="font-semibold text-gray-800">
                      {engagement.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {engagement.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <LeaveHistoryModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </div>
  );
}
