"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, LogOut, CheckCircle, Clock, ListTodo } from "lucide-react"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import { logout } from "@/lib/auth"
import type { Task } from "@/lib/types"
import { getTasks } from "@/lib/tasks"
import { ModeToggle } from "@/components/mode-toggle"

export default function TaskDashboard({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true)
      try {
        const userTasks = await getTasks(userId)
        setTasks(userTasks || [])
      } catch (error) {
        console.error("Error loading tasks:", error)
        setTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [userId])

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const pendingCount = tasks.filter((task) => !task.completed).length
  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold gradient-text">Task Manager</h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="transition-all hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 glass-effect animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <h2 className="text-3xl font-bold">{tasks.length}</h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ListTodo className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-effect animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h2 className="text-3xl font-bold">{pendingCount}</h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-effect animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <h2 className="text-3xl font-bold">{completedCount}</h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-8 glass-effect animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <Tabs defaultValue="all" value={filter} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger
              value="all"
              onClick={() => setFilter("all")}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <ListTodo className="mr-2 h-4 w-4" />
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              onClick={() => setFilter("pending")}
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              onClick={() => setFilter("completed")}
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all duration-300"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {isAddingTask || editingTask ? (
        <TaskForm
          userId={userId}
          task={editingTask}
          onCancel={() => {
            setIsAddingTask(false)
            setEditingTask(null)
          }}
          onTaskSaved={(savedTask) => {
            if (editingTask) {
              setTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)))
            } else {
              setTasks([...tasks, savedTask])
            }
            setIsAddingTask(false)
            setEditingTask(null)
          }}
        />
      ) : (
        <Button
          onClick={() => setIsAddingTask(true)}
          className="mb-6 flex items-center gap-2 button-shine animate-pulse-slow"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Task
        </Button>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading your tasks...</p>
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onEdit={setEditingTask}
          onDelete={(taskId) => {
            setTasks(tasks.filter((t) => t.id !== taskId))
          }}
          onStatusChange={(taskId, completed) => {
            setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)))
          }}
        />
      )}
    </div>
  )
}
