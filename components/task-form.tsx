"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { createTask, updateTask } from "@/lib/tasks"

interface TaskFormProps {
  userId: string
  task: Task | null
  onCancel: () => void
  onTaskSaved: (task: Task) => void
}

export default function TaskForm({ userId, task, onCancel, onTaskSaved }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [deadline, setDeadline] = useState<Date | undefined>(task?.deadline ? new Date(task.deadline) : undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let savedTask: Task

      if (task) {
        // Update existing task
        savedTask = await updateTask({
          ...task,
          title,
          description,
          deadline: deadline?.toISOString(),
        })
      } else {
        // Create new task
        savedTask = await createTask({
          userId,
          title,
          description,
          deadline: deadline?.toISOString(),
          completed: false,
        })
      }

      onTaskSaved(savedTask)
    } catch (error) {
      console.error("Error saving task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6 glass-effect animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          {task ? (
            <>
              <Edit className="h-5 w-5 mr-2 text-primary" />
              Edit Task
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5 mr-2 text-primary" />
              Add New Task
            </>
          )}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="transition-all focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all",
                    !deadline && "text-muted-foreground",
                    deadline && "text-foreground border-primary/50",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Set deadline (optional)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
                {deadline && (
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeadline(undefined)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()} className="button-shine transition-all">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : task ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Task
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function PlusCircle(props: React.ComponentProps<typeof CheckCircle>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}

function Edit(props: React.ComponentProps<typeof CheckCircle>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
