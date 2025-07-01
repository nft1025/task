export interface User {
  id: string
  username: string
  passwordHash: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  deadline?: string
  completed: boolean
  createdAt: string
}

export interface Session {
  id: string
  username: string
}
