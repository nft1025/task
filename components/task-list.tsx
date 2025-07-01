"use client"

import type { Task } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { deleteTask, updateTaskStatus } from "@/lib/tasks"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, completed: boolean) => void
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleDelete = async (taskId: string) => {
    setDeletingId(taskId)
    try {
      await deleteTask(taskId)
      onDelete(taskId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (taskId: string, completed: boolean) => {
    setUpdatingId(taskId)
    try {
      await updateTaskStatus(taskId, completed)
      onStatusChange(taskId, completed)
    } finally {
      setUpdatingId(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 px-4"
      >
        <div className="inline-flex rounded-full bg-purple-100 p-4 mb-4">
          <div className="rounded-full bg-purple-200 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-1">No tasks found</h3>
        <p className="text-muted-foreground">Add a new task to get started.</p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layout
          >
            <Card
              className={`overflow-hidden backdrop-blur-sm bg-white/80 border-none shadow-md hover:shadow-lg transition-all duration-300 ${task.completed ? "opacity-75" : ""}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => {
                        handleStatusChange(task.id, checked === true)
                      }}
                      disabled={updatingId === task.id}
                      className={`h-5 w-5 rounded-full border-2 ${task.completed ? "border-purple-400 bg-purple-400 text-white" : "border-purple-300"} transition-colors duration-300`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-lg transition-all duration-300 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p
                        className={`mt-1 text-sm transition-all duration-300 ${task.completed ? "text-muted-foreground" : ""}`}
                      >
                        {task.description}
                      </p>
                    )}
                    {task.deadline && (
                      <div className="mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <Badge
                          variant={isOverdue(task) ? "destructive" : "outline"}
                          className="transition-all duration-300"
                        >
                          {format(new Date(task.deadline), "PPP")}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors duration-300"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                  disabled={deletingId === task.id}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-300"
                >
                  {deletingId === task.id ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </>
                  )}
                </Button>
              </CardFooter>

              {/* Colorful border based on status */}
              <div
                className={`h-1 w-full ${
                  task.completed
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : isOverdue(task)
                      ? "bg-gradient-to-r from-red-400 to-red-500"
                      : "bg-gradient-to-r from-purple-400 to-pink-500"
                }`}
              ></div>
            </Card>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}

function isOverdue(task: Task): boolean {
  if (!task.deadline || task.completed) return false
  return new Date(task.deadline) < new Date()
}
