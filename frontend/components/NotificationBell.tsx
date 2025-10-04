"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationsContext"
import { useRouter } from "next/navigation"

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application_received":
        return "📩"
      case "application_accepted":
        return "✅"
      case "application_rejected":
        return "📋"
      case "volunteer_joined":
        return "👥"
      case "project_match":
        return "🎯"
      default:
        return "🔔"
    }
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.projectId) {
      setIsOpen(false)
      router.push(`/projects/${notification.projectId}`)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#fce7f3] rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-[#1f2937]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ec4899] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-[#f3e8ff] z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#f3e8ff] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1f2937]">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-[#6b7280]">{unreadCount} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="p-2 hover:bg-[#fce7f3] rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 text-[#ec4899]" />
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </>
              )}
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                <p className="text-[#6b7280]">No notifications yet</p>
                <p className="text-sm text-[#9ca3af] mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f3e8ff]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-[#fdf2f8] transition-colors cursor-pointer ${
                      !notification.read ? "bg-[#fce7f3]/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-[#1f2937] text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="p-1 hover:bg-[#ec4899] hover:text-white rounded transition-colors flex-shrink-0"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[#6b7280] mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#9ca3af]">
                            {new Date(notification.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#f3e8ff] text-center">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push("/dashboard")
                }}
                className="text-sm text-[#ec4899] hover:text-[#db2777] font-medium"
              >
                View All Activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
