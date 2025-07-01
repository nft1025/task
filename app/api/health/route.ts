import { NextResponse } from "next/server"
import { healthCheck, getRedisStats } from "@/lib/data"
import { getRedisInfo } from "@/lib/redis"

export async function GET() {
  try {
    const [health, stats, redisInfo] = await Promise.all([healthCheck(), getRedisStats(), getRedisInfo()])

    const response = {
      ...health,
      redis_cloud: {
        host: redisInfo.host,
        port: redisInfo.port,
        status: redisInfo.status,
        region: "ap-southeast-1",
        provider: "Redis Cloud",
      },
      statistics: stats,
    }

    return NextResponse.json(response, {
      status: health.redis ? 200 : 503,
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        redis: false,
        error: "Health check failed",
        redis_cloud: {
          host: "redis-19027.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com",
          port: 19027,
          status: "error",
          region: "ap-southeast-1",
          provider: "Redis Cloud",
        },
      },
      { status: 503 },
    )
  }
}
