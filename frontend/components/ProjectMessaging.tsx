"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "@/lib/motion"
import { Send, MessageCircle, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Message {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
}

interface ProjectMessagingProps {
  projectId: string
  projectTitle: string
}

export default function ProjectMessaging({ projectId, projectTitle }: ProjectMessagingProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "creator",
      senderName: "Project Leader",
      message: "Welcome to the project! Feel free to ask any questions.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      message: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <>
      {/* Floating Message Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#ec4899] to-[#a855f7] text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Message Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#ec4899] to-[#a855f7] text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold">Project Messages</h3>
                <p className="text-sm opacity-90">{projectTitle}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.senderId === user?.id
                        ? "bg-gradient-to-r from-[#ec4899] to-[#a855f7] text-white"
                        : "bg-gray-100 text-[#1f2937]"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-80">{msg.senderName}</p>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ec4899] focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="p-3 bg-gradient-to-r from-[#ec4899] to-[#a855f7] text-white rounded-xl hover:shadow-lg transition-shadow"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
