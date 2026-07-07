import React, { createContext, useState, useContext, useEffect } from 'react'
import { storage } from '../utils/storage'
import { authApi } from '../api/authApi'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await storage.getUser()
        const storedToken = await storage.getAccessToken()

        if (storedUser && storedToken) {
          setUser(storedUser) 
        }
      } catch (error) {
        console.log('Error restoring session:', error)
      } finally {
        setLoading(false)   
      }
    }

    restoreSession()
  }, [])

  const login = async (email, password) => {
    const response = await authApi.login(email, password)
    const { user, accessToken, refreshToken } = response.data

    await storage.setTokens(accessToken, refreshToken)
    await storage.setUser(user)
    
    setUser(user) 

    return user
  }

  const logout = async () => {
    await storage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)