"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Save, Plus, X, Search, Edit } from "lucide-react"
import { Badge } from "../ui/badge"

// --- Interfaces ---

interface Manager {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  email: string
  isActive: boolean
}

// 🚀 NEW INTERFACE: Task object now stores richer data
interface Task { 
    id: number | null // Use actual Task ID or EngagementTaskID if available
    taskName: string
    taskDescription: string
    isGeneric: boolean // Flag to check if it's a generic/custom task (useful for blue text)
    modUser: number | null // User ID of the modifier/creator
}

interface CreateTaskRequest {
  engagementTaskID: number
  engagementID: number
  taskID: number
  taskName: string
  taskDescription: string
  isDeleted: boolean
  isGeneric: boolean
  modUser: number
}

interface AddEngagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialData?: any
  mode?: "add" | "edit" | "copy"
  managers?: Manager[]
  users?: User[]
  currentUser?: User | null
  onCreateTask?: (taskData: CreateTaskRequest) => Promise<any>
  onDeleteTask?: (taskId: number) => Promise<any>
}

interface TeamMemberTableData {
  id: string
  name: string
  startDate: string
  endDate: string
}

// -----------------------------------------------------
// 🎯 UPDATED COMPONENT: AddEngagementModal
// -----------------------------------------------------

export function AddEngagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "add",
  managers = [],
  users = [],
  currentUser = null,
  onCreateTask,
  onDeleteTask,
}: AddEngagementModalProps) {
  
  // 🚀 NEW STATE for Edit Task Modal
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Updated selectedTasks to hold Task objects
  const [formData, setFormData] = useState({
    project: "",
    startDate: "",
    endDate: "",
    description: "",
    projectOwners: [] as string[],
    teamMembers: [] as string[],
    selectedTasks: [] as Task[], // 👈 Changed to Task[]
  })

  const [newTask, setNewTask] = useState("")
  useEffect(() => {
    if (!isOpen) {
      setNewTask(""); // clear the "Add Task" input
    }
  }, [isOpen]);


  const [searchTerm, setSearchTerm] = useState("")
  const [teamMembersTableData, setTeamMembersTableData] = useState<TeamMemberTableData[]>([])

  const availableProjectOwners = managers.length > 0 ? managers : [
    { id: 1, name: "Loading..." }
  ]

  const availableTeamMembers = users.length > 0 ? users : [
    { id: 1, name: "Loading..." }
  ]

  // 🚀 UPDATED STATE: allTasks now stores Task objects
  const [allTasksFromApi, setAllTasksFromApi] = useState<Task[]>([]) 
  
  // Helper function to unify API response shape
  const mapApiTaskToTask = (apiTask: any): Task => ({
    // Prioritize richer ID if available, otherwise assume 0 or null for new/generic
    id: apiTask.taskID || apiTask.engagementTaskID || null, 
    taskName: apiTask.taskName || '',
    taskDescription: apiTask.taskDescription || apiTask.taskName || '',
    isGeneric: apiTask.isGeneric === true, // Ensure boolean
    modUser: apiTask.modUser || null,
  });


  // 💡 API Fetch and Initial Data useEffect
  useEffect(() => {
    if (!isOpen) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch("https://localhost:7080/api/Engagement/tasks", {
          method: "GET",
          credentials: "include", 
        });
        const text = await res.text(); 
        const data = JSON.parse(text); 
        console.log("Raw API task response:", data);
        
        const apiTasks: Task[] = data.tasks 
          ? data.tasks.map(mapApiTaskToTask) 
          : [];

        setAllTasksFromApi(apiTasks);

        // 🚀 Map initialData.tasks to the new Task[] interface
        if (initialData?.tasks) {
            const initialSelectedTasks: Task[] = initialData.tasks.map((t: any) => {
                // If data is just a string (old format), find the full object or create a placeholder
                if (typeof t === 'string') {
                    return apiTasks.find(at => at.taskName === t) || { 
                        id: null, 
                        taskName: t, 
                        taskDescription: t, 
                        isGeneric: true, 
                        modUser: currentUser?.id || 1 
                    };
                }
                // If it's already an object, map it
                return mapApiTaskToTask(t);
            });
            setFormData(prev => ({ ...prev, selectedTasks: initialSelectedTasks }));
        }

      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setAllTasksFromApi([]);
      }
    };

    fetchTasks();

    // Reset non-task form data on open or initialData change
    if (initialData) {
        // This is complex, so for brevity, I'll assume the rest of your useEffect logic 
        // that handles project/owner/member data remains, but will focus on the task part:
        const parsedOwners = initialData.owners ? initialData.owners.map((owner: any) => String(owner.userID || owner.id)) : [];
        const parsedTeamMembers = initialData.teamMembers ? initialData.teamMembers.map((member: any) => String(member.userID || member.id)) : [];
        
        setFormData(prev => ({
            ...prev,
            project: initialData.title || "",
            startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "", 
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
            description: initialData.description || "",
            projectOwners: parsedOwners,
            teamMembers: parsedTeamMembers,
            // selectedTasks will be set by the fetchTasks function above
        }));
        
        // Re-calculate team members table data here if needed (copied from your original)
        const initialTableMembers = parsedTeamMembers.map((memberId: string) => {
            const member = availableTeamMembers.find((m) => m.id === Number(memberId))
            const memberName = member ? member.name : `User ${memberId}`
            const initialMemberData = initialData.teamMembers.find(
                (m: any) => String(m.userID || m.id) === memberId
            );
          
            return {
              id: String(member?.id || memberId),
              name: memberName,
              startDate: initialMemberData?.startDate ? initialMemberData.startDate.split('T')[0] : initialData.startDate.split('T')[0] || "",
              endDate: initialMemberData?.endDate ? initialMemberData.endDate.split('T')[0] : initialData.endDate.split('T')[0] || "",
            }
        });
        setTeamMembersTableData(initialTableMembers);

    } else if (isOpen && mode === "add") {
        const currentUserOwners = currentUser ? [String(currentUser.id)] : [];
        const currentUserMembers = currentUser ? [String(currentUser.id)] : [];
        
        setFormData(prev => ({
            ...prev,
            project: "",
            startDate: "",
            endDate: "",
            description: "",
            projectOwners: currentUserOwners,
            teamMembers: currentUserMembers,
            selectedTasks: [],
        }));
        
        const currentUserTableData = currentUser ? [{
            id: String(currentUser.id),
            name: currentUser.name,
            startDate: "",
            endDate: "",
        }] : [];
        setTeamMembersTableData(currentUserTableData);
    }

  }, [isOpen, initialData, currentUser, mode, availableTeamMembers]); // Dependencies for initial data load


  // 🔄 Handlers for Task Selection
  const handleTaskToggle = (taskName: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTasks.some((t: Task) => t.taskName === taskName);
      
      if (isSelected) {
        // Deselect
        return {
          ...prev,
          selectedTasks: prev.selectedTasks.filter((t: Task) => t.taskName !== taskName),
        };
      } else {
        // Select: find the full task object or create a basic generic one
        const taskObj = allTasksFromApi.find(t => t.taskName === taskName) || { 
            id: null, // No ID yet, will be assigned by backend on save
            taskName: taskName, 
            taskDescription: taskName, 
            isGeneric: true, // Mark as generic/custom if not found in API list
            modUser: currentUser?.id || 1 
        };
        return {
          ...prev,
          selectedTasks: [...prev.selectedTasks, taskObj],
        };
      }
    });
  }

  // ➕ Handlers for Adding New Task
  const handleAddTask = async () => {
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;

    // Check against all known task names (API and selected)
    const allKnownTaskNames = new Set([...allTasksFromApi.map(t => t.taskName), ...formData.selectedTasks.map(t => t.taskName)]);
    if (allKnownTaskNames.has(trimmedTask)) {
      alert("Task Name Already Exists!");
      return;
    }

    try {
      const payload: CreateTaskRequest = {
        engagementTaskID: 0,
        engagementID: initialData?.engagementID || 0,
        taskID: 0, // Should be set by backend on creation
        taskName: trimmedTask,
        taskDescription: trimmedTask, 
        isDeleted: false,
        isGeneric: true,
        modUser: currentUser?.id || 1,
      };

      const res = await fetch("https://localhost:7080/api/Engagement/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to add task: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Task created:", data);
      
      // Assume backend returns the full created task object with IDs
      const newTaskObj: Task = mapApiTaskToTask(data.task || payload);

      // Update frontend state immediately
      setAllTasksFromApi((prev) => [...prev, newTaskObj]); 
      setFormData((prev) => ({
        ...prev,
        selectedTasks: [...prev.selectedTasks, newTaskObj],
      }));

      setNewTask(""); // Clear input
    } catch (err) {
      console.error(err);
      alert("Failed to add task. Check console for details.");
    }
  };


  // ✏️ NEW: Edit Task Handlers
  const handleOpenEditTaskModal = (task: Task) => {
      // Find the *latest* version of the task from selectedTasks (in case it was just edited)
      const latestTask = formData.selectedTasks.find(t => t.taskName === task.taskName) || task;
      setTaskToEdit(latestTask);
      setIsEditTaskModalOpen(true);
  }

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    // 1. Update the list of all available tasks (allTasksFromApi)
    // We update by name since the ID might be null for generic tasks
    setAllTasksFromApi(prev => 
        prev.map(t => t.taskName === updatedTask.taskName ? updatedTask : t)
    );

    // 2. Update the list of selected tasks (formData.selectedTasks)
    setFormData(prev => ({
        ...prev,
        selectedTasks: prev.selectedTasks.map(t => t.taskName === updatedTask.taskName ? updatedTask : t)
    }));
    
    console.log("Task updated locally:", updatedTask);
  }, []); 

  // 💾 Update handleSave to use the richer task data
  const handleSave = () => {
    // ... (Your existing validation and date formatting logic remains the same) ...

    if (!formData.project.trim()) { alert('Project title is required'); return; }
    if (!formData.startDate || !formData.endDate) { alert('Start date and end date are required'); return; }
    if (formData.projectOwners.length === 0) { alert('At least one project owner is required'); return; }


    // --- Date Formatting Logic (Copied from your code) ---
    const formatDateForAPI = (dateString: string) => {
        if (!dateString) { return new Date().toISOString(); }
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(dateString + 'T00:00:00.000Z');
            const now = new Date();
            date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            return date.toISOString();
        }
        if (dateString.includes('T')) {
            if (!dateString.includes('.')) {
                const date = new Date(dateString);
                date.setMilliseconds(new Date().getMilliseconds());
                return date.toISOString();
            }
            return dateString;
        }
        try {
            const date = new Date(dateString);
            const now = new Date();
            date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            return date.toISOString();
        } catch (e) {
            console.error('Failed to convert date:', dateString, e);
            return new Date().toISOString();
        }
    };
    // --- End Date Formatting Logic ---

    const engagementStartDate = formatDateForAPI(formData.startDate);
    const engagementEndDate = formatDateForAPI(formData.endDate);
    
    const savedData = {
      engagementID: initialData?.engagementID || 0,
      title: formData.project.trim(),
      startDate: engagementStartDate,
      endDate: engagementEndDate,
      description: formData.description.trim() || formData.project.trim(),
      owners: formData.projectOwners.length > 0 ? formData.projectOwners.map((id: string) => {
        const owner = availableProjectOwners.find((o) => o.id === Number(id));
        return {
          mappingID: 0,
          engagementID: initialData?.engagementID || 0,
          userID: Number(id),
          ownerName: owner?.name || `User ${id}`
        };
      }) : [{ mappingID: 0, engagementID: initialData?.engagementID || 0, userID: 1, ownerName: "Default Owner" }],
      teamMembers: teamMembersTableData.length > 0 ? teamMembersTableData.map((member) => ({
        mappingID: 0,
        userID: Number(member.id),
        teamMemberName: member.name,
        startDate: formatDateForAPI(member.startDate || formData.startDate),
        endDate: formatDateForAPI(member.endDate || formData.endDate),
        maxWeeklyHours: 40,
        createdBy: 1,
        modifiedBy: 1,
        modifiedOn: new Date().toISOString(),
        createdOn: new Date().toISOString(),
        engagementID: initialData?.engagementID || 0
      })) : [],
      // 💡 Use the richer Task objects for the tasks payload
      tasks: formData.selectedTasks.length > 0 ? formData.selectedTasks.map((task: Task) => ({
        engagementTaskID: initialData?.engagementID || 0, // Placeholder
        engagementID: initialData?.engagementID || 0,
        taskID: task.id || 0, // Use task ID if available
        taskName: task.taskName.trim(),
        taskDescription: task.taskDescription.trim(),
        isDeleted: false,
        isGeneric: task.isGeneric, // Use the isGeneric flag from the Task object
        modUser: task.modUser || 1
      })) : [],
      modUser: currentUser?.id || 1 
    };
    
    console.log('Final payload being sent to API:', JSON.stringify(savedData, null, 2));
    onSave(savedData);
    onClose();
  }


  // ... (Owner/Member handlers remain the same) ...

  const handleOwnerSelect = (value: string) => {
    if (!formData.projectOwners.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        projectOwners: [...prev.projectOwners, value],
      }))
    }
  }

  const handleRemoveOwner = (idToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      projectOwners: prev.projectOwners.filter((id: string) => id !== idToRemove),
    }))
  }

  const handleTeamMemberSelect = (value: string) => {
    if (!formData.teamMembers.includes(value)) {
      const selectedMember = availableTeamMembers.find((m) => m.id === Number(value))
      if (selectedMember) {
        setFormData((prev) => ({
          ...prev,
          teamMembers: [...prev.teamMembers, value],
        }))
        setTeamMembersTableData((prev) => [
          ...prev,
          {
            id: String(selectedMember.id),
            name: selectedMember.name,
            startDate: formData.startDate || "",
            endDate: formData.endDate || "",
          },
        ])
      }
    }
  }

  const handleRemoveTeamMember = (idToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((id: string) => id !== idToRemove),
    }))
    setTeamMembersTableData((prev) => prev.filter((member) => member.id !== idToRemove))
  }


  // 💡 Use useMemo for filtering tasks based on taskName
  const allTaskNames = useMemo(() => allTasksFromApi.map(t => t.taskName), [allTasksFromApi]);
  const selectedTaskNames = useMemo(() => formData.selectedTasks.map(t => t.taskName), [formData.selectedTasks]);
  
  // Combine all unique task names for the filter list
  const combinedTaskNames = useMemo(() => {
    const names = new Set(allTaskNames); 
    selectedTaskNames.forEach(name => names.add(name));
    return Array.from(names);
  }, [allTaskNames, selectedTaskNames]);


  const filteredTaskNames = useMemo(() => {
    return combinedTaskNames.filter(
      (taskName) =>
        taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        selectedTaskNames.includes(taskName) // Always include selected tasks
    );
  }, [combinedTaskNames, searchTerm, selectedTaskNames]);

  // Find the full Task object for rendering
  const getTaskObjectByName = useCallback((taskName: string): Task => {
    // 1. Check selected tasks first (might contain local edits)
    const selectedTask = formData.selectedTasks.find(t => t.taskName === taskName);
    if (selectedTask) return selectedTask;

    // 2. Check API tasks
    const apiTask = allTasksFromApi.find(t => t.taskName === taskName);
    if (apiTask) return apiTask;
           
    // 3. Fallback (shouldn't happen often)
    return { id: null, taskName, taskDescription: taskName, isGeneric: true, modUser: currentUser?.id || 1 };
  }, [formData.selectedTasks, allTasksFromApi, currentUser]);


  const isTaskCustom = (taskName: string) => {
    const task = getTaskObjectByName(taskName);
    // You define "custom" - I'll assume it means 'isGeneric' is true
    return task.isGeneric; 
  }

  // Utility function (from your original code)
  const getModalTitle = () => {
    switch (mode) {
      case "edit":
        return "Edit Engagement"
      case "copy":
        return "Add New Engagement"
      default:
        return "Add New Engagement"
    }
  }

  // -----------------------------------------------------
