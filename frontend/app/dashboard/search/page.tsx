"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useProjects, type Project } from "@/contexts/ProjectsContext"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Globe,
  Building,
  Wifi,
  X,
  ExternalLink,
  CheckCircle,
  Home,
  User,
  FolderKanban,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "@/lib/motion"

export default function SearchPage() {
  const { user } = useAuth()
  const { projects, applyToProject } = useProjects()
  const pathname = usePathname()

  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    projectType: "All",
    category: "All",
    location: "",
    skills: [] as string[],
    dateRange: "All",
  })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
  })
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const quickNavItems = useMemo(
    () => [
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      { icon: User, label: "Profile", href: "/dashboard/profile" },
      { icon: Search, label: "Search Opportunities", href: "/dashboard/search" },
      { icon: FolderKanban, label: "Projects", href: "/dashboard/projects" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    ],
    [],
  )

  // Get recommended projects based on user skills and interests
  const recommendedProjects = useMemo(() => {
    if (!user?.skills?.length && !user?.interests?.length) return []

    return projects
      .filter((project) => {
        const matchesSkills = project.skillsNeeded.some((skill) => user.skills?.includes(skill))
        const matchesInterests = user.interests?.includes(project.category)
        return matchesSkills || matchesInterests
      })
      .slice(0, 3)
  }, [projects, user])

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filters.projectType === "All" || project.projectType === filters.projectType

      const matchesCategory = filters.category === "All" || project.category === filters.category

      const matchesLocation =
        filters.location === "" ||
        project.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
        project.projectType === "Online"

      const matchesSkills =
        filters.skills.length === 0 || filters.skills.some((skill) => project.skillsNeeded.includes(skill))

      const matchesDateRange = (() => {
        if (filters.dateRange === "All") return true
        const now = new Date()
        const startDate = new Date(project.startDate)

        if (filters.dateRange === "This Week") {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return startDate >= now && startDate <= weekFromNow
        }
        if (filters.dateRange === "This Month") {
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          return startDate >= now && startDate <= monthFromNow
        }
        if (filters.dateRange === "Next 3 Months") {
          const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          return startDate >= now && startDate <= threeMonthsFromNow
        }
        return true
      })()

      return matchesSearch && matchesType && matchesCategory && matchesLocation && matchesSkills && matchesDateRange
    })
  }, [projects, searchQuery, filters])

  const handleApply = () => {
    if (!selectedProject || !user) return

    // Submit application via context (will call backend if configured)
    applyToProject(selectedProject.id, {
      projectId: selectedProject.id,
      volunteerId: user.id,
      volunteerName: applicationData.name,
      volunteerEmail: applicationData.email,
      volunteerPhone: applicationData.phone,
      skills: user.skills || [],
      message: applicationData.message,
      status: "Pending",
    })

    setApplicationSuccess(true)
    setShowApplicationForm(false)

    setTimeout(() => {
      setApplicationSuccess(false)
      setSelectedProject(null)
    }, 3000)
  }

  const categories = ["All", "Education", "Welfare", "Technology", "Healthcare", "Environment", "Arts & Culture"]
  const allSkills = Array.from(new Set(projects.flatMap((p) => p.skillsNeeded)))
  const dateRanges = ["All", "This Week", "This Month", "Next 3 Months"]

  return (
    <div className="max-w-7xl mx-auto px-5">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
  <div className="flex items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const baseStyles =
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap shadow-sm"
            const activeStyles = "bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] border-transparent"
            const inactiveStyles = "bg-white border-[#f3e8ff] hover:bg-[#fdf2f8]"

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#ec4899]"}`} />
                <span className={`text-sm font-medium ${isActive ? "text-white" : "text-[#1f2937]"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[#1f2937] mb-2">Search Volunteer Opportunities</h1>
        <p className="text-[#6b7280]">Find projects and causes that match your skills and interests</p>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {applicationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Your application has been sent successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af] pr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, events, or causes..."
            className="w-full pl-12 pr-4 py-4 border border-[#f3e8ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-white shadow-sm transition-all"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 bg-white rounded-xl p-6 border border-[#f3e8ff] shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#ec4899]" />
          <h3 className="font-semibold text-[#1f2937]">Filters</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-2">Project Type</label>
            <select
              value={filters.projectType}
              onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
              className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 transition-all"
            >
              <option>All</option>
              <option>Online</option>
              <option>Onsite</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 transition-all"
            >
              {dateRanges.map((range) => (
                <option key={range}>{range}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-2">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="City or region"
              className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1f2937] mb-2">Skills</label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const value = skillInput.trim()
                  if (!value) return
                  if (!filters.skills.includes(value)) {
                    setFilters({ ...filters, skills: [...filters.skills, value] })
                  }
                  setSkillInput("")
                }
              }}
              placeholder="Type a skill and press Enter"
              className="w-full mb-2 px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 transition-all"
            />
            <select
              multiple
              value={filters.skills}
              onChange={(e) =>
                setFilters({ ...filters, skills: Array.from(e.target.selectedOptions, (option) => option.value) })
              }
              className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 transition-all"
              size={3}
            >
              {allSkills.map((skill) => (
                <option key={skill}>{skill}</option>
              ))}
            </select>

            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#fce7f3] text-[#ec4899] border border-[#f3e8ff]"
                  >
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => setFilters({ ...filters, skills: filters.skills.filter((s) => s !== skill) })}
                      className="ml-1 hover:text-[#db2777] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recommended Projects */}
      {recommendedProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-[#1f2937] mb-4">Recommended for You</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <ProjectCard project={project} onViewDetails={setSelectedProject} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-[#1f2937] mb-4">All Opportunities ({filteredProjects.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
            >
              <ProjectCard project={project} onViewDetails={setSelectedProject} />
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl border border-[#f3e8ff]"
          >
            <p className="text-[#6b7280]">No projects found matching your criteria</p>
          </motion.div>
        )}
      </motion.div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && !showApplicationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <Image
                  src={selectedProject.imageUrl || "/placeholder.svg"}
                  alt={selectedProject.title}
                  fill
                  className="object-cover rounded-t-xl"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1f2937] mb-2">{selectedProject.title}</h2>
                    <span className="inline-block px-3 py-1 bg-[#fce7f3] text-[#ec4899] rounded-full text-sm font-medium">
                      {selectedProject.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 text-sm text-[#6b7280]">
                  <div className="flex items-center gap-2">
                    {selectedProject.projectType === "Online" ? (
                      <Wifi className="w-4 h-4" />
                    ) : selectedProject.projectType === "Onsite" ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    {selectedProject.projectType}
                  </div>
                  {selectedProject.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedProject.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedProject.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedProject.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-[#1f2937] mb-2">Description</h3>
                  <p className="text-[#6b7280] leading-relaxed">{selectedProject.detailedDescription}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-[#1f2937] mb-2">Skills Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skillsNeeded.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-[#e0f2fe] text-[#14b8a6] rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.events.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#1f2937] mb-3">Upcoming Events</h3>
                    <div className="space-y-3">
                      {selectedProject.events.map((event) => (
                        <div key={event.id} className="p-4 bg-[#fdf2f8] rounded-lg border border-[#f3e8ff]">
                          <h4 className="font-medium text-[#1f2937] mb-1">{event.name}</h4>
                          <p className="text-sm text-[#6b7280] mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-[#6b7280]">
                            <span>
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.slotsAvailable} slots
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6 p-4 bg-[#fdf2f8] rounded-lg border border-[#f3e8ff]">
                  <h3 className="font-semibold text-[#1f2937] mb-2">Organizer</h3>
                  <p className="text-[#6b7280]">
                    <strong>{selectedProject.creatorName}</strong>
                  </p>
                  <p className="text-sm text-[#6b7280]">{selectedProject.creatorEmail}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Apply to Volunteer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplicationForm && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-xl max-w-md w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#1f2937]">Apply to Volunteer</h3>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Removed Google Form redirection. Application is submitted directly in-app. */}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-2">Name</label>
                  <input
                    type="text"
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-2">Email</label>
                  <input
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-2">Message (Optional)</label>
                  <textarea
                    value={applicationData.message}
                    onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 resize-none"
                    placeholder="Why are you interested in this project?"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Submit Application
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectCard({ project, onViewDetails }: { project: Project; onViewDetails: (project: Project) => void }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md border border-[#f3e8ff] overflow-hidden cursor-pointer"
    >
      <div className="relative h-48">
        <Image src={project.imageUrl || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#ec4899] rounded-full text-xs font-semibold">
            {project.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-[#1f2937] mb-2 line-clamp-2">{project.title}</h3>
        <p className="text-sm text-[#6b7280] mb-4 line-clamp-2">{project.shortDescription}</p>

        <div className="space-y-2 mb-4 text-sm text-[#6b7280]">
          <div className="flex items-center gap-2">
            {project.projectType === "Online" ? (
              <Wifi className="w-4 h-4 text-[#ec4899]" />
            ) : project.projectType === "Onsite" ? (
              <Building className="w-4 h-4 text-[#ec4899]" />
            ) : (
              <Globe className="w-4 h-4 text-[#ec4899]" />
            )}
            <span>{project.projectType}</span>
            {project.location && <span className="text-[#9ca3af]">• {project.location}</span>}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ec4899]" />
            <span>{new Date(project.startDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.skillsNeeded.slice(0, 2).map((skill) => (
            <span key={skill} className="px-2 py-1 bg-[#fce7f3] text-[#ec4899] rounded text-xs font-medium">
              {skill}
            </span>
          ))}
          {project.skillsNeeded.length > 2 && (
            <span className="px-2 py-1 bg-[#f3f4f6] text-[#6b7280] rounded text-xs font-medium">
              +{project.skillsNeeded.length - 2} more
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(project)}
          className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  )
}
