"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"

interface CopyEngagementModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  engagementTitle: string
}

export function CopyEngagementModal({ isOpen, onClose, onConfirm, engagementTitle }: CopyEngagementModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Copy Engagement</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 text-center">
          <p className="text-gray-600">
            Are you sure you want to copy the details of this engagement?
          </p>
          <p className="font-medium mt-2">"{engagementTitle}"</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
