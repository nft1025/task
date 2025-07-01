import Redis from "ioredis"

let client: Redis | null = null

/**
 * Get Redis client configured for Redis Cloud
 * Your Redis URL: redis://default:MjaXah64Sqz2AFqEDC2as3VcESaFqPoB@redis-19027.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com:19027
 */
export async function getRedisClient(): Promise<Redis> {
  if (!client) {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required")
    }

    // Parse Redis Cloud URL
    const url = new URL(redisUrl)

    client = new Redis({
      host: url.hostname, // redis-19027.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com
      port: Number.parseInt(url.port), // 19027
      username: url.username || "default", // default
      password: url.password, // MjaXah64Sqz2AFqEDC2as3VcESaFqPoB

      // Redis Cloud specific optimizations
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,

      // Connection pool settings optimized for serverless
      family: 4,
      keepAlive: true,

      // Redis Cloud uses TLS by default on port 19027
      tls: {
        // Redis Cloud certificates are valid, so we don't need to disable verification
        rejectUnauthorized: true,
      },

      // Reconnection settings
      reconnectOnError: (err) => {
        const targetError = "READONLY"
        return err.message.includes(targetError)
      },
    })

    client.on("error", (err) => {
      console.error("[Redis Cloud] Connection error:", err.message)
    })

    client.on("connect", () => {
      console.log("[Redis Cloud] Connected successfully to ap-southeast-1")
    })

    client.on("ready", () => {
      console.log("[Redis Cloud] Ready to accept commands")
    })

    client.on("end", () => {
      console.log("[Redis Cloud] Connection ended")
    })

    client.on("reconnecting", (delay) => {
      console.log(`[Redis Cloud] Reconnecting in ${delay}ms...`)
    })

    client.on("close", () => {
      console.log("[Redis Cloud] Connection closed")
    })
  }

  // Ensure connection is established
  if (client.status !== "ready" && client.status !== "connecting") {
    try {
      await client.connect()
      console.log("[Redis Cloud] Connection established")
    } catch (error) {
      console.error("[Redis Cloud] Failed to connect:", error)
      throw new Error(`Failed to connect to Redis Cloud: ${error}`)
    }
  }

  return client
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisConnection(): Promise<void> {
  if (client) {
    try {
      if (client.status === "ready") {
        await client.quit()
        console.log("[Redis Cloud] Connection closed gracefully")
      } else {
        client.disconnect()
        console.log("[Redis Cloud] Connection disconnected")
      }
    } catch (error) {
      console.error("[Redis Cloud] Error closing connection:", error)
    } finally {
      client = null
    }
  }
}

/**
 * Test Redis Cloud connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = await getRedisClient()
    const result = await redis.ping()
    console.log("[Redis Cloud] Ping result:", result)
    return result === "PONG"
  } catch (error) {
    console.error("[Redis Cloud] Connection test failed:", error)
    return false
  }
}

/**
 * Get Redis Cloud connection info
 */
export async function getRedisInfo(): Promise<{ host: string; port: number; status: string }> {
  try {
    const redis = await getRedisClient()
    return {
      host: "redis-19027.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com",
      port: 19027,
      status: redis.status,
    }
  } catch (error) {
    console.error("[Redis Cloud] Error getting info:", error)
    return {
      host: "unknown",
      port: 0,
      status: "error",
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Serialization helpers                                                     */
/* -------------------------------------------------------------------------- */

export function serialize(data: unknown): string {
  return JSON.stringify(data)
}

export function deserialize<T>(data: string | null): T | null {
  if (!data) return null
  try {
    return JSON.parse(data) as T
  } catch (error) {
    console.error("[Redis Cloud] Deserialization error:", error)
    return null
  }
}
