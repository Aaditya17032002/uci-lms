// "use client"

// import { useState } from "react"
// import { Button } from "../ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
// import { UserCheck, Plus, Edit, Info, ChevronDown } from 'lucide-react'
// import { AssignApproverModal } from "../modals/assign-approver-modal"
// import { EditApproverModal } from "../modals/edit-approver-modal"
// import { Pagination } from "../common/pagination"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

// interface Employee {
//   id: number
//   name: string
//   primaryApprover: string
//   secondaryApprover: string
// }

// const mockEmployees: Employee[] = [
//   { id: 1, name: "John Doe", primaryApprover: "Paritosh Unakar", secondaryApprover: "Nancy Sheth" },
//   { id: 2, name: "Jane Smith", primaryApprover: "Tushar Mishra", secondaryApprover: "None" },
//   { id: 3, name: "Mike Johnson", primaryApprover: "Swet Soni", secondaryApprover: "Krunal Vasava" },
//   { id: 4, name: "Sarah Wilson", primaryApprover: "Paritosh Unakar", secondaryApprover: "None" },
//   { id: 5, name: "David Brown", primaryApprover: "Tushar Mishra", secondaryApprover: "Nancy Sheth" },
// ]

// interface AssignApproverPageProps {
//   isDarkMode?: boolean
// }

// export function AssignApproverPage({ isDarkMode }: AssignApproverPageProps) {
//   const [employees, setEmployees] = useState(mockEmployees)
//   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
//   const [pageSize, setPageSize] = useState("10")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [isRulesOpen, setIsRulesOpen] = useState(false)

//   const handleAssignSave = (data: any) => {
//     const newEmployee: Employee = {
//       id: employees.length + 1,
//       name: data.user.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
//       primaryApprover: data.primaryApprover.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
//       secondaryApprover: data.secondaryApprover === 'none' ? 'None' : data.secondaryApprover.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
//     }
//     setEmployees([...employees, newEmployee])
//   }

//   const handleEditSave = (updatedEmployee: Employee) => {
//     const formattedEmployee = {
//       ...updatedEmployee,
//       primaryApprover: updatedEmployee.primaryApprover.includes('-')
//         ? updatedEmployee.primaryApprover.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
//         : updatedEmployee.primaryApprover,
//       secondaryApprover: updatedEmployee.secondaryApprover === 'none' ? 'None' :
//         (updatedEmployee.secondaryApprover.includes('-')
//           ? updatedEmployee.secondaryApprover.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
//           : updatedEmployee.secondaryApprover)
//     }
//     setEmployees(employees.map(emp =>
//       emp.id === formattedEmployee.id ? formattedEmployee : emp
//     ))
//   }

//   const handleEdit = (employee: Employee) => {
//     setSelectedEmployee(employee)
//     setIsEditModalOpen(true)
//   }

//   const totalPages = Math.ceil(employees.length / parseInt(pageSize))
//   const startIndex = (currentPage - 1) * parseInt(pageSize)
//   const endIndex = startIndex + parseInt(pageSize)
//   const currentData = employees.slice(startIndex, endIndex)

//   return (
//     <div className={`p-4 sm:p-6 space-y-6 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-gray-50'}`}>


