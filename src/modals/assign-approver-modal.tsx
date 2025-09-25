// "use client"
 
// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
// import { Button } from "../ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
// import { Label } from "../ui/label"
// import { X, Save } from 'lucide-react'
 
// interface AssignApproverModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onSave: (data: any) => void
// }
 
// export function AssignApproverModal({ isOpen, onClose, onSave }: AssignApproverModalProps) {
//   const [formData, setFormData] = useState({
//     user: "",
//     primaryApprover: "",
//     secondaryApprover: ""
//   })
 
//   const handleSave = () => {
//     onSave(formData)
//     onClose()
//     setFormData({ user: "", primaryApprover: "", secondaryApprover: "" })
//   }
 
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <DialogHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
//           <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">Assign Approver</DialogTitle>
//         </DialogHeader>
       
//         <div className="space-y-6 py-6">
//           <div className="space-y-2">
//             <Label htmlFor="user" className="text-sm font-medium text-gray-700 dark:text-gray-300">User</Label>
//             <Select value={formData.user} onValueChange={(value) => setFormData({...formData, user: value})}>
//               <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
//                 <SelectValue placeholder="Select User" />
//               </SelectTrigger>
//               <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                 <SelectItem value="rajesh-kumar" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Rajesh Kumar</SelectItem>
//                 <SelectItem value="priya-sharma" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Priya Sharma</SelectItem>
//                 <SelectItem value="amit-singh" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Amit Singh</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
 
//           <div className="space-y-2">
//             <Label htmlFor="primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Approver</Label>
//             <Select value={formData.primaryApprover} onValueChange={(value) => setFormData({...formData, primaryApprover: value})}>
//               <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
//                 <SelectValue placeholder="Select Approver" />
//               </SelectTrigger>
//               <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                 <SelectItem value="vikram-patel" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Vikram Patel</SelectItem>
//                 <SelectItem value="meera-joshi" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Meera Joshi</SelectItem>
//                 <SelectItem value="arjun-nair" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Arjun Nair</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
 
//           <div className="space-y-2">
//             <Label htmlFor="secondary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Approver</Label>
//             <Select value={formData.secondaryApprover} onValueChange={(value) => setFormData({...formData, secondaryApprover: value})}>
//               <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
//                 <SelectValue placeholder="Select Approver" />
//               </SelectTrigger>
//               <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                 <SelectItem value="none" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">None</SelectItem>
//                 <SelectItem value="sunita-verma" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Sunita Verma</SelectItem>
//                 <SelectItem value="ravi-sharma" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Ravi Sharma</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
 
//         <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
//           <Button variant="destructive" onClick={onClose} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
//             <X className="h-4 w-4" />
//             Cancel
//           </Button>
//           <Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
//             <Save className="h-4 w-4" />
//             Save
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
 
 
// ==================================================== dynamic =================================================

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { X, Save } from 'lucide-react'

import axios from "axios"

interface AssignApproverModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  users: { id: number, name: string }[]
  managers: { id: number, name: string }[]
}

export function AssignApproverModal({ isOpen, onClose, onSave, users, managers }: AssignApproverModalProps) {
  //console.log("Users for modal:", users);
  //console.log("Managers for modal:", managers);
  const [formData, setFormData] = useState({
    user: "",
    primaryApprover: "",
    secondaryApprover: ""
  })

  useEffect(() => {
    if (!isOpen) {
      setFormData({ user: "", primaryApprover: "", secondaryApprover: "" })
    }
  }, [isOpen])

  const handleSave = () => {
    if (!formData.user || !formData.primaryApprover) {
      alert("User and Primary Approver are mandatory.")
      return
    }
    onSave(formData)
    onClose()
  }

  return (
    
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">Assign Approver</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* User */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-sm font-medium text-gray-700 dark:text-gray-300">User</Label>
            <Select value={formData.user} onValueChange={(value) => setFormData({...formData, user: value})}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {users
                .filter(user => user && user.id !== undefined && user.id !== null)
                .map(user => (
                  <SelectItem 
                    key={user.id} 
                    value={user.id.toString()} 
                    className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Approver */}
          <div className="space-y-2">
            <Label htmlFor="primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Approver</Label>
            <Select value={formData.primaryApprover} onValueChange={(value) => setFormData({...formData, primaryApprover: value})}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select Approver" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {managers
                 .filter(manager => manager && manager.id !== undefined && manager.id !== null)
                .map(manager => (
                  <SelectItem 
                    key={manager.id} 
                    value={manager.id.toString()}
                    className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Approver */}
          <div className="space-y-2">
            <Label htmlFor="secondary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Approver</Label>
            <Select value={formData.secondaryApprover} onValueChange={(value) => setFormData({...formData, secondaryApprover: value})}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select Approver" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <SelectItem value="none" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">None</SelectItem>
                {managers
                 .filter(manager => manager && manager.id !== undefined && manager.id !== null)
                .map(manager => (
                  <SelectItem 
                    key={manager.id} 
                    value={manager.id.toString()}
                    className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="destructive" onClick={onClose} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}