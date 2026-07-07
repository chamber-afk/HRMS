import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../constants/api'
import { useAuth } from './AuthContext'
import { storage } from '../utils/storage'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // If there's no logged in user, make sure any existing socket is closed
    // and don't try to connect
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
      }
      return
    }

    // User is logged in — establish the socket connection
    const connectSocket = async () => {
      const token = await storage.getAccessToken()

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message)
      })

      socketRef.current = newSocket
    }

    connectSocket()

    // Cleanup — runs when user changes (e.g. logs out) or component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user]) // re-runs whenever `user` changes — login or logout

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)