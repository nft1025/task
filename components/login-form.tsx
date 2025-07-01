"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, register } from "@/lib/auth"
import { UserRound, KeyRound, LogIn, UserPlus } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      // Add a small delay to ensure the session is set
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (err) {
      console.error("Login error:", err)
      setError("Invalid username or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      await register(username, password)
      // Add a small delay to ensure the session is set
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (err) {
      console.error("Registration error:", err)
      setError("Username already exists or registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass-effect animate-fade-in shadow-lg">
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className="pb-0">
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <TabsContent value="login" className="animate-fade-in">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full button-shine transition-all" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin-slow mr-2">⏳</span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="animate-fade-in">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full button-shine transition-all" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin-slow mr-2">⏳</span>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
