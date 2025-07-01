import { getSession } from "@/lib/auth"
import TaskDashboard from "@/components/task-dashboard"
import LoginForm from "@/components/login-form"
import { AnimatedBackground } from "@/components/animated-background"

export default async function Home() {
  const session = await getSession()

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-md md:max-w-3xl">
          {session ? (
            <TaskDashboard userId={session.id} />
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-text-shimmer">
                  Task Manager
                </h1>
                <p className="text-muted-foreground">Organize your life, one task at a time</p>
              </div>
              <LoginForm />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
