"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Target, Eye, Lightbulb, X } from "lucide-react"
import { motion } from "@/lib/motion"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)

  useEffect(() => {
    if (searchParams.get("showProfilePrompt") === "true") {
      setShowProfilePrompt(true)
    }
  }, [searchParams])

  const handleCompleteProfile = () => {
    router.push("/dashboard/profile")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
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
        ease: "easeOut",
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Completion Prompt */}
      {showProfilePrompt && (!user?.skills?.length || !user?.bio) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 bg-gradient-to-r from-[#ec4899] to-[#f472b6] text-white p-6 rounded-xl shadow-lg relative"
        >
          <button
            onClick={() => setShowProfilePrompt(false)}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
          <p className="mb-4 opacity-90">
            Help us personalize your experience by completing your profile with your skills and interests.
          </p>
          <button
            onClick={handleCompleteProfile}
            className="bg-white text-[#ec4899] px-6 py-2 rounded-lg font-semibold hover:bg-[#fce7f3] transition-colors"
          >
            Complete Profile
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-[#1f2937] mb-3 text-balance">Welcome to WomenRiseHub! 🌸</h1>
        <p className="text-lg text-[#6b7280] leading-relaxed max-w-3xl mx-auto">
          Empowering women to lead, volunteer, and create lasting impact together.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-8 px-4"
      >
        {/* Mission Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-8 shadow-md border border-[#f3e8ff] hover:shadow-xl transition-shadow"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#ec4899] via-[#f472b6] to-[#fb7185] rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-6 transition-transform">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4">Our Mission</h2>
          <p className="text-[#6b7280] leading-relaxed">
            At WomenRiseHub, our mission is to create an inclusive platform where every woman can step forward to lead,
            collaborate, and contribute to meaningful change. We aim to connect women across diverse backgrounds,
            empowering them with opportunities to build initiatives that uplift communities and inspire growth.
          </p>
        </motion.div>

        {/* Vision Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-8 shadow-md border border-[#f3e8ff] hover:shadow-xl transition-shadow"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#14b8a6] via-[#06b6d4] to-[#0ea5e9] rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-6 transition-transform">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4">Our Vision</h2>
          <p className="text-[#6b7280] leading-relaxed">
            We envision a world where women are at the forefront of social innovation - leading projects, solving
            challenges, and transforming ideas into real-world impact. WomenRiseHub strives to become the global space
            where leadership, empathy, and action unite to shape a more equitable and empowered future.
          </p>
        </motion.div>

        {/* Purpose Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-8 shadow-md border border-[#f3e8ff] hover:shadow-xl transition-shadow"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] via-[#f97316] to-[#fb923c] rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-6 transition-transform">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4">Our Purpose</h2>
          <p className="text-[#6b7280] leading-relaxed">
            WomenRiseHub exists to bridge the gap between passion and purpose. We believe every woman has the potential
            to drive change - whether through volunteering, mentoring, or leading projects. Our purpose is to provide
            the tools, community, and inspiration to help women rise together and create lasting impact in society.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 px-4"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-6 text-center border border-[#f3e8ff] hover:shadow-md transition-shadow"
        >
          <p className="text-3xl font-bold text-[#ec4899]">0</p>
          <p className="text-sm text-[#6b7280] mt-1">Projects Created</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-6 text-center border border-[#f3e8ff] hover:shadow-md transition-shadow"
        >
          <p className="text-3xl font-bold text-[#14b8a6]">0</p>
          <p className="text-sm text-[#6b7280] mt-1">Applications Sent</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-6 text-center border border-[#f3e8ff] hover:shadow-md transition-shadow"
        >
          <p className="text-3xl font-bold text-[#f59e0b]">0</p>
          <p className="text-sm text-[#6b7280] mt-1">Hours Volunteered</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl p-6 text-center border border-[#f3e8ff] hover:shadow-md transition-shadow"
        >
          <p className="text-3xl font-bold text-[#8b5cf6]">0</p>
          <p className="text-sm text-[#6b7280] mt-1">Connections Made</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
