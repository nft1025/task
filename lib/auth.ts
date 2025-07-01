"use server"

import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "./data"
import type { User, Session } from "./types"
import { redirect } from "next/navigation"

// Simple password hashing function (in a real app, use bcrypt)
function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64")
}

export async function register(username: string, password: string): Promise<void> {
  const data = await readData()

  // Check if username already exists
  if (data.users.some((user) => user.username === username)) {
    throw new Error("Username already exists")
  }

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    username,
    passwordHash: hashPassword(password),
  }

  data.users.push(newUser)
  await writeData(data)

  // Log the user in
  await createSession(newUser)
}

export async function login(username: string, password: string): Promise<void> {
  const data = await readData()

  // Find user
  const user = data.users.find((user) => user.username === username && user.passwordHash === hashPassword(password))

  if (!user) {
    throw new Error("Invalid username or password")
  }

  // Create session
  await createSession(user)
}

export async function logout(): Promise<void> {
  cookies().delete("session")
}

export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as Session
  } catch {
    return null
  }
}

async function createSession(user: User): Promise<void> {
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
  })
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return session
}
