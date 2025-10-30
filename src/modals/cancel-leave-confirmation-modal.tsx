"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { useToast } from "../hooks/use-toast"

interface CancelLeaveConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (leaveId: number) => void
  leaveId: number | null
}

export function CancelLeaveConfirmationModal({ isOpen, onClose, onConfirm, leaveId }: CancelLeaveConfirmationModalProps) {
  const { toast } = useToast()

  const handleConfirm = () => {
    if (leaveId !== null) {
      onConfirm(leaveId)
      
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-6 pt-6">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Confirm Cancellation</DialogTitle>
        </DialogHeader>
        <div className="py-4 px-6 text-gray-700 dark:text-gray-300">
          Are you sure you want to cancel this leave request?
        </div>
        <DialogFooter className="flex justify-end gap-3 pt-4 px-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            No
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
