"use server"

import { v4 as uuidv4 } from "uuid"
import { getUserTasks, setUserTasks } from "./data"
import type { Task } from "./types"
import { requireAuth } from "./auth"

export async function getTasks(userId: string): Promise<Task[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const tasks = await getUserTasks(userId)
    return tasks || []
  } catch (error) {
    console.error("Error getting tasks:", error)
    return []
  }
}

export async function createTask(taskData: Omit<Task, "id" | "createdAt">): Promise<Task> {
  const session = await requireAuth()

  try {
    // Validate task data
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error("Task title is required")
    }

    if (!taskData.userId || taskData.userId !== session.id) {
      throw new Error("Invalid user ID")
    }

    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      title: taskData.title.trim(),
      description: taskData.description?.trim() || "",
      createdAt: new Date().toISOString(),
    }

    const tasks = await getUserTasks(session.id)
    tasks.push(newTask)
    await setUserTasks(session.id, tasks)

    return newTask
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export async function updateTask(task: Task): Promise<Task> {
  const session = await requireAuth()

  try {
    // Validate task data
    if (!task.id || !task.title || task.title.trim().length === 0) {
      throw new Error("Task ID and title are required")
    }

    if (task.userId !== session.id) {
      throw new Error("Unauthorized: You can only update your own tasks")
    }

    const tasks = await getUserTasks(session.id)
    const taskIndex = tasks.findIndex((t) => t.id === task.id)

    if (taskIndex === -1) {
      throw new Error("Task not found")
    }

    // Update the task
    const updatedTask = {
      ...task,
      title: task.title.trim(),
      description: task.description?.trim() || "",
    }

    tasks[taskIndex] = updatedTask
    await setUserTasks(session.id, tasks)

    return updatedTask
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const session = await requireAuth()

  try {
    if (!taskId) {
      throw new Error("Task ID is required")
    }

    const tasks = await getUserTasks(session.id)
    const taskIndex = tasks.findIndex((t) => t.id === taskId)

    if (taskIndex === -1) {
      // Task not found, but don't throw error (idempotent operation)
      return
    }

    // Ensure user owns the task
    if (tasks[taskIndex].userId !== session.id) {
      throw new Error("Unauthorized: You can only delete your own tasks")
    }

    tasks.splice(taskIndex, 1)
    await setUserTasks(session.id, tasks)
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

export async function updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
  const session = await requireAuth()

  try {
    if (!taskId) {
      throw new Error("Task ID is required")
    }

    const tasks = await getUserTasks(session.id)
    const taskIndex = tasks.findIndex((t) => t.id === taskId)

    if (taskIndex === -1) {
      throw new Error("Task not found")
    }

    // Ensure user owns the task
    if (tasks[taskIndex].userId !== session.id) {
      throw new Error("Unauthorized: You can only update your own tasks")
    }

    tasks[taskIndex].completed = completed
    await setUserTasks(session.id, tasks)
  } catch (error) {
    console.error("Error updating task status:", error)
    throw error
  }
}

// Bulk operations for better performance
export async function bulkUpdateTasks(
  taskUpdates: { id: string; completed?: boolean; title?: string; description?: string; deadline?: string }[],
): Promise<void> {
  const session = await requireAuth()

  try {
    const tasks = await getUserTasks(session.id)
    let hasChanges = false

    for (const update of taskUpdates) {
      const taskIndex = tasks.findIndex((t) => t.id === update.id)

      if (taskIndex !== -1 && tasks[taskIndex].userId === session.id) {
        if (update.completed !== undefined) {
          tasks[taskIndex].completed = update.completed
          hasChanges = true
        }
        if (update.title !== undefined) {
          tasks[taskIndex].title = update.title.trim()
          hasChanges = true
        }
        if (update.description !== undefined) {
          tasks[taskIndex].description = update.description.trim()
          hasChanges = true
        }
        if (update.deadline !== undefined) {
          tasks[taskIndex].deadline = update.deadline
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      await setUserTasks(session.id, tasks)
    }
  } catch (error) {
    console.error("Error bulk updating tasks:", error)
    throw error
  }
}
