import Redis from "ioredis"

let client: Redis | null = null

export async function getRedisClient(): Promise<Redis> {
  if (!client) {
    const redisUrl =
      process.env.REDIS_URL ||
      "redis://default:MjaXah64Sqz2AFqEDC2as3VcESaFqPoB@redis-19027.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com:19027"

    // Parse the Redis URL
    const url = new URL(redisUrl)

    client = new Redis({
      host: url.hostname,
      port: Number.parseInt(url.port),
      username: url.username || "default",
      password: url.password,

      // Connection settings
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      family: 4,
      keepAlive: true,

      // IMPORTANT: Disable TLS for Redis Cloud port 19027
      // Redis Cloud uses different ports for TLS vs non-TLS
      tls: undefined, // This disables TLS

      // Reconnection settings
      reconnectOnError: (err) => {
        const targetError = "READONLY"
        return err.message.includes(targetError)
      },
    })

    client.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message)
    })

    client.on("connect", () => {
      console.log("[Redis] Connected successfully to Redis Cloud")
    })

    client.on("ready", () => {
      console.log("[Redis] Ready to accept commands")
    })

    client.on("end", () => {
      console.log("[Redis] Connection ended")
    })

    client.on("reconnecting", (delay) => {
      console.log(`[Redis] Reconnecting in ${delay}ms...`)
    })
  }

  if (client.status !== "ready" && client.status !== "connecting") {
    try {
      await client.connect()
      console.log("[Redis] Connection established")
    } catch (error) {
      console.error("[Redis] Failed to connect:", error)
      throw new Error(`Failed to connect to Redis: ${error}`)
    }
  }

  return client
}

export async function closeRedisConnection(): Promise<void> {
  if (client) {
    try {
      if (client.status === "ready") {
        await client.quit()
        console.log("[Redis] Connection closed gracefully")
      } else {
        client.disconnect()
        console.log("[Redis] Connection disconnected")
      }
    } catch (error) {
      console.error("[Redis] Error closing connection:", error)
    } finally {
      client = null
    }
  }
}

export function serialize(data: unknown): string {
  return JSON.stringify(data)
}

export function deserialize<T>(data: string | null): T | null {
  if (!data) return null
  try {
    return JSON.parse(data) as T
  } catch (error) {
    console.error("[Redis] Deserialization error:", error)
    return null
  }
}
