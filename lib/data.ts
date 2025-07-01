"use server"

import { getRedisClient, serialize, deserialize, testRedisConnection } from "./redis"
import type { User, Task } from "./types"

interface DataStore {
  users: User[]
  tasks: Task[]
}

const REDIS_KEYS = {
  USERS: "taskmanager:users",
  USER_TASKS: (userId: string) => `taskmanager:tasks:${userId}`,
  ALL_TASKS: "taskmanager:all_tasks",
  DATA_STORE: "taskmanager:data",
  HEALTH: "taskmanager:health",
  USER_COUNT: "taskmanager:user_count",
  TASK_COUNT: "taskmanager:task_count",
}

// TTL for cached data (2 hours for Redis Cloud)
const CACHE_TTL = 7200

/**
 * Initialize data store with default values
 */
async function initData(): Promise<DataStore> {
  const redis = await getRedisClient()

  const initialData: DataStore = {
    users: [],
    tasks: [],
  }

  try {
    // Use pipeline for atomic operations (Redis Cloud supports pipelines)
    const pipeline = redis.pipeline()
    pipeline.set(REDIS_KEYS.USERS, serialize(initialData.users))
    pipeline.set(REDIS_KEYS.ALL_TASKS, serialize(initialData.tasks))
    pipeline.set(REDIS_KEYS.DATA_STORE, serialize(initialData))
    pipeline.set(REDIS_KEYS.HEALTH, new Date().toISOString(), "EX", CACHE_TTL)
    pipeline.set(REDIS_KEYS.USER_COUNT, "0")
    pipeline.set(REDIS_KEYS.TASK_COUNT, "0")

    const results = await pipeline.exec()
    console.log("[Redis Cloud] Initialized data store, pipeline results:", results?.length)

    return initialData
  } catch (error) {
    console.error("[Redis Cloud] Failed to initialize:", error)
    throw new Error("Failed to initialize data store")
  }
}

/**
 * Read complete data store
 */
export async function readData(): Promise<DataStore> {
  try {
    const redis = await getRedisClient()
    const data = await redis.get(REDIS_KEYS.DATA_STORE)

    if (!data) {
      console.log("[Redis Cloud] No existing data found, initializing...")
      return await initData()
    }

    const parsedData = deserialize<DataStore>(data)
    if (!parsedData || !Array.isArray(parsedData.users) || !Array.isArray(parsedData.tasks)) {
      console.log("[Redis Cloud] Invalid data format, reinitializing...")
      return await initData()
    }

    return parsedData
  } catch (error) {
    console.error("[Redis Cloud] Error reading data:", error)
    // Return empty data as fallback
    return { users: [], tasks: [] }
  }
}

/**
 * Write complete data store with atomic operations
 */
export async function writeData(data: DataStore): Promise<void> {
  try {
    const redis = await getRedisClient()

    // Use pipeline for atomic updates
    const pipeline = redis.pipeline()
    pipeline.set(REDIS_KEYS.DATA_STORE, serialize(data))
    pipeline.set(REDIS_KEYS.USERS, serialize(data.users))
    pipeline.set(REDIS_KEYS.ALL_TASKS, serialize(data.tasks))
    pipeline.set(REDIS_KEYS.HEALTH, new Date().toISOString(), "EX", CACHE_TTL)
    pipeline.set(REDIS_KEYS.USER_COUNT, data.users.length.toString())
    pipeline.set(REDIS_KEYS.TASK_COUNT, data.tasks.length.toString())

    const results = await pipeline.exec()
    console.log("[Redis Cloud] Data written successfully, operations:", results?.length)
  } catch (error) {
    console.error("[Redis Cloud] Error writing data:", error)
    throw new Error("Failed to save data to Redis Cloud")
  }
}

/**
 * Get all users with Redis Cloud optimization
 */
export async function getUsers(): Promise<User[]> {
  try {
    const redis = await getRedisClient()
    const users = await redis.get(REDIS_KEYS.USERS)

    if (!users) {
      console.log("[Redis Cloud] Users cache miss, loading from data store...")
      const data = await readData()
      // Cache the users data with TTL
      await redis.set(REDIS_KEYS.USERS, serialize(data.users), "EX", CACHE_TTL)
      return data.users
    }

    const parsedUsers = deserialize<User[]>(users)
    return parsedUsers || []
  } catch (error) {
    console.error("[Redis Cloud] Error getting users:", error)
    return []
  }
}

/**
 * Set all users with Redis Cloud optimization
 */
export async function setUsers(users: User[]): Promise<void> {
  try {
    const redis = await getRedisClient()

    // Update users cache and main data store atomically
    const pipeline = redis.pipeline()
    pipeline.set(REDIS_KEYS.USERS, serialize(users), "EX", CACHE_TTL)
    pipeline.set(REDIS_KEYS.USER_COUNT, users.length.toString())

    // Also update the main data store
    const data = await readData()
    data.users = users
    pipeline.set(REDIS_KEYS.DATA_STORE, serialize(data))

    await pipeline.exec()
    console.log(`[Redis Cloud] Updated ${users.length} users`)
  } catch (error) {
    console.error("[Redis Cloud] Error setting users:", error)
    throw new Error("Failed to save users")
  }
}

