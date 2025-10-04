"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { useProjects } from "./ProjectsContext"

export interface Notification {
  id: string
  userId: string
  type:
    | "application_received"
    | "application_accepted"
    | "application_rejected"
    | "project_match"
    | "volunteer_joined"
    | "event_reminder"
  title: string
  message: string
  projectId?: string
  projectTitle?: string
  read: boolean
  createdAt: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { projects } = useProjects()
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Generate notifications based on project activities
  useEffect(() => {
    if (!user) return

    const newNotifications: Notification[] = []

    // Check for new applications on user's projects
    projects.forEach((project) => {
      if (project.creatorId === user.id) {
        project.applications.forEach((app) => {
          const existingNotif = notifications.find(
            (n) => n.type === "application_received" && n.message.includes(app.volunteerName),
          )
          if (!existingNotif && app.status === "Pending") {
            newNotifications.push({
              id: `notif-${Date.now()}-${Math.random()}`,
              userId: user.id,
              type: "application_received",
              title: "New Application Received",
              message: `${app.volunteerName} applied to your project "${project.title}"`,
              projectId: project.id,
              projectTitle: project.title,
              read: false,
              createdAt: app.appliedAt,
            })
          }
        })

        // Check for new volunteers
        project.volunteers.forEach((volunteer) => {
          const existingNotif = notifications.find(
            (n) => n.type === "volunteer_joined" && n.message.includes(volunteer.name),
          )
          if (!existingNotif) {
            newNotifications.push({
              id: `notif-${Date.now()}-${Math.random()}`,
              userId: user.id,
              type: "volunteer_joined",
              title: "New Volunteer Joined",
              message: `${volunteer.name} has joined your project "${project.title}"`,
              projectId: project.id,
              projectTitle: project.title,
              read: false,
              createdAt: volunteer.joinedAt,
            })
          }
        })
      }
    })

    // Check for application status updates for user's applications
    projects.forEach((project) => {
      project.applications.forEach((app) => {
        if (app.volunteerId === user.id) {
          if (app.status === "Accepted") {
            const existingNotif = notifications.find(
              (n) => n.type === "application_accepted" && n.projectId === project.id,
            )
            if (!existingNotif) {
              newNotifications.push({
                id: `notif-${Date.now()}-${Math.random()}`,
                userId: user.id,
                type: "application_accepted",
                title: "Application Accepted!",
                message: `Your application to "${project.title}" has been accepted`,
                projectId: project.id,
                projectTitle: project.title,
                read: false,
                createdAt: app.appliedAt,
              })
            }
          } else if (app.status === "Rejected") {
            const existingNotif = notifications.find(
              (n) => n.type === "application_rejected" && n.projectId === project.id,
            )
            if (!existingNotif) {
              newNotifications.push({
                id: `notif-${Date.now()}-${Math.random()}`,
                userId: user.id,
                type: "application_rejected",
                title: "Application Update",
                message: `Your application to "${project.title}" was not accepted this time`,
                projectId: project.id,
                projectTitle: project.title,
                read: false,
                createdAt: app.appliedAt,
              })
            }
          }
        }
      })
    })

    // Check for upcoming events (within 24 hours)
    const newEventNotifications: Notification[] = []
    projects.forEach((project) => {
      // Check if user is a volunteer or creator of this project
      const isVolunteer = project.volunteers.some((v) => v.email === user.email)
      const isCreator = project.creatorId === user.id

      if (isVolunteer || isCreator) {
        project.events.forEach((event) => {
          const eventDate = new Date(event.date)
          const now = new Date()
          const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)

          // Notify if event is within 24 hours and hasn't passed
          if (hoursUntilEvent > 0 && hoursUntilEvent <= 24) {
            const existingNotif = notifications.find(
              (n) => n.type === "event_reminder" && n.message.includes(event.name),
            )
            if (!existingNotif) {
              newEventNotifications.push({
                id: `notif-${Date.now()}-${Math.random()}`,
                userId: user.id,
                type: "event_reminder",
                title: "Upcoming Event Reminder",
                message: `"${event.name}" for project "${project.title}" starts in ${Math.round(hoursUntilEvent)} hours`,
                projectId: project.id,
                projectTitle: project.title,
                read: false,
                createdAt: new Date().toISOString(),
              })
            }
          }
        })
      }
    })

    if (newEventNotifications.length > 0) {
      setNotifications((prev) => [...newEventNotifications, ...prev])
    }
  }, [projects, user, notifications])

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const userNotifications = notifications.filter((n) => n.userId === user?.id)
  const unreadCount = userNotifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
