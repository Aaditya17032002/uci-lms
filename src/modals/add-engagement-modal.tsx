// ================================================================= responsive =================================================================
 
"use client"
 
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Save, Plus, X, Search, Edit } from "lucide-react"
import { Badge } from "../ui/badge"
 
interface AddEngagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialData?: any
  mode?: "add" | "edit" | "copy"
}
 
interface TeamMemberTableData {
  id: string
  name: string
  startDate: string
  endDate: string
}
 
export function AddEngagementModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "add",
}: AddEngagementModalProps) {
  const [formData, setFormData] = useState({
    project: "",
    startDate: "",
    endDate: "",
    description: "",
    projectOwners: [] as string[],
    teamMembers: [] as string[],
    selectedTasks: [] as string[],
  })
 
  const [newTask, setNewTask] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [teamMembersTableData, setTeamMembersTableData] = useState<TeamMemberTableData[]>([])
 
  const availableProjectOwners = [
    { id: "paritosh-unakar", name: "Paritosh Unakar" },
    { id: "tushar-mishra", name: "Tushar Mishra" },
    { id: "swet-soni", name: "Swet Soni" },
  ]
 
  const availableTeamMembers = [
    { id: "nancy-sheth", name: "Nancy Sheth" },
    { id: "krunal-vasava", name: "Krunal Vasava" },
    { id: "rajesh-kumar", name: "Rajesh Kumar" },
    { id: "priya-sharma", name: "Priya Sharma" },
    { id: "amit-singh", name: "Amit Singh" },
    { id: "kavita-reddy", name: "Kavita Reddy" },
  ]
 
  const allTasks = [
    "API for Save/Update",
    "Frontend Development",
    "Continuous Integration Setup",
    "Client Meeting",
    "Budget Management",
    "API for Deleting Data",
    "Backend Integration",
    "Cloud Deployment",
    "Project Planning",
    "Team Meeting",
    "Database Design",
    "Unit Testing",
    "Data Migration",
    "Documentation",
    "Stakeholder Communication",
    "API Development",
    "Code Review",
    "Security Audit",
    "Testing",
    "Quality Assurance",
    "Risk Assessment",
    "Legal Compliance Check",
  ]
 
  useEffect(() => {
    if (isOpen && initialData) {
      const parsedOwners =
        typeof initialData.owner === "string" && initialData.owner
          ? initialData.owner.split(", ").map((name: string) => {
              const owner = availableProjectOwners.find((o) => o.name === name)
              return owner ? owner.id : name.toLowerCase().replace(/\s+/g, "-")
            })
          : []
 
      const parsedTeamMembers =
        typeof initialData.teamMembers === "string" && initialData.teamMembers
          ? initialData.teamMembers.split(", ").map((name: string) => {
              const member = availableTeamMembers.find((m) => m.name === name)
              return member ? member.id : name.toLowerCase().replace(/\s+/g, "-")
            })
          : []
 
      setFormData({
        project: initialData.title || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        description: initialData.description || "",
        projectOwners: parsedOwners,
        teamMembers: parsedTeamMembers,
        selectedTasks: Array.isArray(initialData.tasks) ? initialData.tasks : [],
      })
 
      const initialTableMembers = parsedTeamMembers.map((memberId: string) => {
        const member = availableTeamMembers.find((m) => m.id === memberId)
        const memberName = member
          ? member.name
          : memberId
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
        return {
          id: member?.id || memberId,
          name: memberName,
          startDate: initialData.startDate || "2025-01-01",
          endDate: initialData.endDate || "2025-12-31",
        }
      })
      setTeamMembersTableData(initialTableMembers)
    } else if (isOpen && !initialData) {
      setFormData({
        project: "",
        startDate: "",
        endDate: "",
        description: "",
        projectOwners: [],
        teamMembers: [],
        selectedTasks: [],
      })
      setTeamMembersTableData([])
    }
  }, [isOpen, initialData])
 
  const handleTaskToggle = (task: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTasks: prev.selectedTasks.includes(task)
        ? prev.selectedTasks.filter((t: string) => t !== task)
        : [...prev.selectedTasks, task],
    }))
  }
 
  const handleAddTask = () => {
    if (
      newTask.trim() &&
      !formData.selectedTasks.includes(newTask.trim()) &&
      !allTasks.includes(newTask.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        selectedTasks: [...prev.selectedTasks, newTask.trim()],
      }))
      setNewTask("")
    }
  }
 
  const handleSave = () => {
    const savedData = {
      title: formData.project,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      owner: formData.projectOwners
        .map((id: string) => availableProjectOwners.find((o) => o.id === id)?.name || id)
        .join(", "),
      teamMembers: formData.teamMembers
        .map((id: string) => availableTeamMembers.find((m) => m.id === id)?.name || id)
        .join(", "),
      tasks: formData.selectedTasks,
      teamMembersDetails: teamMembersTableData,
    }
    onSave(savedData)
    onClose()
  }
 
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
      const selectedMember = availableTeamMembers.find((m) => m.id === value)
      if (selectedMember) {
        setFormData((prev) => ({
          ...prev,
          teamMembers: [...prev.teamMembers, value],
        }))
        setTeamMembersTableData((prev) => [
          ...prev,
          {
            id: selectedMember.id,
            name: selectedMember.name,
            startDate: formData.startDate || "2025-01-01",
            endDate: formData.endDate || "2025-12-31",
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
 
  const filteredTasks = allTasks.filter((task) =>
    task.toLowerCase().includes(searchTerm.toLowerCase())
  )
 
  const isTaskCustom = (task: string) => !allTasks.includes(task)
 
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
 
  return (
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
          {/* Project / Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Project */}
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Input
                id="project"
                placeholder="test project"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              />
            </div>
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
 
          {/* Description */}
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
 
          {/* Owners + Members */}
          <div className="space-y-4">
            {/* Owners */}
            <div className="space-y-2">
              <Label>Project Owners</Label>
              <Select value="" onValueChange={handleOwnerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project owners" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjectOwners
                    .filter((owner) => !formData.projectOwners.includes(owner.id))
                    .map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.projectOwners.map((ownerId: string) => {
                  const owner = availableProjectOwners.find((o) => o.id === ownerId)
                  return owner ? (
                    <Badge key={owner.id} variant="secondary" className="flex items-center gap-1">
                      {owner.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOwner(owner.id)}
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
                <SelectContent>
                  {availableTeamMembers
                    .filter((m) => !formData.teamMembers.includes(m.id))
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.teamMembers.map((memberId: string) => {
                  const member = availableTeamMembers.find((m) => m.id === memberId)
                  return member ? (
                    <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                      {member.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTeamMember(member.id)}
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
                {filteredTasks.map((task) => (
                  <div key={task} className="flex items-center space-x-2">
                    <Checkbox
                      className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-white-600 data-[state=checked]:text-black"
                      id={task}
                      checked={formData.selectedTasks.includes(task)}
                      onCheckedChange={() => handleTaskToggle(task)}
                    />
                    <label
                      htmlFor={task}
                      className={`text-sm flex items-center gap-1 ${
                        isTaskCustom(task) ? "text-blue-600" : ""
                      }`}
                    >
                      {task}
                      <Edit className="h-3 w-3 text-gray-500" />
                    </label>
                  </div>
                ))}
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
  )
}