"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Project {
  id: string
  title: string
  shortDescription: string
  detailedDescription: string
  category: string
  skillsNeeded: string[]
  projectType: "Online" | "Onsite" | "Hybrid"
  location?: string
  startDate: string
  endDate: string
  imageUrl: string
  creatorId: string
  creatorName: string
  creatorEmail: string
  creatorPhone: string
  events: Event[]
  volunteers: Volunteer[]
  applications: Application[]
}

export interface Event {
  id: string
  name: string
  date: string
  time: string
  description: string
  slotsAvailable: number
}

export interface Volunteer {
  id: string
  name: string
  email: string
  skills: string[]
  status: "Active" | "Inactive"
}

export interface Application {
  id: string
  projectId: string
  volunteerId: string
  volunteerName: string
  volunteerEmail: string
  volunteerPhone?: string
  skills: string[]
  message: string
  status: "Pending" | "Accepted" | "Rejected"
  appliedAt: string
}

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "volunteers" | "applications">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  applyToProject: (projectId: string, application: Omit<Application, "id" | "appliedAt">) => void
  updateApplicationStatus: (
    projectId: string,
    applicationId: string,
    status: "Accepted" | "Rejected",
    application?: Application,
  ) => Promise<void>
  getUserProjects: (userId: string) => Project[]
  getUserApplications: (userId: string) => Application[]
  fetchProjectApplications: (projectId: string) => Promise<Application[]>
  fetchProjectVolunteers: (projectId: string) => Promise<Volunteer[]>
  uploadProjectImage: (file: File) => Promise<{ storedUrl: string; previewUrl: string } | null>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

