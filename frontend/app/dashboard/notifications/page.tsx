"use client"

import { motion } from "@/lib/motion"
import { Bell, Check, CheckCheck, Trash2, Calendar, Users, FileText, AlertCircle } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationsContext"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
  const router = useRouter()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application_received":
        return <FileText className="w-6 h-6 text-[#ec4899]" />
      case "application_accepted":
        return <Check className="w-6 h-6 text-green-500" />
      case "application_rejected":
        return <AlertCircle className="w-6 h-6 text-orange-500" />
      case "volunteer_joined":
        return <Users className="w-6 h-6 text-[#a855f7]" />
      case "event_reminder":
        return <Calendar className="w-6 h-6 text-blue-500" />
      case "project_match":
        return <Bell className="w-6 h-6 text-[#ec4899]" />
      default:
        return <Bell className="w-6 h-6 text-[#9ca3af]" />
    }
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.projectId) {
      router.push(`/dashboard/projects`)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ec4899] to-[#a855f7] bg-clip-text text-transparent">
              Notifications
            </h1>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-gradient-to-r from-[#ec4899] to-[#a855f7] text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </motion.button>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-[#6b7280]">
              You have <span className="font-semibold text-[#ec4899]">{unreadCount}</span> unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Bell className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1f2937] mb-2">No notifications yet</h3>
            <p className="text-[#6b7280]">We'll notify you when something important happens</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all ${
                  !notification.read ? "border-l-4 border-[#ec4899]" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-[#1f2937] text-lg">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-2 bg-[#ec4899] text-white rounded-lg hover:bg-[#db2777] transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-[#6b7280] mb-3">{notification.message}</p>
                    {notification.projectTitle && (
                      <div className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-[#ec4899] rounded-full text-sm font-medium mb-2">
                        {notification.projectTitle}
                      </div>
                    )}
                    <p className="text-sm text-[#9ca3af]">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
