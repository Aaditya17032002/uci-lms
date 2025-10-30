"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { X } from 'lucide-react'

interface Comment {
  id: number
  user: {
    name: string
    initials: string
    avatarUrl?: string
  }
  action: string // e.g., "submitted", "approved", "rejected"
  timestamp: string // e.g., "2 months ago (30-May-2025 17:28)"
  commentText?: string
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  title: string
}

export function CommentsModalEmp({ isOpen, onClose, comments, title }: CommentsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Comments
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">No comments available.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={comment.user.avatarUrl || "/placeholder.svg?height=36&width=36&query=user+avatar"} />
                  <AvatarFallback className="bg-blue-600 text-white">{comment.user.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">{comment.user.name}</span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">{comment.action}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{comment.timestamp}</span>
                  </p>
                  {comment.commentText && (
                    <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{comment.commentText}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        
      </DialogContent>
    </Dialog>
  )
}