// Sample projects for demonstration
const sampleProjects: Project[] = [
  {
    id: "1",
    title: "Women in Tech Mentorship Program",
    shortDescription: "Connect aspiring women technologists with experienced mentors in the industry",
    detailedDescription:
      "Our mentorship program pairs women entering the tech industry with experienced professionals who can guide them through career challenges, technical skills development, and professional growth. Mentors commit to monthly meetings and ongoing support.",
    category: "Technology",
    skillsNeeded: ["Mentoring", "Technology", "Communication"],
    projectType: "Online",
    startDate: "2025-02-01",
    endDate: "2025-08-01",
    imageUrl: "/women-tech-mentorship.jpg",
    creatorId: "demo",
    creatorName: "Sarah Johnson",
    creatorEmail: "sarah@womenrisehub.org",
    creatorPhone: "+1234567890",
    events: [
      {
        id: "e1",
        name: "Kickoff Meeting",
        date: "2025-02-01",
        time: "10:00 AM",
        description: "Introduction session for all mentors and mentees",
        slotsAvailable: 50,
      },
      {
        id: "e2",
        name: "Mid-Program Check-in",
        date: "2025-05-01",
        time: "2:00 PM",
        description: "Group discussion and progress sharing",
        slotsAvailable: 50,
      },
    ],
    volunteers: [],
    applications: [],
  },
  {
    id: "2",
    title: "Community Health & Wellness Fair",
    shortDescription: "Organize a health fair providing free screenings and wellness education",
    detailedDescription:
      "A day-long community event offering free health screenings, wellness workshops, and educational resources. We need volunteers to help with registration, guide attendees, assist healthcare providers, and manage information booths.",
    category: "Welfare",
    skillsNeeded: ["Event Management", "Healthcare", "Communication", "Organization"],
    projectType: "Onsite",
    location: "Mumbai Community Center, India",
    startDate: "2025-03-15",
    endDate: "2025-03-15",
    imageUrl: "/health-wellness-fair.jpg",
    creatorId: "demo2",
    creatorName: "Priya Sharma",
    creatorEmail: "priya@womenrisehub.org",
    creatorPhone: "+919876543210",
    events: [
      {
        id: "e3",
        name: "Health Fair Day",
        date: "2025-03-15",
        time: "9:00 AM - 5:00 PM",
        description: "Main event day with all activities",
        slotsAvailable: 30,
      },
    ],
    volunteers: [],
    applications: [],
  },
  {
    id: "3",
    title: "Girls Coding Workshop Series",
    shortDescription: "Teach coding fundamentals to girls aged 10-16 through interactive workshops",
    detailedDescription:
      "A 6-week workshop series introducing young girls to programming through fun, project-based learning. We use Scratch, Python, and web development basics to build confidence and skills in technology.",
    category: "Education",
    skillsNeeded: ["Teaching", "Programming", "Patience", "Curriculum Development"],
    projectType: "Hybrid",
    location: "Delhi & Online",
    startDate: "2025-02-10",
    endDate: "2025-03-25",
    imageUrl: "/girls-coding-workshop.jpg",
    creatorId: "demo3",
    creatorName: "Anita Desai",
    creatorEmail: "anita@womenrisehub.org",
    creatorPhone: "+919123456789",
    events: [
      {
        id: "e4",
        name: "Workshop Week 1: Introduction to Scratch",
        date: "2025-02-10",
        time: "4:00 PM",
        description: "Learn basic programming concepts with Scratch",
        slotsAvailable: 20,
      },
      {
        id: "e5",
        name: "Workshop Week 3: Python Basics",
        date: "2025-02-24",
        time: "4:00 PM",
        description: "Introduction to Python programming",
        slotsAvailable: 20,
      },
    ],
    volunteers: [],
    applications: [],
  },
]

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  // Optional backend integration
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
  const TOKEN_STORAGE_KEY = "womenrisehub_token"
  const TOKEN_TYPE_STORAGE_KEY = "womenrisehub_token_type"
  const apiBase = API_URL.replace(/\/$/, "")

  const resolveImageUrl = (raw?: string | null): string | null => {
    if (!raw) return null
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
      return raw
    }
    if (!API_URL) {
      return raw
    }
    return `${apiBase}${raw.startsWith("/") ? "" : "/"}${raw}`
  }

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("Unsupported file result type"))
        }
      }
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"))
      reader.readAsDataURL(file)
    })

  const uploadProjectImage = async (file: File): Promise<{ storedUrl: string; previewUrl: string } | null> => {
    if (!file) return null

    if (API_URL) {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY)
        const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
        const formData = new FormData()
        formData.append("file", file)

        const requestInit: RequestInit = {
          method: "POST",
          body: formData,
        }

        if (token) {
          requestInit.headers = {
            Authorization: `${tokenType} ${token}`,
          }
        }

        const response = await fetch(`${apiBase}/projects/upload-image`, requestInit)
        if (response.ok) {
          const payload = await response.json()
          const rawStoredUrl = (payload?.image_url ?? payload?.imageUrl)?.toString().trim()
          if (rawStoredUrl) {
            const previewUrl = resolveImageUrl(rawStoredUrl) ?? rawStoredUrl
            return { storedUrl: rawStoredUrl, previewUrl }
          }
        } else {
          console.error("Failed to upload image", response.status, await response.text().catch(() => ""))
        }
      } catch (error) {
        console.error("Image upload error", error)
        return null
      }
      return null
    }

    try {
      const dataUrl = await readFileAsDataURL(file)
      return { storedUrl: dataUrl, previewUrl: dataUrl }
    } catch (error) {
      console.error("Image conversion error", error)
      return null
    }
  }

  useEffect(() => {
    // If backend is configured, fetch from API first, else fallback to local storage
    if (API_URL) {
      ;(async () => {
        try {
          const token = localStorage.getItem(TOKEN_STORAGE_KEY)
          const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
          const headers: Record<string, string> = { "Content-Type": "application/json" }
          if (token) headers["Authorization"] = `${tokenType} ${token}`

          const res = await fetch(`${API_URL.replace(/\/$/, "")}/projects`, { headers })
          if (res.ok) {
            const apiProjects = await res.json()
            const mapped: Project[] = Array.isArray(apiProjects)
              ? apiProjects.map((p: any) => mapApiProjectToProject(p))
              : []
            setProjects(mapped)
            // Also mirror to local storage so UI remains stable offline
            localStorage.setItem("womenrisehub_projects", JSON.stringify(mapped))
            return
          }
        } catch (_) {
          // ignore and fallback
        }
        const stored = localStorage.getItem("womenrisehub_projects")
        if (stored) {
          setProjects(JSON.parse(stored))
        } else {
          setProjects(sampleProjects)
          localStorage.setItem("womenrisehub_projects", JSON.stringify(sampleProjects))
        }
      })()
      return
    }

    const stored = localStorage.getItem("womenrisehub_projects")
    if (stored) {
      setProjects(JSON.parse(stored))
    } else {
      setProjects(sampleProjects)
      localStorage.setItem("womenrisehub_projects", JSON.stringify(sampleProjects))
    }
  }, [])

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects)
    localStorage.setItem("womenrisehub_projects", JSON.stringify(updatedProjects))
  }

  const mapApiProjectToProject = (api: any): Project => {
    const events: Event[] = Array.isArray(api.events)
      ? api.events.map((e: any) => ({
          id: e.id,
          name: e.name,
          date: typeof e.date === "string" ? e.date : new Date(e.date).toISOString().slice(0, 10),
          time: e.time,
          description: e.description ?? "",
          slotsAvailable: typeof e.slots_available === "number" ? e.slots_available : e.slotsAvailable ?? 0,
        }))
      : []

    const owner = api.owner ?? {}

    const project: Project = {
      id: api.id,
      title: api.title,
      shortDescription: api.short_description ?? api.shortDescription,
      detailedDescription: api.detailed_description ?? api.detailedDescription,
      category: api.category,
      skillsNeeded: api.skills_needed ?? api.skillsNeeded ?? [],
      projectType: api.project_type ?? api.projectType,
      location: api.location ?? undefined,
      startDate: typeof api.start_date === "string" ? api.start_date : api.startDate,
      endDate: typeof api.end_date === "string" ? api.end_date : api.endDate,
      imageUrl: resolveImageUrl(api.image_url ?? api.imageUrl) ?? "/volunteer-project.jpg",
      creatorId: owner.id ?? api.owner_id ?? api.creatorId ?? "",
      creatorName: owner.name ?? api.creatorName ?? "",
      creatorEmail: owner.email ?? api.creatorEmail ?? "",
      creatorPhone: owner.phonenumber ?? owner.phone ?? api.creatorPhone ?? "",
      events,
      volunteers: [],
      applications: [],
    }
    return project
  }

  const addProject = (project: Omit<Project, "id" | "volunteers" | "applications">) => {
    // If backend URL configured, attempt to create on server first
    if (API_URL) {
      ;(async () => {
        try {
          const token = localStorage.getItem(TOKEN_STORAGE_KEY)
          const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
          if (!token) throw new Error("Missing auth token")

          // Map camelCase to snake_case payload expected by backend
          const payload = {
            title: project.title,
            short_description: project.shortDescription,
            detailed_description: project.detailedDescription,
            category: project.category,
            project_type: project.projectType,
            location: project.location || null,
            image_url: project.imageUrl || null,
            skills_needed: project.skillsNeeded || [],
            start_date: project.startDate,
            end_date: project.endDate,
            events: (project.events || []).map((e) => ({
              name: e.name,
              description: e.description || "",
              date: e.date,
              time: e.time,
              slots_available: e.slotsAvailable ?? 0,
            })),
          }

          const res = await fetch(`${API_URL.replace(/\/$/, "")}/create/project`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${tokenType} ${token}`,
            },
            body: JSON.stringify(payload),
          })

          if (res.ok) {
            const apiProject = await res.json()
            const mapped = mapApiProjectToProject(apiProject)
            saveProjects([...projects, mapped])
            return
          }
          // fall through to local save on non-OK
        } catch (_) {
          // swallow and fallback
        }
        // Fallback to local-only save if API call fails
        const localProject: Project = {
          ...project,
          id: Date.now().toString(),
          imageUrl: resolveImageUrl(project.imageUrl) ?? project.imageUrl ?? "/volunteer-project.jpg",
          volunteers: [],
          applications: [],
        }
        saveProjects([...projects, localProject])
      })()
      return
    }

    // Local-only persistence
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      imageUrl: resolveImageUrl(project.imageUrl) ?? project.imageUrl ?? "/volunteer-project.jpg",
      volunteers: [],
      applications: [],
    }
    saveProjects([...projects, newProject])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    saveProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProject = (id: string) => {
    saveProjects(projects.filter((p) => p.id !== id))
  }

  const applyToProject = (projectId: string, application: Omit<Application, "id" | "appliedAt">) => {
    // If backend URL configured, attempt to submit application to server first
    if (API_URL) {
      ;(async () => {
        try {
          const token = localStorage.getItem(TOKEN_STORAGE_KEY)
          const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
          if (!token) throw new Error("Missing auth token")

          const payload = {
            project_id: projectId,
            skills: application.skills ?? [],
            message: application.message ?? "",
          }

          const res = await fetch(`${API_URL.replace(/\/$/, "")}/projects/${projectId}/apply`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${tokenType} ${token}`,
            },
            body: JSON.stringify(payload),
          })

          if (res.ok) {
            const apiApp = await res.json()
            const newApplication: Application = {
              id: apiApp.id || Date.now().toString(),
              projectId,
              volunteerId: application.volunteerId,
              volunteerName: apiApp.volunteer_name ?? application.volunteerName,
              volunteerEmail: apiApp.volunteer_email ?? application.volunteerEmail,
              volunteerPhone: apiApp.volunteer_phone ?? application.volunteerPhone,
              skills: Array.isArray(apiApp.skills) ? apiApp.skills : application.skills,
              message: typeof apiApp.message === "string" ? apiApp.message : application.message,
              status: apiApp.status ?? application.status,
              appliedAt: apiApp.applied_at || new Date().toISOString(),
            }
            saveProjects(
              projects.map((p) =>
                p.id === projectId ? { ...p, applications: [...p.applications, newApplication] } : p,
              ),
            )
            return
          }
          // fall through to local save if non-OK
        } catch (_) {
          // ignore and fallback
        }
        // Fallback: local application record
        const fallbackApp: Application = {
          ...application,
          id: Date.now().toString(),
          appliedAt: new Date().toISOString(),
        }
        saveProjects(
          projects.map((p) => (p.id === projectId ? { ...p, applications: [...p.applications, fallbackApp] } : p)),
        )
      })()
      return
    }

    // Local-only persistence
    const newApplication: Application = {
      ...application,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString(),
    }
    saveProjects(
      projects.map((p) => (p.id === projectId ? { ...p, applications: [...p.applications, newApplication] } : p)),
    )
  }

  const updateApplicationStatus = async (
    projectId: string,
    applicationId: string,
    status: "Accepted" | "Rejected",
    applicationParam?: Application,
  ) => {
    // Helper to update local state consistently
    const applyLocalUpdate = () => {
      saveProjects(
        projects.map((p) => {
          if (p.id === projectId) {
            const updatedApplications = p.applications.map((app) =>
              app.id === applicationId ? { ...app, status } : app,
            )

            if (status === "Accepted") {
              const acceptedApp = p.applications.find((app) => app.id === applicationId) || applicationParam
              if (acceptedApp) {
                const alreadyVolunteer = p.volunteers.some((v) => v.id === acceptedApp.volunteerId)
                const newVolunteer: Volunteer | null = alreadyVolunteer
                  ? null
                  : {
                      id: acceptedApp.volunteerId,
                      name: acceptedApp.volunteerName,
                      email: acceptedApp.volunteerEmail,
                      skills: acceptedApp.skills,
                      status: "Active",
                    }
                return {
                  ...p,
                  applications: updatedApplications,
                  volunteers: newVolunteer ? [...p.volunteers, newVolunteer] : p.volunteers,
                }
              }
            }
            return { ...p, applications: updatedApplications }
          }
          return p
        }),
      )
    }

    // If backend is configured, attempt to update on server first
    if (API_URL) {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY)
        const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (token) headers["Authorization"] = `${tokenType} ${token}`

        const base = API_URL.replace(/\/$/, "")
        const payload = { status }

        // Try a few common REST patterns
        const attempts = [
          { url: `${base}/projects/${projectId}/applications/${applicationId}/status`, method: "PATCH" as const },
          { url: `${base}/applications/${applicationId}/status`, method: "PATCH" as const },
          { url: `${base}/projects/${projectId}/applications/${applicationId}/status`, method: "POST" as const },
          { url: `${base}/applications/${applicationId}/status`, method: "POST" as const },
        ]

        let succeeded = false
        for (const { url, method } of attempts) {
          try {
            const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
            if (res.ok) {
              // Optionally read response; we'll still update locally to ensure UI consistency
              // const serverApp = await res.json().catch(() => null)
              succeeded = true
              break
            }
          } catch (_) {
            // try next pattern
          }
        }

        // Apply local state regardless; if server failed, the UI stays responsive and can be reconciled by a refetch
        applyLocalUpdate()
        return
      } catch (_) {
        // Fall back to local-only update on any error
        applyLocalUpdate()
        return
      }
    }

    // No backend configured: local-only update
    applyLocalUpdate()
  }

  const getUserProjects = (userId: string) => {
    return projects.filter((p) => p.creatorId === userId)
  }

  const getUserApplications = (userId: string) => {
    const allApplications: Application[] = []
    projects.forEach((project) => {
      project.applications.forEach((app) => {
        if (app.volunteerId === userId) {
          allApplications.push(app)
        }
      })
    })
    return allApplications
  }

  const mapApiApplicationToApplication = (api: any, projectId: string): Application => {
    const rawStatus = String(api.status ?? "Pending").toLowerCase()
    const status: Application["status"] = rawStatus.includes("accept")
      ? "Accepted"
      : rawStatus.includes("reject")
        ? "Rejected"
        : "Pending"
    return {
      id: api.id,
      projectId,
      volunteerId: api.volunteer_id ?? "",
      volunteerName: api.volunteer_name ?? "",
      volunteerEmail: api.volunteer_email ?? "",
      volunteerPhone: api.volunteer_phone ?? undefined,
      skills: Array.isArray(api.skills) ? api.skills : [],
      message: typeof api.message === "string" ? api.message : "",
      status,
      appliedAt: typeof api.applied_at === "string" ? api.applied_at : new Date().toISOString(),
    }
  }

  const fetchProjectApplications = async (projectId: string): Promise<Application[]> => {
    // If no API configured, return local applications
    if (!API_URL) {
      const p = projects.find((x) => x.id === projectId)
      return p?.applications ?? []
    }

    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `${tokenType} ${token}`

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/projects/${projectId}/applications`, { headers })
      if (!res.ok) throw new Error(`Failed to fetch applications: ${res.status}`)
      const apiApps = await res.json()
      const mapped: Application[] = Array.isArray(apiApps)
        ? apiApps.map((a: any) => mapApiApplicationToApplication(a, projectId))
        : []

      // Only update state if changed to avoid unnecessary re-renders
      const current = projects.find((p) => p.id === projectId)?.applications ?? []
      const sameLength = current.length === mapped.length
      const sameIds = sameLength && current.every((c, i) => c.id === mapped[i]?.id && c.status === mapped[i]?.status)
      if (!(sameLength && sameIds)) {
        const updated = projects.map((p) => (p.id === projectId ? { ...p, applications: mapped } : p))
        saveProjects(updated)
      }
      return mapped
    } catch (_) {
      const p = projects.find((x) => x.id === projectId)
      return p?.applications ?? []
    }
  }

  const mapApiVolunteerToVolunteer = (api: any): Volunteer => {
    // Backend may return status like "ACTIVE"; normalize to title case used in UI
    const rawStatus = String(api.status ?? "Active").toLowerCase()
    const status: Volunteer["status"] = rawStatus.includes("inactive") ? "Inactive" : "Active"
    return {
      id: api.volunteer_id || api.id,
      name: api.name ?? "",
      email: api.email ?? "",
      skills: Array.isArray(api.skills) ? api.skills : [],
      status,
    }
  }

  const fetchProjectVolunteers = async (projectId: string): Promise<Volunteer[]> => {
    // If no API configured, return local volunteers
    if (!API_URL) {
      const p = projects.find((x) => x.id === projectId)
      return p?.volunteers ?? []
    }

    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `${tokenType} ${token}`

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/projects/${projectId}/volunteers`, { headers })
      if (!res.ok) throw new Error(`Failed to fetch volunteers: ${res.status}`)
      const apiVols = await res.json()
      const mapped: Volunteer[] = Array.isArray(apiVols) ? apiVols.map((v: any) => mapApiVolunteerToVolunteer(v)) : []

      // Update state if changed
      const current = projects.find((p) => p.id === projectId)?.volunteers ?? []
      const sameLength = current.length === mapped.length
      const sameIds = sameLength && current.every((c, i) => c.id === mapped[i]?.id && c.status === mapped[i]?.status)
      if (!(sameLength && sameIds)) {
        const updated = projects.map((p) => (p.id === projectId ? { ...p, volunteers: mapped } : p))
        saveProjects(updated)
      }
      return mapped
    } catch (_) {
      const p = projects.find((x) => x.id === projectId)
      return p?.volunteers ?? []
    }
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        applyToProject,
        updateApplicationStatus,
        getUserProjects,
        getUserApplications,
        fetchProjectApplications,
        fetchProjectVolunteers,
        uploadProjectImage,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}
