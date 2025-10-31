
"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { UserCheck, Plus, Edit, Info, ChevronDown } from 'lucide-react';
import { AssignApproverModal } from "../modals/assign-approver-modal";
import { EditApproverModal } from "../modals/edit-approver-modal";
import { Pagination } from "../common/pagination-dynamic";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState, useEffect } from "react";
import axios from "axios";

interface AssignedEmployee {
  userId: number;
  userName: string;
  primaryApproverName: string;
  secondaryApproverName: string;
}

interface User {
  userID?: number;
  UserID?: number;
  userName?: string;
  UserName?: string;
}

interface Manager {
  id?: number;
  name?: string;
  userID?: number;
  UserID?: number;
  userName?: string;
  UserName?: string;
}

export function AssignApproverPage({ isDarkMode }: { isDarkMode?: boolean }) {
  const [assignedEmployees, setAssignedEmployees] = useState<AssignedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AssignedEmployee | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const [roles, setRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Dropdown states
  const [dropdownUsers, setDropdownUsers] = useState<User[]>([]);
  const [dropdownPrimaryApprovers, setDropdownPrimaryApprovers] = useState<Manager[]>([]);
  const [dropdownSecondaryApprovers, setDropdownSecondaryApprovers] = useState<User[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Fetch assigned employees on page load
  useEffect(() => {
    const storedRoles = localStorage.getItem("roles");
    const storedUserId = localStorage.getItem("id");

    if (storedRoles) setRoles(JSON.parse(storedRoles));
    if (storedUserId) setUserId(Number(storedUserId));

    const fetchAssignedEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:7080/api/HRAdmin/getallusermanagerinfo", { withCredentials: true });
        const normalized: AssignedEmployee[] = (res.data ?? []).map((r: any) => ({
          userId: r.userID ?? r.userId ?? r.id,
          userName: r.userName ?? r.user_name ?? "",
          primaryApproverName: r.primaryManagerName ?? "",
          secondaryApproverName: r.secondaryManagerName ?? "--",
        }));
        setAssignedEmployees(normalized);
      } catch (err: any) {
        console.error("Error fetching assigned employees:", err);
        setError("Failed to load assigned employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedEmployees();
  }, []);

  // Fetch dropdown data dynamically
  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);

      // Users with no approver
      const usersRes = await axios.get("https://localhost:7080/api/HRAdmin/getnoapproverlist", { withCredentials: true });
      // Primary approvers (managers)
      const primaryRes = await axios.get("https://localhost:7080/api/HRAdmin/getallmanagers", { withCredentials: true });
      // Secondary approvers (all users)
      const secondaryRes = await axios.get("https://localhost:7080/api/HRAdmin/GetAllUsers", { withCredentials: true });

      setDropdownUsers(usersRes.data ?? []);
      setDropdownPrimaryApprovers(primaryRes.data ?? []);
      setDropdownSecondaryApprovers(secondaryRes.data ?? []);
    } catch (err: any) {
      console.error("Error fetching dropdown data:", err);
      alert("Failed to load dropdowns. Check console.");
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
  fetchDropdownData(); // fetch once when page loads
}, []);

  // Save new approver


  const fetchDropdownDataForAssign = async () => {
  try {
    setDropdownLoading(true);

    const usersRes = await axios.get("https://localhost:7080/api/HRAdmin/getnoapproverlist", { withCredentials: true });

    setDropdownUsers(usersRes.data ?? []); // only users, not managers
  } finally {
    setDropdownLoading(false);
  }
};

  const handleSaveApprover = async (formData: any) => {
    try {
      const selectedUserId = Number(formData.user ?? 0);
      const selectedPrimaryApproverId = Number(formData.primaryApprover) || 0;
      const selectedSecondaryApproverId = formData.secondaryApprover === "none" ? null : Number(formData.secondaryApprover) || null;
      const modUserId = userId ?? 0;

      if (!selectedUserId || !selectedPrimaryApproverId) {
        alert("User and Primary Approver are required");
        return;
      }

      const payload = {
        UserID: selectedUserId,
        PrimaryManagerID: selectedPrimaryApproverId,
        SecondaryManagerID: selectedSecondaryApproverId,
        ModUserID: modUserId
      };

      const res = await axios.post("https://localhost:7080/api/HRAdmin/save", payload, { headers: { "Content-Type": "application/json" }, withCredentials: true });

      if (res.data.status === 1) {
        alert("Approver saved successfully");
        const assignedRes = await axios.get("https://localhost:7080/api/HRAdmin/getallusermanagerinfo", { withCredentials: true });
        const normalized: AssignedEmployee[] = (assignedRes.data ?? []).map((r: any) => ({
          userId: r.userID ?? r.userId ?? r.id,
          userName: r.userName ?? r.user_name ?? "",
          primaryApproverName: r.primaryManagerName ?? "",
          secondaryApproverName: r.secondaryManagerName ?? "--",
        }));
        setAssignedEmployees(normalized);
        setIsAssignModalOpen(false);
      } else {
        alert("Failed to save approver: " + res.data.message);
      }
    } catch (err: any) {
      console.error("Error saving approver:", err);
      alert("Error saving approver. Check console for details.");
    }
  };

  // Edit approver
  const handleEditSave = async (formData: any) => {
    try {
      if (!selectedEmployee) return;

      const selectedPrimaryApproverId = formData.primaryApprover;
      const selectedSecondaryApproverId =
  formData.secondaryApprover === "none" || !formData.secondaryApprover
    ? null
    : Number(formData.secondaryApprover);
      const modUserId = userId ?? 0;

      if (!selectedPrimaryApproverId) {
        alert("Primary Approver is required");
        return;
      }

      const payload = {
        UserID: Number(selectedEmployee.userId),
        PrimaryManagerID: Number(selectedPrimaryApproverId),
        SecondaryManagerID: selectedSecondaryApproverId,
        ModUserID: modUserId
      };

      const res = await axios.post("https://localhost:7080/api/HRAdmin/save", payload, { headers: { "Content-Type": "application/json" }, withCredentials: true });

      if (res.data.status === 1) {
        alert("Approver updated successfully");
        const assignedRes = await axios.get("https://localhost:7080/api/HRAdmin/getallusermanagerinfo", { withCredentials: true });
        const normalized: AssignedEmployee[] = (assignedRes.data ?? []).map((r: any) => ({
          userId: r.userID ?? r.userId ?? r.id,
          userName: r.userName ?? r.user_name ?? "",
          primaryApproverName: r.primaryManagerName ?? "",
          secondaryApproverName: r.secondaryManagerName ?? "--",
        }));
        setAssignedEmployees(normalized);
        setIsEditModalOpen(false);
      } else {
        alert("Failed to update approver: " + res.data.message);
      }
    } catch (err: any) {
      console.error("Error updating approver:", err);
      alert("Error updating approver. Check console for details.");
    }
  };

  // Pagination
  const totalPages = Math.ceil(assignedEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentEmployees = assignedEmployees.slice(startIndex, endIndex);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-gray-50'}`}>
      

      {/* Card Table */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-600" /> Assign Approver
            </CardTitle>
            <Button
              onClick={async () => {
                await fetchDropdownDataForAssign();
                setIsAssignModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Assign New
            </Button>
          </div>
          {/* Rules & Guidelines */}
      <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-blue-600 hover:text-blue-700">
            <Info className="w-4 h-4" />
            <span className="font-medium">Assignee Guidelines</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isRulesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
            <ul className="space-y-2 text-sm">
              <li>• User and Primary Approver are mandatory while Assigning.</li>
              <li>• Only Managers can be Primary Approvers.</li>
              <li>• User cannot be their own Approver (Primary or Secondary).</li>
              <li>• Primary and Secondary Approver cannot be same.</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
        </CardHeader>
        

        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <TableHead className="w-16 font-semibold text-gray-700 dark:text-gray-300 p-4">#</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Employee Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Primary Approver</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-4">Secondary Approver</TableHead>
                  <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-300 p-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.map((employee, index) => (
                  <TableRow key={`${employee.userId}-${startIndex + index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                    <TableCell className="font-medium text-gray-600 dark:text-gray-400 p-4">{startIndex + index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white p-4">{employee.userName}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 p-4">{employee.primaryApproverName || "—"}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 p-4">{employee.secondaryApproverName || "--"}</TableCell>
                    <TableCell className="p-4">
                      <Button size="sm" variant="outline" onClick={async () => { 
                        setIsEditModalOpen(true);
                        setSelectedEmployee(employee); 
                         
                      }} className="flex items-center gap-1.5">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={assignedEmployees.length}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AssignApproverModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleSaveApprover}
        users={dropdownUsers.map(u => ({ id: u.userID ?? u.UserID ?? 0, name: u.userName ?? u.UserName ?? "" }))}
        managers={dropdownPrimaryApprovers.map(m => ({ id: m.userID ?? m.UserID ?? 0, name: m.userName ?? m.UserName ?? "" }))}
        secondaryUsers={dropdownSecondaryApprovers.map(u => ({ id: u.userID ?? u.UserID ?? 0, name: u.userName ?? u.UserName ?? "" }))}
        loading={dropdownLoading}
      />

      {selectedEmployee && (
        <EditApproverModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          employee={selectedEmployee}
          managers={dropdownPrimaryApprovers.map(m => ({ id: m.userID ?? m.UserID ?? 0, name: m.userName ?? m.UserName ?? "" }))}
          secondaryUsers={dropdownSecondaryApprovers.map(u => ({ id: u.userID ?? u.UserID ?? 0, name: u.userName ?? u.UserName ?? "" }))}
        />
      )}
    </div>
  );
}
