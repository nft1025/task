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
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { createTask, updateTask } from "@/lib/tasks"
import { motion } from "framer-motion"

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
  const [calendarOpen, setCalendarOpen] = useState(false)

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-3 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="absolute right-4 top-4 hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {task ? "Edit Task" : "Add New Task"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-lg font-medium bg-white/50 focus:bg-white transition-all duration-300 border-purple-100 focus:border-purple-300"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none bg-white/50 focus:bg-white transition-all duration-300 border-purple-100 focus:border-purple-300"
              />
            </div>
            <div className="space-y-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-purple-100 hover:border-purple-300 transition-all duration-300",
                      !deadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Set deadline (optional)"}
                    {deadline && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeadline(undefined)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => {
                      setDeadline(date)
                      setCalendarOpen(false)
                    }}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border border-purple-100"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Saving...
                </div>
              ) : task ? (
                "Update Task"
              ) : (
                "Add Task"
              )}
            </Button>
          </CardFooter>

          {/* Colorful border */}
          <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
        </form>
      </Card>
    </motion.div>
  )
}
