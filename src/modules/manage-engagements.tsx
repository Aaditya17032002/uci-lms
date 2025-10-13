

  "use client";

  import { useState, useEffect, useMemo } from "react";
  import React from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
  import { Button } from "../ui/button";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
  import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
  import { Badge } from "../ui/badge";
  import { Input } from "../ui/input";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
  import { Plus, Copy, Edit, Trash2, Briefcase, Info, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
  import { AddEngagementModal } from "../modals/add-engagement-modal";
  import { CopyEngagementModal } from "../modals/copy-engagement-modal";
  import { Pagination } from "../common/pagination-dynamic";
  import { useToast } from "../hooks/use-toast";
  import { toast } from "sonner";
  import { apiClient } from "../lib/utils";
  
  // API Response interfaces
  interface TeamMember {
    mappingID: number;
    userID: number;
    teamMemberName: string;
    startDate: string;
    endDate: string;
    maxWeeklyHours: number;
    createdBy: number;
    modifiedBy: number;
    modifiedOn: string;
    createdOn: string;
    engagementID: number;
  }

  interface Task {
    engagementTaskID: number;
    engagementID: number;
    taskID: number;
    taskName: string;
    taskDescription: string;
    isDeleted: boolean;
    isGeneric: boolean;
    createdOn: string;
    createdBy: string;
    modifiedOn: string;
    modifiedBy: string;
  }

  interface Owner {
    mappingID: number;
    engagementID: number;
    userID: number;
    ownerName: string;
  }

  interface Engagement {
    engagementID: number;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    isActive: boolean;
    teamMembers: TeamMember[];
    tasks: Task[];
    owners: Owner[];
  }

  // Save request interface
  interface SaveEngagementRequest {
    engagementID: number;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    teamMembers: TeamMember[];
    tasks: Task[];
    owners: Owner[];
    modUser: number;
  }

  // Manager interface for dropdown
  interface Manager {
    userID: number;
    userName: string;
  }

  // User interface for dropdown
  interface User {
    userID: number;
    username: string;
    email: string;
    isActive: boolean;
    roleID: number | null;
    envVar: string | null;
  }

  // Users API response interface
  interface UsersResponse {
    currentUserID: number;
    users: User[];
  }

  // Task creation request interface
  interface CreateTaskRequest {
    engagementTaskID: number;
    engagementID: number;
    taskID: number;
    taskName: string;
    taskDescription: string;
    isDeleted: boolean;
    isGeneric: boolean;
    modUser: number;
  }
  
  interface ManageEngagementsPageProps {
    isDarkMode?: boolean
  }
  
  export function ManageEngagementsPage({ isDarkMode }: ManageEngagementsPageProps) {
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
    const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'copy'>('add');
    // Using Sonner for beautiful notifications

    // Sorting and filtering states
    const [sortField, setSortField] = useState<keyof Engagement | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterOwner, setFilterOwner] = useState<string>('all');
  
    // 🔹 Fetch all data from APIs
    useEffect(() => {
      const fetchAllData = async () => {
        setLoading(true);
        try {
          const [engagementsRes, managersRes, usersRes] = await Promise.all([
            apiClient.get('/engagement'),
            apiClient.get('/HRAdmin/getallmanagers'),
            apiClient.get('/user/getallusers')
          ]);
          
          console.log('API Responses:', {
            engagements: engagementsRes,
            managers: managersRes,
            users: usersRes
          });
          
          setEngagements(engagementsRes || []);
          setManagers(managersRes || []);
          setUsers(usersRes?.users || []);
          
          // Set current user from the API response
          if (usersRes?.currentUserID && usersRes?.users) {
            const currentUserData = usersRes.users.find((user: any) => user.userID === usersRes.currentUserID);
            console.log('Current user found:', currentUserData);
            setCurrentUser(currentUserData || null);
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load data');
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }, []);

    // 🔹 Sorting function
    const handleSort = (field: keyof Engagement) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };

    // 🔹 Get sort icon
    const getSortIcon = (field: keyof Engagement) => {
      if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
      return sortDirection === 'asc' ? 
        <ArrowUp className="h-4 w-4" /> : 
        <ArrowDown className="h-4 w-4" />;
    };

    // 🔹 Filter and sort data
    const filteredAndSortedEngagements = useMemo(() => {
      let filtered = engagements.filter(engagement => {
        const matchesSearch = 
          engagement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engagement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engagement.owners.some(owner => 
            owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          engagement.teamMembers.some(member => 
            member.teamMemberName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        
        const matchesStatus = filterStatus === 'all' || 
          (filterStatus === 'active' && engagement.isActive) ||
          (filterStatus === 'inactive' && !engagement.isActive);
        
        const matchesOwner = filterOwner === 'all' ||
          engagement.owners.some(owner => owner.ownerName === filterOwner);
        
        return matchesSearch && matchesStatus && matchesOwner;
      });

      if (sortField) {
        filtered.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sortField) {
            case 'engagementID':
              aValue = a.engagementID;
              bValue = b.engagementID;
              break;
            case 'title':
              aValue = a.title.toLowerCase();
              bValue = b.title.toLowerCase();
              break;
            case 'startDate':
            case 'endDate':
              aValue = new Date(a[sortField]).getTime();
              bValue = new Date(b[sortField]).getTime();
              break;
            case 'isActive':
              aValue = a.isActive ? 1 : 0;
              bValue = b.isActive ? 1 : 0;
              break;
            default:
              aValue = a[sortField]?.toString().toLowerCase() || '';
              bValue = b[sortField]?.toString().toLowerCase() || '';
          }
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
          
          if (sortDirection === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }

      return filtered;
    }, [engagements, searchTerm, filterStatus, filterOwner, sortField, sortDirection]);

    // 🔹 Get unique owners for filter dropdown
    const uniqueOwners = useMemo(() => {
      const owners = new Set<string>();
      engagements.forEach(engagement => {
        engagement.owners.forEach(owner => {
          if (owner.ownerName) owners.add(owner.ownerName);
        });
      });
      return Array.from(owners);
    }, [engagements]);

    // 🔹 Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, filterStatus, filterOwner, sortField, sortDirection]);

    const handleCopy = (engagement: Engagement) => {
      setModalMode('copy');
      setEditingEngagement({
        ...engagement,
        title: `${engagement.title} (Copy)`,
        engagementID: 0
      });
      setIsAddModalOpen(true);
    };
  
    const handleEdit = (engagement: Engagement) => {
      setModalMode('edit');
      setEditingEngagement(engagement);
      setIsAddModalOpen(true);
    };
  
    const handleAddNew = () => {
      setModalMode('add');
      setEditingEngagement(null);
      setIsAddModalOpen(true);
    };
  
    const handleSave = async (data: SaveEngagementRequest) => {
      console.log('Save engagement:', data);
      
      // Show loading toast
      const loadingToast = toast.loading('Saving engagement...', {
        description: 'Please wait while we save your engagement data.',
      });
      
      try {
        const response = await apiClient.post('/engagement/Save', data);
        console.log('Save response:', response);
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        if (response.status > 0) {
          // Refresh the engagements list
          const updatedEngagements = await apiClient.get('/engagement');
          setEngagements(updatedEngagements || []);
          
          setEditingEngagement(null);
          setModalMode('add');
          setIsAddModalOpen(false);
          
          toast.success("Engagement saved successfully!", {
            description: "The engagement has been created/updated successfully.",
            duration: 4000,
          });
        } else {
          throw new Error(response.message || 'Failed to save engagement');
        }
      } catch (err: any) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        console.error('Error saving engagement:', err);
        
        // Show detailed error message
        let errorMessage = "Please check your data and try again.";
        if (err.message.includes('400')) {
          errorMessage = "Invalid data format. Please check all required fields and date formats.";
        } else if (err.message.includes('403')) {
          errorMessage = "Access denied. Please check your authentication.";
        } else if (err.message.includes('500')) {
          errorMessage = "Server error. Please contact support.";
        }
        
        toast.error("Failed to save engagement", {
          description: errorMessage,
          duration: 6000,
          action: {
            label: "Retry",
            onClick: () => handleSave(data)
          }
        });
      }
    };

    // 🔹 Create new task
    const handleCreateTask = async (taskData: CreateTaskRequest) => {
      console.log('Create task:', taskData);
      
      try {
        const response = await apiClient.post('/engagement/tasks', taskData);
        console.log('Task creation response:', response);
        
        if (response.status === 1 || response.success) {
          toast.success("Task created successfully!", {
            description: "The new task has been added to the engagement.",
            duration: 3000,
          });
          return response;
        } else {
          throw new Error(response.message || 'Failed to create task');
        }
      } catch (err) {
        console.error('Error creating task:', err);
        toast.error("Failed to create task", {
          description: "Please try again. If the problem persists, contact support.",
          duration: 4000,
        });
        throw err;
      }
    };

    // 🔹 Delete task
    const handleDeleteTask = async (taskId: number) => {
      console.log('Delete task:', taskId);
      
      try {
        const response = await apiClient.delete(`/Engagement/DeleteEngagement/${taskId}`);
        console.log('Task deletion response:', response);
        
        if (response.status === 1 || response.success) {
          toast.success("Task deleted successfully!", {
            description: "The task has been removed from the engagement.",
            duration: 3000,
          });
          return response;
        } else {
          throw new Error(response.message || 'Failed to delete task');
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        toast.error("Failed to delete task", {
          description: "Please try again. If the problem persists, contact support.",
          duration: 4000,
        });
        throw err;
      }
    };
  
    const handleDelete = async (engagement: Engagement) => {
  // Optimistically remove from UI first
  setEngagements(prev => prev.filter(e => e.engagementID !== engagement.engagementID));

  try {
    const response = await apiClient.delete(`/Engagement/DeleteEngagement/${engagement.engagementID}`);
    toast.success("Engagement deleted successfully!", {
      description: `"${engagement.title}" has been removed.`,
    });
  } catch (err: any) {
    const message = err.response?.data?.message || "Failed to delete engagement.";
    toast.error("Delete failed", { description: message });

    // Revert UI if deletion actually failed
    setEngagements(prev => [...prev, engagement]);
  }
};

  
    // 🔹 Pagination data
    const totalPages = Math.ceil(filteredAndSortedEngagements.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = filteredAndSortedEngagements.slice(startIndex, endIndex);

    if (loading) return <p className="p-4">Loading engagements...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;
  
    return (
      <div className={`p-4 sm:p-6 space-y-6 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-gray-50'}`}>
        <div className="space-y-4">
          
  
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-600 pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
                    List of Engagements
                  </CardTitle>
                  <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    New Engagement
                  </Button>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by title, description, owner, or team member..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterOwner} onValueChange={setFilterOwner}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Owners</SelectItem>
                        {uniqueOwners.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(searchTerm || filterStatus !== 'all' || filterOwner !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterOwner('all');
                      }}
                      className="whitespace-nowrap"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                
                {/* Results Summary */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {currentData.length} of {filteredAndSortedEngagements.length} engagements
                  {(searchTerm || filterStatus !== 'all' || filterOwner !== 'all') && ` (filtered from ${engagements.length} total)`}
                </div>
              </div>
              {/* Engagement Guidelines */}
          <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto text-blue-600 hover:text-blue-700">
                <Info className="w-4 h-4" />
                <span className="font-medium">Engagement Guidelines</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isRulesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                <ul className="space-y-2 text-sm">
                  <li>• Team Member Dates are in sync with Engagement Dates. Any changes to Engagement Dates will be reflected in Team Member Dates as well.</li>
                  <li>• The creator of Engagement will be added as Owner and Team Member by default.</li>
                  <li>• Co-Owner will be added as Team Member by default.</li>
                  <li>• Copying the Engagement will copy all the Details of that Engagement. Any changes will need to be made manually.</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <TableHead className="w-12 font-semibold text-gray-700 dark:text-gray-200">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-2"
                        onClick={() => handleSort('engagementID')}
                      >
                        ID
                        {getSortIcon('engagementID')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-2"
                        onClick={() => handleSort('title')}
                      >
                        Engagements
                        {getSortIcon('title')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Owner</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-2"
                        onClick={() => handleSort('startDate')}
                      >
                        Start Date
                        {getSortIcon('startDate')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-2"
                        onClick={() => handleSort('endDate')}
                      >
                        End Date
                        {getSortIcon('endDate')}
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Team Members</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Tasks</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-2"
                        onClick={() => handleSort('isActive')}
                      >
                        Status
                        {getSortIcon('isActive')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-200">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((engagement, index) => (
                    <TableRow key={`${engagement.engagementID}-${startIndex + index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                      <TableCell className="font-medium text-gray-600 dark:text-gray-300">{startIndex + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{engagement.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(engagement)}
                            className="h-6 w-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {engagement.owners.map(owner => owner.ownerName).join(', ') || '—'}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {new Date(engagement.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {new Date(engagement.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">
                        {engagement.teamMembers.map(member => member.teamMemberName).join(', ') || '—'}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200">{engagement.tasks?.length || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={engagement.isActive
                            ? "border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20"
                            : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"
                          }
                        >
                          {engagement.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(engagement)}
                            className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(engagement)}
                            className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            
              <div className="px-4 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredAndSortedEngagements.length}
                  onPageChange={(page) => setCurrentPage(page)}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>
  
          <AddEngagementModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false)
              setEditingEngagement(null)
              setModalMode('add')
            }}
            onSave={handleSave}
            initialData={editingEngagement}
            mode={modalMode}
            managers={managers.map(m => ({
              id: m.userID,
              name: m.userName
            }))}
            users={users.map(u => ({
              id: u.userID,
              name: u.username,
              email: u.email,
              isActive: u.isActive
            }))}
            currentUser={currentUser ? {
              id: currentUser.userID,
              name: currentUser.username,
              email: currentUser.email,
              isActive: currentUser.isActive
            } : null}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
  
          <CopyEngagementModal
            isOpen={isCopyModalOpen}
            onClose={() => setIsCopyModalOpen(false)}
            onConfirm={() => {}}
            engagementTitle={selectedEngagement?.title || ""}
          />
        </div>
      </div>
    )
  }
  