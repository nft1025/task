"use server"

import { promises as fs } from "fs"
import path from "path"
import type { User, Task } from "./types"

interface DataStore {
  users: User[]
  tasks: Task[]
}

const DATA_FILE = path.join(process.cwd(), "data.json")

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch (error) {
    const initialData: DataStore = {
      users: [],
      tasks: [],
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2))
  }
}

export async function readData(): Promise<DataStore> {
  await initDataFile()

  const data = await fs.readFile(DATA_FILE, "utf8")
  return JSON.parse(data) as DataStore
}

export async function writeData(data: DataStore): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}
