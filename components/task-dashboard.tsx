"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, LogOut, Search } from "lucide-react"
import TaskList from "@/components/task-list"
import TaskForm from "@/components/task-form"
import { logout } from "@/lib/auth"
import type { Task } from "@/lib/types"
import { getTasks } from "@/lib/tasks"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"

export default function TaskDashboard({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true)
      try {
        const userTasks = await getTasks(userId)
        setTasks(userTasks)

        // Get username from cookie
        const cookies = document.cookie.split(";")
        const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("session="))
        if (sessionCookie) {
          const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split("=")[1]))
          setUsername(sessionData.username)
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
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
    // First apply status filter
    const statusMatch = filter === "all" ? true : filter === "pending" ? !task.completed : task.completed

    // Then apply search filter if there's a query
    const searchMatch = searchQuery
      ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false
      : true

    return statusMatch && searchMatch
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Task Manager
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome back, {username || "User"}!
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="backdrop-blur-sm bg-white/80 border-none shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50 focus:bg-white transition-all duration-300"
                  />
                </div>
                <Tabs defaultValue="all" value={filter} className="w-full md:w-auto">
                  <TabsList className="grid grid-cols-3 w-full md:w-auto">
                    <TabsTrigger
                      value="all"
                      onClick={() => setFilter("all")}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      onClick={() => setFilter("pending")}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Pending
                    </TabsTrigger>
                    <TabsTrigger
                      value="completed"
                      onClick={() => setFilter("completed")}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {isAddingTask || editingTask ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                    setTasks([savedTask, ...tasks])
                  }
                  setIsAddingTask(false)
                  setEditingTask(null)
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={() => setIsAddingTask(true)}
                className="mb-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <PlusCircle className="h-4 w-4" />
                Add New Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
    </motion.div>
  )
}
