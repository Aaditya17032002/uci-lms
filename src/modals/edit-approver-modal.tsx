// "use client"
 
// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
// import { Button } from "../ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
// import { Label } from "../ui/label"
// import { X, Save } from 'lucide-react'
 
// interface EditApproverModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onSave: (data: any) => void
//   employee: any
// }
 
// export function EditApproverModal({ isOpen, onClose, onSave, employee }: EditApproverModalProps) {
//   const [formData, setFormData] = useState({
//     primaryApprover: "",
//     secondaryApprover: ""
//   })
 
//   useEffect(() => {
//     if (employee && isOpen) {
//       // Convert display names back to IDs for the select components
//       const primaryApproverValue = employee.primaryApprover === "Paritosh Unakar" ? "paritosh-unakar" :
//                                    employee.primaryApprover === "Tushar Mishra" ? "tushar-mishra" :
//                                    employee.primaryApprover === "Swet Soni" ? "swet-soni" : ""
     
//       const secondaryApproverValue = employee.secondaryApprover === "Nancy Sheth" ? "nancy-sheth" :
//                                      employee.secondaryApprover === "Krunal Vasava" ? "krunal-vasava" :
//                                      employee.secondaryApprover === "None" ? "none" : ""
 
//       setFormData({
//         primaryApprover: primaryApproverValue,
//         secondaryApprover: secondaryApproverValue
//       })
//     }
//   }, [employee, isOpen])
 
//   const handleSave = () => {
//     onSave({ ...employee, ...formData })
//     onClose()
//   }
 
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <DialogHeader>
//           <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">Edit Approver</DialogTitle>
//         </DialogHeader>
       
//         <div className="space-y-6 py-4">
//           <div>
//             <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
//               {employee?.name || "Employee Name"}
//             </h3>
//           </div>
 
//           <div className="space-y-2">
//             <Label htmlFor="primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Approver</Label>
//             <Select value={formData.primaryApprover} onValueChange={(value) => setFormData({...formData, primaryApprover: value})}>
//               <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white w-64 text-base">
//                 <SelectValue placeholder="Select Primary Approver" />
//               </SelectTrigger>
//               <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                 <SelectItem value="paritosh-unakar" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Paritosh Unakar</SelectItem>
//                 <SelectItem value="tushar-mishra" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Tushar Mishra</SelectItem>
//                 <SelectItem value="swet-soni" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Swet Soni</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
 
//           <div className="space-y-2">
//             <Label htmlFor="secondary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Approver</Label>
//             <Select value={formData.secondaryApprover} onValueChange={(value) => setFormData({...formData, secondaryApprover: value})}>
//               <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white w-64 text-base">
//                 <SelectValue placeholder="Select Secondary Approver" />
//               </SelectTrigger>
//               <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                 <SelectItem value="none" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">None</SelectItem>
//                 <SelectItem value="nancy-sheth" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Nancy Sheth</SelectItem>
//                 <SelectItem value="krunal-vasava" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">Krunal Vasava</SelectItem>
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

interface EditApproverModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  //employee: any
    employee: {
    userId: number;
    userName: string;
    primaryApproverName: string;
    secondaryApproverName: string;
  }
  managers: { id: number, name: string }[]
}

export function EditApproverModal({ isOpen, onClose, onSave, employee, managers }: EditApproverModalProps) {
  const [formData, setFormData] = useState({
    primaryApprover: "",
    secondaryApprover: ""
  })

  useEffect(() => {
    if (employee && isOpen) {
      // const primaryApproverValue = employee.primaryApproverName
      //   ? employee.primaryApproverName.toLowerCase().replace(/\s+/g, "-")
      //   : ""
      // const secondaryApproverValue = employee.secondaryApproverName
      //   ? employee.secondaryApproverName.toLowerCase().replace(/\s+/g, "-")
      //   : "none"

        // Find the manager IDs based on their names
      const primaryManager = managers.find(m => m.name === employee.primaryApproverName);
      const secondaryManager = managers.find(m => m.name === employee.secondaryApproverName);

      // setFormData({
      //   primaryApprover: primaryApproverValue,
      //   secondaryApprover: secondaryApproverValue
      // })

      setFormData({
        primaryApprover: primaryManager?.id.toString() ?? "",
        secondaryApprover: secondaryManager?.id.toString() ?? "none"
      });

    }
  }, [employee, isOpen, managers])


  // Add a helper function to get manager name by ID
  const getManagerNameById = (id: string) => {
    const manager = managers.find(m => m.id.toString() === id);
    return manager?.name ?? "";
  };


 // Inside EditApproverModal
const handleSave = () => {
  if (!formData.primaryApprover) {
    alert("Primary Approver is required");
    return;
  }

  onSave({
    userId: employee.userId,
    primaryApprover: formData.primaryApprover,
    secondaryApprover: formData.secondaryApprover || "none"
  });
  
  onClose();
};
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">Edit Approver</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {employee?.userName || "Employee Name"}
            </h3>
          </div>

          {/* Primary Approver */}
          <div className="space-y-2">
            <Label htmlFor="primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Approver</Label>
            <Select value={formData.primaryApprover} onValueChange={(value) => setFormData({...formData, primaryApprover: value})}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white w-64 text-base">
                <SelectValue placeholder={employee?.primaryApproverName || "Select Primary Approver"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {managers
                .filter((m) => m.id !== undefined && m.id !== null)
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
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white w-64 text-base">
                <SelectValue placeholder= {employee?.secondaryApproverName || "Select Secondary Approver"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <SelectItem value="none" className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">None</SelectItem>
                {managers
                .filter((m) => m.id !== undefined && m.id !== null)
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