//       {/* Card */}
//       <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
//         <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//               <UserCheck className="h-6 w-6 text-blue-600" />
//               Assign Approver
//             </CardTitle>
//             <Button
//               onClick={() => setIsAssignModalOpen(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
//             >
//               <Plus className="h-4 w-4" />
//               Assign New
//             </Button>
//           </div>
//            {/* Collapsible Guidelines */}
//       <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
//         <CollapsibleTrigger asChild>
//           <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-blue-600 hover:text-blue-700">
//             <Info className="w-4 h-4" />
//             <span className="font-medium">Rules & Guidelines</span>
//             <ChevronDown className={`w-4 h-4 transition-transform ${isRulesOpen ? 'rotate-180' : ''}`} />
//           </Button>
//         </CollapsibleTrigger>
//         <CollapsibleContent className="mt-3">
//           <div className={`p-4 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
//             <ul className="space-y-2">
//               <li>• User and Primary Approver are mandatory while Assigning.</li>
//               <li>• Only Managers can be Primary Approvers.</li>
//               <li>• User cannot be their own Approver (Primary or Secondary).</li>
//               <li>• Primary and Secondary Approver cannot be same.</li>
//             </ul>
//           </div>
//         </CollapsibleContent>
//       </Collapsible>
//         </CardHeader>
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
//                   <TableHead className="w-12 sm:w-16 font-semibold text-gray-700 dark:text-gray-300 p-2 sm:p-4">#</TableHead>
//                   <TableHead className="font-semibold text-gray-700 dark:text-gray-300 p-2 sm:p-4">Employee Name</TableHead>
//                   <TableHead className="hidden sm:table-cell font-semibold text-gray-700 dark:text-gray-300 p-2 sm:p-4">Primary Approver</TableHead>
//                   <TableHead className="hidden sm:table-cell font-semibold text-gray-700 dark:text-gray-300 p-2 sm:p-4">Secondary Approver</TableHead>
//                   <TableHead className="w-24 sm:w-32 font-semibold text-gray-700 dark:text-gray-300 p-2 sm:p-4">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {currentData.map((employee) => (
//                   <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
//                     <TableCell className="font-medium text-gray-600 dark:text-gray-400 p-2 sm:p-4">{employee.id}</TableCell>
//                     <TableCell className="font-medium text-gray-900 dark:text-white p-2 sm:p-4">
//                       <div className="flex flex-col">
//                         <span>{employee.name}</span>
//                         {/* Show approvers stacked on mobile */}
//                         <span className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
//                           P: {employee.primaryApprover} | S: {employee.secondaryApprover}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="hidden sm:table-cell text-gray-700 dark:text-gray-300 p-2 sm:p-4">{employee.primaryApprover}</TableCell>
//                     <TableCell className="hidden sm:table-cell text-gray-700 dark:text-gray-300 p-2 sm:p-4">{employee.secondaryApprover}</TableCell>
//                     <TableCell className="p-2 sm:p-4">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleEdit(employee)}
//                         className="flex items-center gap-1.5 w-full sm:w-auto justify-center"
//                       >
//                         <Edit className="h-3.5 w-3.5" />
//                         Edit
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>

//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               pageSize={pageSize}
//               totalItems={employees.length}
//               onPageChange={setCurrentPage}
//               onPageSizeChange={setPageSize}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <AssignApproverModal
//         isOpen={isAssignModalOpen}
//         onClose={() => setIsAssignModalOpen(false)}
//         onSave={handleAssignSave}
//       />

//       <EditApproverModal
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         onSave={handleEditSave}
//         employee={selectedEmployee}
//       />
//     </div>
//   )
// }

// =======================================================  DYNAMIC =======================================================

