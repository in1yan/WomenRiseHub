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
  status: "Active"
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
  updateApplicationStatus: (projectId: string, applicationId: string, status: "Accepted" | "Rejected") => void
  getUserProjects: (userId: string) => Project[]
  getUserApplications: (userId: string) => Application[]
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

  useEffect(() => {
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

  const addProject = (project: Omit<Project, "id" | "volunteers" | "applications">) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
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
    const newApplication: Application = {
      ...application,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString(),
    }

    saveProjects(
      projects.map((p) => (p.id === projectId ? { ...p, applications: [...p.applications, newApplication] } : p)),
    )
  }

  const updateApplicationStatus = (projectId: string, applicationId: string, status: "Accepted" | "Rejected") => {
    saveProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          const updatedApplications = p.applications.map((app) => (app.id === applicationId ? { ...app, status } : app))

          // If accepted, add to volunteers
          if (status === "Accepted") {
            const acceptedApp = p.applications.find((app) => app.id === applicationId)
            if (acceptedApp) {
              const newVolunteer: Volunteer = {
                id: acceptedApp.volunteerId,
                name: acceptedApp.volunteerName,
                email: acceptedApp.volunteerEmail,
                skills: acceptedApp.skills,
                status: "Active",
              }
              return {
                ...p,
                applications: updatedApplications,
                volunteers: [...p.volunteers, newVolunteer],
              }
            }
          }

          return { ...p, applications: updatedApplications }
        }
        return p
      }),
    )
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
