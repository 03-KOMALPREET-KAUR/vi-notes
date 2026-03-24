import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  _id: string
  username: string
  email: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  // 🔥 Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('vi_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)

    // ✅ Store BOTH user and token
    localStorage.setItem('vi_user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token)
  }

  const logout = () => {
    setUser(null)

    // ✅ Clear everything
    localStorage.removeItem('vi_user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)