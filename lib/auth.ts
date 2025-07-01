"use server"

import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { addUser, findUser, findUserByCredentials } from "./data"
import type { User, Session } from "./types"
import { redirect } from "next/navigation"

// Simple password hashing function (in a real app, use bcrypt)
function hashPassword(password: string): string {
  return Buffer.from(password + "task_manager_salt_2024").toString("base64")
}

export async function register(username: string, password: string): Promise<void> {
  try {
    // Validate input
    if (!username || username.length < 3) {
      throw new Error("Username must be at least 3 characters long")
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }

    // Check if username already exists
    const existingUser = await findUser(username.toLowerCase().trim())
    if (existingUser) {
      throw new Error("Username already exists")
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username: username.toLowerCase().trim(),
      passwordHash: hashPassword(password),
    }

    await addUser(newUser)

    // Log the user in
    await createSession(newUser)
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export async function login(username: string, password: string): Promise<void> {
  try {
    // Validate input
    if (!username || !password) {
      throw new Error("Username and password are required")
    }

    // Find user
    const user = await findUserByCredentials(username.toLowerCase().trim(), hashPassword(password))

    if (!user) {
      throw new Error("Invalid username or password")
    }

    // Create session
    await createSession(user)
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    cookies().delete("session")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie || !sessionCookie.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as Session

    // Validate session structure
    if (!session.id || !session.username) {
      return null
    }

    return session
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

async function createSession(user: User): Promise<void> {
  try {
    const session: Session = {
      id: user.id,
      username: user.username,
    }

    cookies().set({
      name: "session",
      value: JSON.stringify(session),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return session
}