"use client";

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { UserCheck, Plus, Edit, Info, ChevronDown } from 'lucide-react'
import { AssignApproverModal } from "../modals/assign-approver-modal"
import { EditApproverModal } from "../modals/edit-approver-modal"
import { Pagination } from "../common/pagination-dynamic"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
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
  const [managers, setManagers] = useState<Manager[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AssignedEmployee | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // 🔹 Fetch dynamic data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignedRes, managersRes, usersRes] = await Promise.all([
          axios.get("https://localhost:7080/api/HRAdmin/getallusermanagerinfo"),
          axios.get("https://localhost:7080/api/HRAdmin/getallmanagers"),
          axios.get("https://localhost:7080/api/HRAdmin/GetAllUsers"),
        ]);
        console.log("API Responses:", {
          assigned: assignedRes.data,
          managers: managersRes.data,
          users: usersRes.data
        });

        const managersArr = managersRes.data ?? [];
        const usersArr = usersRes.data ?? [];

        setManagers(managersArr);
        setUsers(usersArr);

        const normalized: AssignedEmployee[] = (assignedRes.data ?? []).map((r: any) => ({
          userId: r.userID ?? r.userId ?? r.id,
          userName: r.userName ?? r.user_name ?? "",
          primaryApproverName: r.primaryManagerName ?? "",
          secondaryApproverName: r.secondaryManagerName ?? "--",
        }));


        setManagers(managersArr);
        setUsers(usersArr);
        //setAssignedEmployees(normalized);
        setAssignedEmployees(normalized);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // 🔹 Save new approver
  const handleSaveApprover = async (formData: any) => {
    const selectedUserId = Number(formData.user);
    const selectedPrimaryApproverId = Number(formData.primaryApprover);
    const selectedSecondaryApproverId = formData.secondaryApprover === "none" ? null : Number(formData.secondaryApprover);
    console.log("Form Data received:", formData);

    const payload = {
      UserID: selectedUserId,
      PrimaryManagerID: selectedPrimaryApproverId,
      SecondaryManagerID: selectedSecondaryApproverId,
      ModUserID: 12 // replace with actual user if available
    };
    console.log(typeof selectedUserId, selectedUserId);
    console.log(typeof selectedPrimaryApproverId, selectedPrimaryApproverId);
    console.log(typeof selectedSecondaryApproverId, selectedSecondaryApproverId);
    console.log(typeof payload.ModUserID, payload.ModUserID);

    console.log("Payload to backend:", payload);

    //if (!selectedUserId || !selectedPrimaryApproverId) return;


    if (!selectedUserId || !selectedPrimaryApproverId) {
      alert("User and Primary Approver are required");
      return;
    }

    try {
      console.log("inside try", payload)

      //const res = await axios.post("https://localhost:7080/api/HRAdmin/save",payload);

      const res = await axios.post(
        "https://localhost:7080/api/HRAdmin/save",
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      if (res.data.status === 1) {
        alert("Approver saved successfully");
        const assignedRes = await axios.get("https://localhost:7080/api/HRAdmin/getallusermanagerinfo");
        //setAssignedEmployees(assignedRes.data);
        setAssignedEmployees((assignedRes.data ?? []).map((r: any) => ({
          userId: r.userID ?? r.userId ?? r.id,
          userName: r.UserName ?? r.userName ?? r.user_name ?? "",
          primaryApproverName: r.PrimaryManagerName ?? "",
          secondaryApproverName: r.SecondaryManagerName ?? "--",
        })));
        setIsAssignModalOpen(false);
      } else {
        alert("Failed to save approver: " + res.data.message);
      }
    } catch (err) {
      console.log("Error saving approver", err);
    }
  };

  // 🔹 Edit approver
  const handleEditSave = async (formData: any) => {
    console.log("Edit form data received:", formData);

    const selectedPrimaryApproverId = Number(formData.primaryApprover);
    const selectedSecondaryApproverId = formData.secondaryApprover === "none" ? null : Number(formData.secondaryApprover);


    if (!selectedPrimaryApproverId) {
      alert("Primary Approver is required");
      return;
    }

    const payload = {
      UserID: selectedEmployee?.userId, // Get userId from selectedEmployee
      PrimaryManagerID: selectedPrimaryApproverId,
      SecondaryManagerID: selectedSecondaryApproverId,
      ModUserID: 12 // or your actual logged-in user ID
    };

    console.log("Edit payload to backend:", payload);

    try {
      const res = await axios.post("https://localhost:7080/api/HRAdmin/save", payload);
      if (res.data.status === 1) {
        alert("Approver updated successfully");
        const assignedRes = await axios.get("https://localhost:7080/api/HRAdmin/getallusermanagerinfo");
        //setAssignedEmployees(assignedRes.data);
        setAssignedEmployees((assignedRes.data ?? []).map((r: any) => ({
          userId: r.userID ?? r.userId ?? r.id,
          userName: r.userName ?? r.user_name ?? "",
          primaryApproverName: r.primaryManagerName ?? "",
          secondaryApproverName: r.secondaryManagerName ?? "--",
        })));
        setIsEditModalOpen(false);
      } else {
        alert("Failed to update approver: " + res.data.message);
      }
    } catch (err) {
      console.error("Error updating approver:", err);
      alert("Error updating approver");
    }
  };

  // 🔹 Pagination data
  const totalPages = Math.ceil(assignedEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentEmployees = assignedEmployees.slice(startIndex, endIndex);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-gray-50'}`}>
      {/* Rules & Guidelines Collapsible */}
      <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-blue-600 hover:text-blue-700">
            <Info className="w-4 h-4" />
            <span className="font-medium">Rules & Guidelines</span>
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

      {/* Card Table */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-600" />
              Assign Approver
            </CardTitle>
            <Button
              onClick={() => setIsAssignModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign New
            </Button>
          </div>
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
                    <TableCell className="text-gray-700 dark:text-gray-300 p-4">
                      {employee.primaryApproverName || "—"}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 p-4">
                      {employee.secondaryApproverName || "--"}
                    </TableCell>

                    <TableCell className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedEmployee(employee); setIsEditModalOpen(true); }}
                        className="flex items-center gap-1.5"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/*Pagination component usage*/}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={assignedEmployees.length}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1); // reset page to 1 when page size changes
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}

      <AssignApproverModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleSaveApprover}
        users={users.map((u) => ({
          id: u.userID ?? u.UserID ?? 0,
          name: u.userName ?? u.UserName ?? ""
        }))}
        managers={managers.map((m) => ({
          id: m.userID ?? m.UserID ?? 0,
          name: m.userName ?? m.UserName ?? ""
        }))}
      />


      {selectedEmployee && (
        <EditApproverModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          employee={selectedEmployee}
          managers={managers.map((m) => ({
            id: m.userID ?? m.UserID ?? 0,
            name: m.userName ?? m.UserName ?? ""
          }))} // fetched from API
        />
      )}
    </div>
  );
}