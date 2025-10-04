"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  Camera,
  Save,
  CheckCircle,
  Menu as Venus,
  Plus,
} from "lucide-react"
import { motion, AnimatePresence } from "@/lib/motion"
import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const PHONE_MAX_LENGTH = 15
  const normalizePhoneInput = (value: string) => {
    const cleaned = value.replace(/[^0-9+]/g, "")
    const hasPlus = cleaned.startsWith("+")
    const digits = cleaned.replace(/\+/g, "")
    const limit = hasPlus ? PHONE_MAX_LENGTH - 1 : PHONE_MAX_LENGTH
    const trimmed = digits.slice(0, Math.max(0, limit))
    return hasPlus ? `+${trimmed}` : trimmed
  }
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    skills: [] as string[],
    interests: [] as string[],
    bio: "",
    city: "",
    country: "",
  })
  const [skillInput, setSkillInput] = useState("")
  const [interestInput, setInterestInput] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        skills: user.skills || [],
        interests: user.interests || [],
        bio: user.bio || "",
        city: user.location?.city || "",
        country: user.location?.country || "",
      })
    }
  }, [user])

  const completion = useMemo(() => {
    const fields = [
      formData.fullName.trim(),
      formData.email.trim(),
      formData.phone.trim(),
      formData.bio.trim(),
      formData.city.trim(),
      formData.country.trim(),
      formData.skills.length ? "1" : "",
      formData.interests.length ? "1" : "",
    ]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }, [formData])

  const handleAddSkill = () => {
    const v = skillInput.trim()
    if (v && !formData.skills.includes(v)) {
      setFormData((fd) => ({ ...fd, skills: [...fd.skills, v] }))
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData((fd) => ({ ...fd, skills: fd.skills.filter((s) => s !== skill) }))
  }

  const handleAddInterest = () => {
    const v = interestInput.trim()
    if (v && !formData.interests.includes(v)) {
      setFormData((fd) => ({ ...fd, interests: [...fd.interests, v] }))
      setInterestInput("")
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData((fd) => ({ ...fd, interests: fd.interests.filter((i) => i !== interest) }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await updateProfile({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      skills: formData.skills,
      interests: formData.interests,
      bio: formData.bio,
      location: {
        city: formData.city,
        country: formData.country,
      },
    })
    if (success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  // palette
  const pinkPrimary = "#F06292" // rose pink
  const pinkBaby = "#F8BBD0" // baby pink
  const pinkSoft = "#FFF1F5" // soft off-white pink
  const pinkTint = "#FFF7FA" // subtle section tint
  const charcoal = "#2D2D2D"

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ background: pinkBaby }}
            aria-hidden="true"
          >
            <Venus className="h-5 w-5" style={{ color: pinkPrimary }} />
          </div>
          <h1 className="text-3xl md:text-[32px] font-bold" style={{ color: pinkPrimary }}>
            My Profile
          </h1>
        </div>
        <p className="mt-1 text-sm md:text-base" style={{ color: "#6B7280" }}>
          Manage your personal information, skills, and interests.
        </p>
      </motion.div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mb-4 md:mb-6 rounded-xl border p-4 flex items-center gap-2"
            style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout: 2 columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: profile card + completion */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="md:col-span-1"
        >
          <div
            className="rounded-2xl border shadow-sm p-6"
            style={{ background: "#FFFFFF", borderColor: pinkBaby + "66" }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow"
                  style={{
                    background: `linear-gradient(135deg, ${pinkPrimary}, #EC407A)`,
                    boxShadow: "0 8px 20px rgba(240,98,146,0.25)",
                  }}
                  aria-label="Profile picture"
                >
                  {formData.fullName?.charAt(0) || "U"}
                </motion.div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{ background: pinkPrimary, boxShadow: "0 6px 14px rgba(240,98,146,0.3)" }}
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: charcoal }}>
                  {formData.fullName || "Your Name"}
                </h3>
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  {formData.email || "no-email@womenrisehub.org"}
                </p>
              </div>
            </div>

            {/* Completion */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: charcoal }}>
                Profile completion
              </span>
              <span className="text-sm font-semibold" style={{ color: pinkPrimary }}>
                {completion}%
              </span>
            </div>
            <Progress value={completion} className="h-2" />
            <p className="mt-2 text-xs" style={{ color: "#6B7280" }}>
              Complete your profile to enhance your visibility to collaborators.
            </p>
          </div>
        </motion.section>

        {/* Right column: form */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="md:col-span-2"
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border shadow-sm p-6 md:p-8 space-y-8"
            style={{ background: pinkSoft, borderColor: pinkBaby + "66" }}
          >
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: charcoal }}>
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium" style={{ color: charcoal }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition-colors"
                      style={{ borderColor: pinkBaby, color: charcoal }}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium" style={{ color: charcoal }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition-colors"
                      style={{ borderColor: pinkBaby, color: charcoal }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium" style={{ color: charcoal }}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
                    <input
                      type="tel"
                      value={formData.phone}
                      maxLength={PHONE_MAX_LENGTH}
                      onChange={(e) => setFormData({ ...formData, phone: normalizePhoneInput(e.target.value) })}
                      className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition-colors"
                      style={{ borderColor: pinkBaby, color: charcoal }}
                      placeholder="e.g., +91 98765 43210"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium" style={{ color: charcoal }}>
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition-colors"
                      style={{ borderColor: pinkBaby, color: charcoal }}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-base font-medium" style={{ color: charcoal }}>
                    Country
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition-colors"
                      style={{ borderColor: pinkBaby, color: charcoal }}
                      placeholder="e.g., India"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: charcoal }}>
                Skills
              </h2>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Briefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: "#9CA3AF" }}
                  />
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition"
                    style={{ borderColor: pinkBaby, color: charcoal }}
                    placeholder="Add a skill (e.g., Project Management)"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={handleAddSkill}
                  whileTap={{ scale: 0.94 }}
                  className="inline-flex items-center justify-center rounded-full w-11 h-11 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${pinkPrimary}, #EC407A)`,
                    boxShadow: "0 8px 18px rgba(240,98,146,0.32)",
                  }}
                  aria-label="Add skill"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: pinkBaby, color: "#8E1640" }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="transition-colors"
                        style={{ color: "#7A0030" }}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Interests */}
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: charcoal }}>
                Interests
              </h2>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9CA3AF" }} />
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddInterest()
                      }
                    }}
                    className="w-full rounded-xl border bg-white pl-10 pr-4 py-3 outline-none transition"
                    style={{ borderColor: pinkBaby, color: charcoal }}
                    placeholder="Add an interest (e.g., Education, Women's Rights)"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={handleAddInterest}
                  whileTap={{ scale: 0.94 }}
                  className="inline-flex items-center justify-center rounded-full w-11 h-11 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${pinkPrimary}, #EC407A)`,
                    boxShadow: "0 8px 18px rgba(240,98,146,0.32)",
                  }}
                  aria-label="Add interest"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.interests.map((interest) => (
                    <motion.span
                      key={interest}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: "#E8F5E9", color: "#0F766E" }}
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="transition-colors"
                        style={{ color: "#0D9488" }}
                        aria-label={`Remove ${interest}`}
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* About Me */}
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: charcoal }}>
                About Me
              </h2>
              <div className="rounded-2xl p-4 border" style={{ background: pinkTint, borderColor: pinkBaby + "66" }}>
                <label
                  className="text-base font-medium flex items-center justify-between mb-2"
                  style={{ color: charcoal }}
                >
                  <span>Tell your story</span>
                  <span className="text-sm" style={{ color: "#6B7280" }}>
                    {formData.bio.length}/300
                  </span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 300) })}
                  rows={5}
                  className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition"
                  style={{ borderColor: pinkBaby, color: charcoal }}
                  placeholder="Share your passions, goals, and what empowers you..."
                />
              </div>
            </div>

            {/* Desktop Save button */}
            <div className="hidden md:flex justify-end pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold shadow"
                style={{
                  background: `linear-gradient(135deg, ${pinkPrimary}, #EC407A)`,
                  boxShadow: "0 10px 24px rgba(240,98,146,0.35)",
                }}
              >
                <Save className="w-5 h-5" />
                Save Profile
              </motion.button>
            </div>
          </form>
        </motion.section>
      </div>

      {/* Sticky mobile save bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div
          className="px-4 py-3 flex justify-end"
          style={{ background: "rgba(255, 241, 245, 0.9)", backdropFilter: "saturate(180%) blur(8px)" }}
        >
          <motion.button
            type="button"
            onClick={(e: any) => {
              // find nearest form and submit
              const form = document.querySelector("form")
              form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow"
            style={{
              background: `linear-gradient(135deg, ${pinkPrimary}, #EC407A)`,
              boxShadow: "0 10px 24px rgba(240,98,146,0.35)",
            }}
            aria-label="Save profile"
          >
            <Save className="w-5 h-5" />
            Save Profile
          </motion.button>
        </div>
      </div>
    </main>
  )
}
