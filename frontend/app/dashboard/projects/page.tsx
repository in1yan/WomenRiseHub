"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useProjects, type Project, type Application, type Volunteer } from "@/contexts/ProjectsContext"
import {
  Plus,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CalendarCheck,
  FolderKanban,
  Info,
  MapPin,
  Tag,
} from "lucide-react"
import Image from "next/image"
import { motion } from "@/lib/motion"

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, getUserProjects, deleteProject, updateApplicationStatus } = useProjects()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "applications" | "details">("list")

  const userProjects = getUserProjects(user?.id || "")

  const totalProjects = userProjects.length
  const totalEvents = userProjects.reduce((sum, project) => sum + (project.events?.length || 0), 0)
  const totalVolunteers = userProjects.reduce((sum, project) => sum + project.volunteers.length, 0)

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId)
    }
  }

  const handleApplicationAction = (
    projectId: string,
    applicationId: string,
    status: "Accepted" | "Rejected",
    application?: Application,
  ) => {
    updateApplicationStatus(projectId, applicationId, status, application)
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent mb-2">
              My Projects
            </h1>
            <p className="text-[#6b7280] text-lg">Create and manage your volunteer projects</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </motion.button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-[#fce7f3] to-[#fdf2f8] rounded-xl p-6 border border-[#f3e8ff] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280] mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-[#ec4899]">{totalProjects}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-xl flex items-center justify-center">
                <FolderKanban className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-[#f3e8ff] to-[#fdf2f8] rounded-xl p-6 border border-[#f3e8ff] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280] mb-1">Total Events</p>
                <p className="text-3xl font-bold text-[#8b5cf6]">{totalEvents}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-[#fce7f3] to-[#f3e8ff] rounded-xl p-6 border border-[#f3e8ff] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280] mb-1">Total Volunteers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
                  {totalVolunteers}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {userProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-[#fdf2f8] rounded-2xl border border-[#f3e8ff] p-12 text-center shadow-lg"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#1f2937] mb-3">No Projects Yet</h3>
          <p className="text-[#6b7280] mb-8 text-lg">Start making an impact by creating your first volunteer project</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white rounded-xl hover:shadow-lg transition-all font-semibold text-lg"
          >
            Create Your First Project
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {userProjects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl shadow-md border border-[#f3e8ff] overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative h-48">
                <Image src={project.imageUrl || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white line-clamp-2">{project.title}</h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-[#6b7280] mb-4 line-clamp-2">{project.shortDescription}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between p-2 bg-[#fce7f3] rounded-lg">
                    <span className="text-[#6b7280] font-medium">Volunteers</span>
                    <span className="font-bold text-[#ec4899] flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.volunteers.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#fef3c7] rounded-lg">
                    <span className="text-[#6b7280] font-medium">Applications</span>
                    <span className="font-bold text-[#f59e0b] flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.applications.filter((a) => a.status === "Pending").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#f0fdfa] rounded-lg">
                    <span className="text-[#6b7280] font-medium">Start Date</span>
                    <span className="font-bold text-[#14b8a6] flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedProject(project)
                      setViewMode("details")
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm"
                  >
                    <Info className="w-4 h-4" />
                    Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedProject(project)
                      setViewMode("applications")
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Manage
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Project Modal */}
      {showCreateForm && <CreateProjectForm onClose={() => setShowCreateForm(false)} />}

      {/* Project Details Modal */}
      {selectedProject && viewMode === "details" && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null)
            setViewMode("list")
          }}
        />
      )}

      {/* Manage Project Modal */}
      {selectedProject && viewMode === "applications" && (
        <ManageProjectModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null)
            setViewMode("list")
          }}
          onApplicationAction={handleApplicationAction}
        />
      )}
    </div>
  )
}

function CreateProjectForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const { addProject, uploadProjectImage } = useProjects()
  const backendEnabled = Boolean(process.env.NEXT_PUBLIC_API_URL)
  const defaultImageUrl = "/volunteer-project.jpg"
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    detailedDescription: "",
    category: "Education",
    skillsNeeded: [] as string[],
    projectType: "Online" as "Online" | "Onsite" | "Hybrid",
    location: "",
    startDate: "",
    endDate: "",
    imageUrl: defaultImageUrl,
  })
  const [skillInput, setSkillInput] = useState("")
  const [events, setEvents] = useState<
    Array<{ name: string; date: string; time: string; description: string; slotsAvailable: number }>
  >([])
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    time: "",
    description: "",
    slotsAvailable: 10,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(defaultImageUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearObjectUrl()
    }
  }, [])

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skillsNeeded.includes(skillInput.trim())) {
      setFormData({ ...formData, skillsNeeded: [...formData.skillsNeeded, skillInput.trim()] })
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skillsNeeded: formData.skillsNeeded.filter((s) => s !== skill) })
  }

  const handleAddEvent = () => {
    if (eventForm.name && eventForm.date && eventForm.time) {
      setEvents([...events, { ...eventForm, id: Date.now().toString() } as any])
      setEventForm({ name: "", date: "", time: "", description: "", slotsAvailable: 10 })
    }
  }

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file.")
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image must be 5MB or smaller.")
      return
    }

    setUploadError(null)
    setImageFile(file)
    clearObjectUrl()
    const previewUrl = URL.createObjectURL(file)
    objectUrlRef.current = previewUrl
    setImagePreview(previewUrl)
  }

  const handleResetImage = () => {
    setImageFile(null)
    setUploadError(null)
    clearObjectUrl()
    setImagePreview(defaultImageUrl)
    setFormData((prev) => ({ ...prev, imageUrl: defaultImageUrl }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError(null)
    setIsSubmitting(true)

    let shouldClose = false

    try {
      let storedImageUrl = formData.imageUrl || defaultImageUrl
      let previewUrlForUi = imagePreview || defaultImageUrl

      if (imageFile) {
        const uploadResult = await uploadProjectImage(imageFile)
        if (!uploadResult) {
          if (backendEnabled) {
            setUploadError("We couldn't upload the image. Please try again.")
            return
          }
        } else {
          storedImageUrl = uploadResult.storedUrl
          previewUrlForUi = uploadResult.previewUrl
          setFormData((prev) => ({ ...prev, imageUrl: uploadResult.storedUrl }))
          clearObjectUrl()
        }
      }

      addProject({
        ...formData,
        imageUrl: storedImageUrl,
        creatorId: user?.id || "",
        creatorName: user?.fullName || "",
        creatorEmail: user?.email || "",
        creatorPhone: user?.phone || "",
        events: events.map((e, i) => ({ ...e, id: `event-${i}` })),
      })

      setImagePreview(previewUrlForUi)
      setImageFile(null)
      shouldClose = true
    } finally {
      setIsSubmitting(false)
      if (shouldClose) {
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full my-10 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#1f2937] mb-6">Create New Project</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1f2937] mb-2">Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f2937] mb-2">Short Description *</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                placeholder="Brief one-line description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f2937] mb-2">Detailed Description *</label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30 resize-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  required
                >
                  <option>Education</option>
                  <option>Welfare</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Environment</option>
                  <option>Arts & Culture</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-2">Project Type *</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                  className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  required
                >
                  <option>Online</option>
                  <option>Onsite</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            {(formData.projectType === "Onsite" || formData.projectType === "Hybrid") && (
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  placeholder="City, Country"
                  required
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-2">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f2937] mb-2">Project Image</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label
                  htmlFor="project-image-upload"
                  className={`inline-flex items-center justify-center px-5 py-3 rounded-lg border border-transparent bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-medium shadow-sm transition-all hover:shadow-lg ${isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-disabled={isSubmitting}
                >
                  Choose Image
                </label>
                <button
                  type="button"
                  onClick={handleResetImage}
                  disabled={(imagePreview === defaultImageUrl && !imageFile) || isSubmitting}
                  className="px-4 py-3 rounded-lg border border-[#f3e8ff] text-[#1f2937] hover:bg-[#fce7f3]/60 transition-colors disabled:opacity-60"
                >
                  Use Default
                </button>
              </div>
              <input
                id="project-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <p className="text-xs text-[#6b7280] mt-2">Recommended 1200×800px, max size 5MB (JPG, PNG, GIF, WebP).</p>
              {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
              <div className="mt-3 h-48 w-full rounded-xl overflow-hidden border border-[#f3e8ff] bg-[#fdf2f8] flex items-center justify-center">
                <img
                  src={imagePreview || defaultImageUrl}
                  alt="Project image preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f2937] mb-2">Skills Needed</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-4 py-3 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-[#fce7f3]/30"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-[#ec4899] text-white rounded-lg hover:bg-[#db2777] transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsNeeded.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#fce7f3] text-[#ec4899] rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-[#db2777]">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f2937] mb-3">Events (Optional)</label>
              <div className="bg-[#fdf2f8] p-4 rounded-lg border border-[#f3e8ff] mb-3">
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                    placeholder="Event name"
                    className="px-3 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-white text-sm"
                  />
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="px-3 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-white text-sm"
                  />
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="px-3 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-white text-sm"
                  />
                  <input
                    type="number"
                    value={eventForm.slotsAvailable}
                    onChange={(e) => setEventForm({ ...eventForm, slotsAvailable: Number.parseInt(e.target.value) })}
                    placeholder="Slots available"
                    className="px-3 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-white text-sm mb-3"
                  />
                </div>
                <input
                  type="text"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event description"
                  className="w-full px-3 py-2 border border-[#f3e8ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec4899] bg-white text-sm mb-3"
                />
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="w-full px-4 py-2 bg-[#ec4899] text-white rounded-lg hover:bg-[#db2777] transition-colors font-medium text-sm"
                >
                  Add Event
                </button>
              </div>

              {events.length > 0 && (
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#f3e8ff]"
                    >
                      <div>
                        <p className="font-medium text-[#1f2937] text-sm">{event.name}</p>
                        <p className="text-xs text-[#6b7280]">
                          {event.date} at {event.time} • {event.slotsAvailable} slots
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-[#f3e8ff] text-[#1f2937] rounded-lg hover:bg-[#fce7f3] transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-[#ec4899] text-white rounded-lg hover:bg-[#db2777] transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ManageProjectModal({
  project,
  onClose,
  onApplicationAction,
}: {
  project: Project
  onClose: () => void
  onApplicationAction: (
    projectId: string,
    applicationId: string,
    status: "Accepted" | "Rejected",
    application?: Application,
  ) => void
}) {
  const { fetchProjectApplications, fetchProjectVolunteers, projects } = useProjects()
  const [activeTab, setActiveTab] = useState<"applications" | "volunteers">("applications")
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [volunteers, setVolunteers] = useState<Volunteer[]>(project.volunteers ?? [])
  const [loadingVolunteers, setLoadingVolunteers] = useState(false)
  const [volunteersError, setVolunteersError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingApps(true)
      try {
        const apps = await fetchProjectApplications(project.id)
        if (mounted) {
          setApplications(apps)
        }
      } finally {
        if (mounted) setLoadingApps(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [project.id])

  // Always reflect the most up-to-date project data from context (avoids stale volunteers after actions)
  const currentProject = projects.find((p) => p.id === project.id) || project
  const contextVolunteers = useMemo(() => currentProject.volunteers ?? [], [currentProject])
  const pendingApplications = applications.filter((a) => a.status === "Pending")
  const reviewedApplications = applications.filter((a) => a.status !== "Pending")

  // Keep local applications in sync with context updates as a safety net
  useEffect(() => {
    const fromContext = projects.find((p) => p.id === project.id)?.applications ?? []
    // If local is empty or lengths differ, sync from context
    const needsSync = applications.length === 0 || applications.length !== fromContext.length
    if (needsSync && fromContext.length > 0) {
      setApplications(fromContext)
    }
  }, [projects, project.id])

  // Keep volunteer list in sync with context updates (e.g. after accepting an application)
  useEffect(() => {
    if (activeTab === "volunteers") {
      setVolunteers(contextVolunteers)
    }
  }, [contextVolunteers, activeTab])

  // Fetch volunteers whenever the Volunteers tab is activated
  useEffect(() => {
    if (activeTab !== "volunteers") return

    let cancelled = false
    const loadVolunteers = async () => {
      setLoadingVolunteers(true)
      setVolunteersError(null)
      try {
        const fetched = await fetchProjectVolunteers(project.id)
        if (!cancelled) {
          setVolunteers(fetched)
        }
      } catch (_) {
        if (!cancelled) {
          setVolunteers(contextVolunteers)
          setVolunteersError("Couldn't refresh volunteers from the server. Showing the most recent cached list.")
        }
      } finally {
        if (!cancelled) {
          setLoadingVolunteers(false)
        }
      }
    }

    // Only refetch when we don't already have data for this project
    const hasVolunteersCached = contextVolunteers.length > 0
    if (!hasVolunteersCached) {
      loadVolunteers()
    } else {
      setVolunteers(contextVolunteers)
    }

    return () => {
      cancelled = true
    }
  }, [activeTab, project.id, fetchProjectVolunteers, contextVolunteers])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1f2937] mb-1">{project.title}</h2>
              <p className="text-[#6b7280]">Manage volunteers and applications</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-[#f3e8ff]">
            <button
              onClick={() => setActiveTab("applications")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "applications"
                  ? "text-[#ec4899] border-b-2 border-[#ec4899]"
                  : "text-[#6b7280] hover:text-[#1f2937]"
              }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "volunteers"
                  ? "text-[#ec4899] border-b-2 border-[#ec4899]"
                  : "text-[#6b7280] hover:text-[#1f2937]"
              }`}
            >
              Volunteers ({currentProject.volunteers.length})
            </button>
          </div>

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {loadingApps && applications.length === 0 ? (
                <div className="text-center py-12 text-[#6b7280]">Loading applications...</div>
              ) : (
                <>
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                      <p className="text-[#6b7280]">No applications yet</p>
                    </div>
                  ) : (
                    <>
                      {pendingApplications.length > 0 && (
                        <>
                          <h3 className="font-semibold text-[#1f2937] mb-3">Pending Applications</h3>
                          {pendingApplications.map((app) => (
                            <div key={app.id} className="p-4 bg-[#fdf2f8] rounded-lg border border-[#f3e8ff]">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-[#1f2937]">{app.volunteerName}</h4>
                                  <p className="text-sm text-[#6b7280]">{app.volunteerEmail}</p>
                                  {app.volunteerPhone && <p className="text-sm text-[#6b7280]">{app.volunteerPhone}</p>}
                                </div>
                                <span className="px-3 py-1 bg-[#fef3c7] text-[#f59e0b] rounded-full text-xs font-medium">
                                  Pending
                                </span>
                              </div>

                              {app.skills.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-[#6b7280] mb-2">Skills:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {app.skills.map((skill) => (
                                      <span key={skill} className="px-2 py-1 bg-white text-[#ec4899] rounded text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {app.message && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-[#6b7280] mb-1">Message:</p>
                                  <p className="text-sm text-[#1f2937]">{app.message}</p>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    onApplicationAction(project.id, app.id, "Accepted", app)
                                    setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: "Accepted" } : a)))
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => {
                                    onApplicationAction(project.id, app.id, "Rejected", app)
                                    setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: "Rejected" } : a)))
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {reviewedApplications.length > 0 && (
                        <>
                          <h3 className="font-semibold text-[#1f2937] mb-3 mt-6">Reviewed Applications</h3>
                          {reviewedApplications.map((app) => (
                            <div key={app.id} className="p-4 bg-white rounded-lg border border-[#f3e8ff]">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-[#1f2937]">{app.volunteerName}</h4>
                                  <p className="text-sm text-[#6b7280]">{app.volunteerEmail}</p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    app.status === "Accepted" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {/* Fallback: if statuses are unknown, still render all applications */}
                      {pendingApplications.length === 0 && reviewedApplications.length === 0 && applications.length > 0 && (
                        <>
                          <h3 className="font-semibold text-[#1f2937] mb-3">All Applications</h3>
                          {applications.map((app) => (
                            <div key={app.id} className="p-4 bg-white rounded-lg border border-[#f3e8ff]">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-[#1f2937]">{app.volunteerName || app.volunteerEmail}</h4>
                                  {app.volunteerEmail && <p className="text-sm text-[#6b7280]">{app.volunteerEmail}</p>}
                                  {app.volunteerPhone && <p className="text-sm text-[#6b7280]">{app.volunteerPhone}</p>}
                                </div>
                                {app.status && (
                                  <span className="px-3 py-1 bg-[#f3f4f6] text-[#6b7280] rounded-full text-xs font-medium">
                                    {app.status}
                                  </span>
                                )}
                              </div>
                              {Array.isArray(app.skills) && app.skills.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-[#6b7280] mb-2">Skills:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {app.skills.map((skill) => (
                                      <span key={skill} className="px-2 py-1 bg-[#fce7f3] text-[#ec4899] rounded text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {app.message && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-[#6b7280] mb-1">Message:</p>
                                  <p className="text-sm text-[#1f2937]">{app.message}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Volunteers Tab */}
          {activeTab === "volunteers" && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {volunteersError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{volunteersError}</div>
              )}

              {loadingVolunteers ? (
                <div className="text-center py-12 text-[#6b7280]">Loading volunteers...</div>
              ) : volunteers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                  <p className="text-[#6b7280]">No volunteers yet</p>
                </div>
              ) : (
                volunteers.map((volunteer) => (
                  <div key={volunteer.id} className="p-4 bg-white rounded-lg border border-[#f3e8ff]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[#1f2937]">{volunteer.name || volunteer.email}</h4>
                        <p className="text-sm text-[#6b7280]">{volunteer.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          volunteer.status === "Active" ? "bg-green-50 text-green-700" : "bg-[#f3f4f6] text-[#6b7280]"
                        }`}
                      >
                        {volunteer.status}
                      </span>
                    </div>

                    {Array.isArray(volunteer.skills) && volunteer.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[#6b7280] mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {volunteer.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-[#fce7f3] text-[#ec4899] rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectDetailsModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl max-w-4xl w-full my-8"
      >
        <div className="relative h-64">
          <Image
            src={project.imageUrl || "/placeholder.svg"}
            alt={project.title}
            fill
            className="object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
          >
            <XCircle className="w-5 h-5 text-[#1f2937]" />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
            <p className="text-white/90 text-lg">{project.shortDescription}</p>
          </div>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Project Info Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-[#fce7f3] to-[#fdf2f8] rounded-xl border border-[#f3e8ff]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6b7280] font-medium">Category</p>
                  <p className="text-sm font-bold text-[#1f2937]">{project.category}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#f3e8ff] to-[#fdf2f8] rounded-xl border border-[#f3e8ff]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6b7280] font-medium">Type</p>
                  <p className="text-sm font-bold text-[#1f2937]">{project.projectType}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#fce7f3] to-[#f3e8ff] rounded-xl border border-[#f3e8ff]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6b7280] font-medium">Volunteers</p>
                  <p className="text-sm font-bold text-[#1f2937]">{project.volunteers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          {project.location && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1f2937] mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#ec4899]" />
                Location
              </h3>
              <p className="text-[#6b7280] bg-[#fce7f3]/30 p-4 rounded-xl border border-[#f3e8ff]">
                {project.location}
              </p>
            </div>
          )}

          {/* Detailed Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#1f2937] mb-3">About This Project</h3>
            <p className="text-[#6b7280] leading-relaxed bg-[#fdf2f8] p-4 rounded-xl border border-[#f3e8ff]">
              {project.detailedDescription}
            </p>
          </div>

          {/* Project Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#1f2937] mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8b5cf6]" />
              Project Timeline
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-[#f0fdfa] to-white rounded-xl border border-[#f3e8ff]">
                <p className="text-xs text-[#6b7280] font-medium mb-1">Start Date</p>
                <p className="text-lg font-bold text-[#14b8a6]">
                  {new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#fef3c7] to-white rounded-xl border border-[#f3e8ff]">
                <p className="text-xs text-[#6b7280] font-medium mb-1">End Date</p>
                <p className="text-lg font-bold text-[#f59e0b]">
                  {new Date(project.endDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Skills Needed */}
          {project.skillsNeeded.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1f2937] mb-3">Skills Needed</h3>
              <div className="flex flex-wrap gap-2">
                {project.skillsNeeded.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-gradient-to-r from-[#fce7f3] to-[#f3e8ff] text-[#ec4899] rounded-full text-sm font-semibold border border-[#f3e8ff]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {project.events && project.events.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#1f2937] mb-3 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#8b5cf6]" />
                Upcoming Events
              </h3>
              <div className="space-y-3">
                {project.events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gradient-to-br from-white to-[#fdf2f8] rounded-xl border border-[#f3e8ff] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-[#1f2937]">{event.name}</h4>
                      <span className="px-3 py-1 bg-[#fce7f3] text-[#ec4899] rounded-full text-xs font-semibold">
                        {event.slotsAvailable} slots
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#6b7280] mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                    </div>
                    {event.description && <p className="text-sm text-[#6b7280]">{event.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creator Info */}
          <div className="p-4 bg-gradient-to-br from-[#fdf2f8] to-white rounded-xl border border-[#f3e8ff]">
            <h3 className="text-sm font-bold text-[#1f2937] mb-2">Project Creator</h3>
            <p className="text-sm text-[#6b7280]">
              <span className="font-semibold text-[#1f2937]">{project.creatorName}</span>
            </p>
            <p className="text-sm text-[#6b7280]">{project.creatorEmail}</p>
            {project.creatorPhone && <p className="text-sm text-[#6b7280]">{project.creatorPhone}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
