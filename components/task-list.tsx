"use client"

import type { Task } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, Calendar, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { deleteTask, updateTaskStatus } from "@/lib/tasks"
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
      <div className="text-center py-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">No tasks found</h3>
        <p className="text-muted-foreground">Add a new task to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <Card
          key={task.id}
          className={`task-card animate-fade-in ${task.completed ? "opacity-75" : ""}`}
          style={{ animationDelay: `${0.1 * index}s` }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="relative">
                {updatingId === task.id ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                ) : (
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => {
                      handleStatusChange(task.id, checked === true)
                    }}
                    className="h-5 w-5 transition-all duration-300"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium text-lg ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`mt-1 text-sm ${task.completed ? "text-muted-foreground" : ""}`}>{task.description}</p>
                )}
                {task.deadline && (
                  <div className="mt-2 flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    <Badge variant={isOverdue(task) ? "destructive" : "outline"} className="transition-all">
                      {isOverdue(task) ? "Overdue: " : "Due: "}
                      {format(new Date(task.deadline), "PPP")}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                {task.completed ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(task.id)}
              disabled={deletingId === task.id}
              className="transition-all hover:bg-destructive hover:text-destructive-foreground"
            >
              {deletingId === task.id ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-1"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function isOverdue(task: Task): boolean {
  if (!task.deadline || task.completed) return false
  return new Date(task.deadline) < new Date()
}