/**
 * Get tasks for a specific user with Redis Cloud caching
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    if (!userId) {
      return []
    }

    const redis = await getRedisClient()
    const cacheKey = REDIS_KEYS.USER_TASKS(userId)
    const tasks = await redis.get(cacheKey)

    if (!tasks) {
      console.log(`[Redis Cloud] User tasks cache miss for user ${userId}`)
      // Get tasks from main data store and cache them
      const data = await readData()
      const userTasks = data.tasks.filter((task) => task.userId === userId)

      // Cache user tasks with TTL
      await redis.set(cacheKey, serialize(userTasks), "EX", CACHE_TTL)
      return userTasks
    }

    const parsedTasks = deserialize<Task[]>(tasks)
    return parsedTasks || []
  } catch (error) {
    console.error("[Redis Cloud] Error getting user tasks:", error)
    return []
  }
}

/**
 * Set tasks for a specific user with Redis Cloud optimization
 */
export async function setUserTasks(userId: string, tasks: Task[]): Promise<void> {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    const redis = await getRedisClient()

    // Use pipeline for atomic operations
    const pipeline = redis.pipeline()

    // Set user-specific tasks cache
    const cacheKey = REDIS_KEYS.USER_TASKS(userId)
    pipeline.set(cacheKey, serialize(tasks), "EX", CACHE_TTL)

    // Update the main data store
    const data = await readData()
    data.tasks = data.tasks.filter((task) => task.userId !== userId).concat(tasks)
    pipeline.set(REDIS_KEYS.DATA_STORE, serialize(data))
    pipeline.set(REDIS_KEYS.ALL_TASKS, serialize(data.tasks))
    pipeline.set(REDIS_KEYS.TASK_COUNT, data.tasks.length.toString())

    const results = await pipeline.exec()
    console.log(`[Redis Cloud] Updated ${tasks.length} tasks for user ${userId}, operations:`, results?.length)
  } catch (error) {
    console.error("[Redis Cloud] Error setting user tasks:", error)
    throw new Error("Failed to save tasks")
  }
}

/**
 * Add a new user
 */
export async function addUser(user: User): Promise<void> {
  try {
    const users = await getUsers()
    users.push(user)
    await setUsers(users)
    console.log(`[Redis Cloud] Added new user: ${user.username}`)
  } catch (error) {
    console.error("[Redis Cloud] Error adding user:", error)
    throw new Error("Failed to add user")
  }
}

/**
 * Find user by username (case-insensitive)
 */
export async function findUser(username: string): Promise<User | undefined> {
  try {
    if (!username) {
      return undefined
    }

    const users = await getUsers()
    const foundUser = users.find((user) => user.username.toLowerCase() === username.toLowerCase().trim())

    if (foundUser) {
      console.log(`[Redis Cloud] Found user: ${foundUser.username}`)
    }

    return foundUser
  } catch (error) {
    console.error("[Redis Cloud] Error finding user:", error)
    return undefined
  }
}

/**
 * Find user by credentials
 */
export async function findUserByCredentials(username: string, passwordHash: string): Promise<User | undefined> {
  try {
    if (!username || !passwordHash) {
      return undefined
    }

    const users = await getUsers()
    const foundUser = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase().trim() && user.passwordHash === passwordHash,
    )

    if (foundUser) {
      console.log(`[Redis Cloud] Authenticated user: ${foundUser.username}`)
    }

    return foundUser
  } catch (error) {
    console.error("[Redis Cloud] Error finding user by credentials:", error)
    return undefined
  }
}

/**
 * Health check for Redis Cloud connection
 */
export async function healthCheck(): Promise<{
  status: string
  timestamp: string
  redis: boolean
  location: string
  userCount: number
  taskCount: number
}> {
  try {
    const redisHealthy = await testRedisConnection()
    const redis = await getRedisClient()

    let userCount = 0
    let taskCount = 0

    if (redisHealthy) {
      await redis.set(REDIS_KEYS.HEALTH, new Date().toISOString(), "EX", CACHE_TTL)

      // Get counts from Redis
      const [userCountStr, taskCountStr] = await Promise.all([
        redis.get(REDIS_KEYS.USER_COUNT),
        redis.get(REDIS_KEYS.TASK_COUNT),
      ])

      userCount = Number.parseInt(userCountStr || "0")
      taskCount = Number.parseInt(taskCountStr || "0")
    }

    return {
      status: redisHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      redis: redisHealthy,
      location: "ap-southeast-1 (Singapore)",
      userCount,
      taskCount,
    }
  } catch (error) {
    console.error("[Redis Cloud] Health check failed:", error)
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      redis: false,
      location: "ap-southeast-1 (Singapore)",
      userCount: 0,
      taskCount: 0,
    }
  }
}

/**
 * Get Redis Cloud statistics
 */
export async function getRedisStats(): Promise<{
  totalKeys: number
  memoryUsage: string
  connectedClients: number
}> {
  try {
    const redis = await getRedisClient()

    const [dbSize, info] = await Promise.all([redis.dbsize(), redis.info("memory")])

    // Parse memory info
    const memoryMatch = info.match(/used_memory_human:(.+)/)
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : "unknown"

    return {
      totalKeys: dbSize,
      memoryUsage,
      connectedClients: 1, // Current connection
    }
  } catch (error) {
    console.error("[Redis Cloud] Error getting stats:", error)
    return {
      totalKeys: 0,
      memoryUsage: "unknown",
      connectedClients: 0,
    }
  }
}
