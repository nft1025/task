"use server"

import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "./data"
import type { Task } from "./types"
import { requireAuth } from "./auth"

export async function getTasks(userId: string): Promise<Task[]> {
  const data = await readData()
  return data.tasks.filter((task) => task.userId === userId)
}

export async function createTask(taskData: Omit<Task, "id" | "createdAt">): Promise<Task> {
  await requireAuth()

  const data = await readData()

  const newTask: Task = {
    id: uuidv4(),
    ...taskData,
    createdAt: new Date().toISOString(),
  }

  data.tasks.push(newTask)
  await writeData(data)

  return newTask
}

export async function updateTask(task: Task): Promise<Task> {
  const session = await requireAuth()

  const data = await readData()
  const taskIndex = data.tasks.findIndex((t) => t.id === task.id)

  if (taskIndex === -1) {
    throw new Error("Task not found")
  }

  // Ensure user owns the task
  if (data.tasks[taskIndex].userId !== session.id) {
    throw new Error("Unauthorized")
  }

  data.tasks[taskIndex] = task
  await writeData(data)

  return task
}

export async function deleteTask(taskId: string): Promise<void> {
  const session = await requireAuth()

  const data = await readData()
  const taskIndex = data.tasks.findIndex((t) => t.id === taskId)

  if (taskIndex === -1) {
    return
  }

  // Ensure user owns the task
  if (data.tasks[taskIndex].userId !== session.id) {
    throw new Error("Unauthorized")
  }

  data.tasks.splice(taskIndex, 1)
  await writeData(data)
}

export async function updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
  const session = await requireAuth()

  const data = await readData()
  const taskIndex = data.tasks.findIndex((t) => t.id === taskId)

  if (taskIndex === -1) {
    throw new Error("Task not found")
  }

  // Ensure user owns the task
  if (data.tasks[taskIndex].userId !== session.id) {
    throw new Error("Unauthorized")
  }

  data.tasks[taskIndex].completed = completed
  await writeData(data)
}