// 🚀 NEW COMPONENT: EditTaskModal
// -----------------------------------------------------

  interface EditTaskModalProps {
      task: Task | null; // The task data being edited
      isOpen: boolean;
      onClose: () => void;
      onSave: (updatedTask: Task) => void;
      onDeleteTask?: (taskId: number) => void;
      currentUser: User | null;
  }

  function EditTaskModal({ task, isOpen, onClose, onSave, onDeleteTask, currentUser }: EditTaskModalProps) {
      // Local state for the task being edited
      const [editData, setEditData] = useState<Task | null>(task);

      // Update local state when 'task' prop changes
      useEffect(() => {
          setEditData(task);
      }, [task]);

      const handleTaskUpdateSave = async () => {
          if (!editData || !editData.taskName.trim()) {
              alert("Task Name cannot be empty.");
              return;
          }

          const payload = {
              engagementTaskID: editData.id || 0,  // existing task ID
              engagementID: 0, // set engagement ID if needed
              taskID: editData.id || 0,
              taskName: editData.taskName.trim(),
              taskDescription: editData.taskDescription.trim() || editData.taskName.trim(),
              isGeneric: editData.isGeneric,
              modUser: currentUser?.id || 1
          };

          try {
              const res = await fetch("https://localhost:7080/api/Engagement/tasks", {
                  method: "POST", // assuming update uses PUT
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                  credentials: "include",
              });

              if (!res.ok) {
                  throw new Error(`Failed to update task: ${res.statusText}`);
              }

              const updatedTask = await res.json();

              // Call parent onSave callback to update state in AddEngagementModal
              if (onSave) {
                  onSave({
                      ...editData,
                      taskName: updatedTask.taskName,
                      taskDescription: updatedTask.taskDescription
                  });
              }
              // Update selectedTasks
              const updatedSelectedTasks = formData.selectedTasks.map((t: Task) =>
                t.id === updatedTask.id ? { ...t, ...updatedTask } : t
              );

              setFormData((prev) => ({
                ...prev,
                selectedTasks: updatedSelectedTasks,
              }));

              const updatedAllTasks = allTasksFromApi.map((t: Task) =>
                t.id === updatedTask.id ? { ...t, ...updatedTask } : t
              );

              setAllTasksFromApi(updatedAllTasks);


              onClose(); // Close the modal
          } catch (err) {
              console.error(err);
              
          }
      };


      const handleDelete = async () => {
          if (!editData || !editData.id) return; // ✅ guard clause

          // Call parent callback if provided
          if (onDeleteTask) {
              onDeleteTask(editData.id);
          }

          try {
              const res = await fetch(`https://localhost:7080/api/Engagement/tasks/${editData.id}`, {
                  method: "DELETE",
                  credentials: "include",
              });

              if (!res.ok) throw new Error(`Failed to delete task: ${res.statusText}`);

              // Optionally call onSave to update local state
              onSave({ ...editData, isDeleted: true } as Task);
              setFormData((prev: typeof formData) => ({
                ...prev,
                selectedTasks: prev.selectedTasks.filter((t: Task) => t.id !== editData.id),
              }));
              setAllTasksFromApi((prev) => prev.filter((t: Task) => t.id !== editData.id));

              
              onClose();
          } catch (err) {
              console.error(err);
              alert("Failed to delete task. See console for details.");
          }
      };

      const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setEditData(prev => prev ? { ...prev, taskName: e.target.value } : null);
      };

      const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setEditData(prev => prev ? { ...prev, taskDescription: e.target.value } : null);
      };

      if (!editData) return null; // Don't render if no task data

      const creatorName = editData.modUser 
          ? `User ID: ${editData.modUser}` 
          : 'Unknown/New Task';

      return (
          <Dialog open={isOpen} onOpenChange={onClose}>
              <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                      <DialogTitle>Edit Task: {editData.taskName}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      
                      <div className="space-y-2">
                          <Label htmlFor="taskName">Task Name *</Label>
                          <Input
                              id="taskName"
                              value={editData.taskName}
                              onChange={handleNameChange}
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <Label htmlFor="taskDescription">Description</Label>
                          <Textarea
                              id="taskDescription"
                              placeholder="Enter task description"
                              value={editData.taskDescription}
                              onChange={handleDescriptionChange}
                              className="min-h-[80px]"
                          />
                      </div>

                      <div className="text-sm text-gray-500">
                          Modified By: {creatorName}
                      </div>
                  </div>
                  <DialogFooter>
                      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                      <Button onClick={handleTaskUpdateSave} className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" /> Save Changes
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full sm:max-w-3xl lg:max-w-6xl h-[95vh] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-0">
          {/* Header */}
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-4 sm:px-6 pt-6">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {getModalTitle()}
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Project / Dates - Form fields are here... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Input
                        id="project"
                        placeholder="test project"
                        value={formData.project}
                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        min={formData.startDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                    id="description"
                    placeholder="test project description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px]"
                />
            </div>
            
            {/* Owners + Members - Select and Badge display... */}
            <div className="space-y-4">
                {/* Owners */}
                <div className="space-y-2">
                    <Label>Project Owners</Label>
                    <Select value="" onValueChange={handleOwnerSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select project owners" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto" position="popper" side="bottom">
                            {availableProjectOwners
                                .filter((owner) => !formData.projectOwners.includes(String(owner.id)))
                                .map((owner) => (
                                    <SelectItem key={owner.id} value={String(owner.id)}>
                                        {owner.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.projectOwners.map((ownerId: string) => {
                            const owner = availableProjectOwners.find((o) => o.id === Number(ownerId))
                            return owner ? (
                                <Badge key={owner.id} variant="secondary" className="flex items-center gap-1">
                                    {owner.name}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOwner(String(owner.id))}
                                        className="h-4 w-4 p-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ) : null
                        })}
                    </div>
                </div>

                {/* Members */}
                <div className="space-y-2">
                    <Label>Team Members</Label>
                    <Select value="" onValueChange={handleTeamMemberSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select team members" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto" position="popper" side="bottom">
                            {availableTeamMembers
                                .filter((m) => !formData.teamMembers.includes(String(m.id)))
                                .map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.teamMembers.map((memberId: string) => {
                            const member = availableTeamMembers.find((m) => m.id === Number(memberId))
                            return member ? (
                                <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                                    {member.name}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveTeamMember(String(member.id))}
                                        className="h-4 w-4 p-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ) : null
                        })}
                    </div>
                </div>
            </div>

            {/* Team members table */}
            {teamMembersTableData.length > 0 && (
                <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm overflow-x-auto">
                    <Table className="min-w-[500px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Team Member</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMembersTableData.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="date"
                                            value={member.startDate}
                                            onChange={(e) =>
                                                setTeamMembersTableData((prev) =>
                                                    prev.map((m) =>
                                                        m.id === member.id ? { ...m, startDate: e.target.value } : m
                                                    )
                                                )
                                            }
                                            className="h-8 px-2 py-1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="date"
                                            value={member.endDate}
                                            onChange={(e) =>
                                                setTeamMembersTableData((prev) =>
                                                    prev.map((m) =>
                                                        m.id === member.id ? { ...m, endDate: e.target.value } : m
                                                    )
                                                )
                                            }
                                            className="h-8 px-2 py-1"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Tasks Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Search */}
                <div className="relative flex items-center w-full sm:w-64">
                  <Search className="absolute left-2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search for tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {/* Add Task */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <Badge variant="secondary" className="self-start sm:self-center">
                    {formData.selectedTasks.length} Tasks Selected
                  </Badge>
                  <Input
                    placeholder="Enter task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                    className="w-full sm:w-48"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddTask} size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>
              </div>

              <div className="text-sm text-blue-600">* Blue text indicates tasks that are created by me</div>

              <div className="border rounded-lg p-3 sm:p-4 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 🚀 FilteredTasks now works with names, but we need the full object for the handler */}
                  {filteredTaskNames.map((taskName) => {
                    const task = getTaskObjectByName(taskName);
                    return (
                    <div key={taskName} className="flex items-center space-x-2 justify-between group">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                          id={taskName}
                          checked={selectedTaskNames.includes(taskName)}
                          onCheckedChange={() => handleTaskToggle(taskName)}
                        />
                        <label
                          htmlFor={taskName}
                          className={`text-sm flex items-center gap-1 cursor-pointer ${
                            isTaskCustom(taskName) ? "text-blue-600" : ""
                          }`}
                        >
                          {taskName}
                        </label>
                      </div>
                      
                      {/* 🚀 NEW: Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        // Pass the full Task object to the handler
                        onClick={() => handleOpenEditTaskModal(task)} 
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Task"
                      >
                        <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                      </Button>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 🚀 Render the new Edit Task Modal */}
      <EditTaskModal 
          task={taskToEdit}
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
          onSave={handleUpdateTask}
          currentUser={currentUser}
      />
    </>
  )
}