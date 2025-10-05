"use client"

import type React from "react"
import { useMemo, useState, useEffect } from "react"
import { motion } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"
import {
  TrendingUp,
  Users,
  FolderKanban,
  Clock,
  Target,
  Calendar,
  Download,
  Sparkles,
  Heart,
  ClipboardList,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#ec4899", "#f472b6", "#fb7185", "#f9a8d4", "#fbcfe8"]

type DateRange = 7 | 30 | 90 | 365

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>(30)
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalEvents: 0,
    totalHours: 0,
    totalVolunteers: 0,
    totalImpact: 0,
    categoryData: [] as { name: string; value: number }[],
    hoursData: [] as { month: string; hours: number }[],
    skillData: [] as { name: string; value: number }[],
    applicationStats: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const TOKEN_STORAGE_KEY = "womenrisehub_token"
  const TOKEN_TYPE_STORAGE_KEY = "womenrisehub_token_type"

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!API_URL || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const token = localStorage.getItem(TOKEN_STORAGE_KEY)
        const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
        
        if (!token) {
          console.error("No authentication token found")
          setLoading(false)
          return
        }

        const headers = {
          Authorization: `${tokenType} ${token}`,
          "Content-Type": "application/json",
        }

        // Fetch all analytics data
        const [overviewRes, categoryRes, skillsRes, hoursRes, applicationStatsRes] = await Promise.all([
          fetch(`${API_URL}/analytics/overview?days=${dateRange}`, { headers }),
          fetch(`${API_URL}/analytics/projects-by-category?days=${dateRange}`, { headers }),
          fetch(`${API_URL}/analytics/skills-distribution?days=${dateRange}`, { headers }),
          fetch(`${API_URL}/analytics/monthly-hours?days=${dateRange}`, { headers }),
          fetch(`${API_URL}/analytics/application-stats?days=${dateRange}`, { headers }),
        ])

        if (overviewRes.ok && categoryRes.ok && skillsRes.ok && hoursRes.ok && applicationStatsRes.ok) {
          const overview = await overviewRes.json()
          const categoryData = await categoryRes.json()
          const skillData = await skillsRes.json()
          const hoursData = await hoursRes.json()
          const applicationStats = await applicationStatsRes.json()

          setAnalytics({
            totalProjects: overview.total_projects || 0,
            totalEvents: overview.total_events || 0,
            totalHours: overview.total_hours || 0,
            totalVolunteers: overview.total_volunteers || 0,
            totalImpact: overview.total_impact || 0,
            categoryData: categoryData || [],
            hoursData: hoursData || [],
            skillData: skillData || [],
            applicationStats: {
              total: applicationStats.total || 0,
              pending: applicationStats.pending || 0,
              accepted: applicationStats.accepted || 0,
              rejected: applicationStats.rejected || 0,
            },
          })
        } else {
          // Log error details
          console.error("Analytics API errors:")
          if (!overviewRes.ok) {
            const errorText = await overviewRes.text()
            console.error(`Overview: ${overviewRes.status} - ${errorText}`)
          }
          if (!categoryRes.ok) {
            const errorText = await categoryRes.text()
            console.error(`Category: ${categoryRes.status} - ${errorText}`)
          }
          if (!skillsRes.ok) {
            const errorText = await skillsRes.text()
            console.error(`Skills: ${skillsRes.status} - ${errorText}`)
          }
          if (!hoursRes.ok) {
            const errorText = await hoursRes.text()
            console.error(`Hours: ${hoursRes.status} - ${errorText}`)
          }
          if (!applicationStatsRes.ok) {
            const errorText = await applicationStatsRes.text()
            console.error(`Applications: ${applicationStatsRes.status} - ${errorText}`)
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange, API_URL, user])

  const handleExport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      const csvContent = `Analytics Report - ${dateRange} Days\n\nKPI,Value\nTotal Projects,${analytics.totalProjects}\nTotal Events,${analytics.totalEvents}\nTotal Hours,${analytics.totalHours}\nTotal Volunteers,${analytics.totalVolunteers}\nTotal Impact,${analytics.totalImpact}\nTotal Applications,${analytics.applicationStats.total}\n\nProjects by Category\n${analytics.categoryData.map((d) => `${d.name},${d.value}`).join("\n")}\n\nApplication Stats\nTotal,${analytics.applicationStats.total}\nPending,${analytics.applicationStats.pending}\nAccepted,${analytics.applicationStats.accepted}\nRejected,${analytics.applicationStats.rejected}`

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${dateRange}days.csv`
      a.click()
    } else {
      alert("PDF export coming soon!")
    }
  }

  const applicationBreakdown = useMemo(
    () => {
      const { total, pending, accepted, rejected } = analytics.applicationStats
      const safeTotal = total > 0 ? total : 0
      const percentage = (value: number) => (safeTotal > 0 ? Math.round((value / safeTotal) * 100) : 0)

      return [
        {
          label: "Pending Applications",
          value: pending,
          percentage: percentage(pending),
          icon: Hourglass,
          iconColor: "#f59e0b",
        },
        {
          label: "Accepted Applications",
          value: accepted,
          percentage: percentage(accepted),
          icon: CheckCircle,
          iconColor: "#10b981",
        },
        {
          label: "Rejected Applications",
          value: rejected,
          percentage: percentage(rejected),
          icon: XCircle,
          iconColor: "#ef4444",
        },
      ]
    },
    [analytics.applicationStats],
  )

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
      transition: { duration: 0.5 },
    },
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ec4899]"></div>
            <p className="mt-4 text-[#6b7280]">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#1f2937] mb-2">Analytics Dashboard</h1>
          <p className="text-[#6b7280]">Track your impact and engagement metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-md border border-[#f3e8ff] p-1">
            {([7, 30, 90, 365] as DateRange[]).map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dateRange === days
                    ? "bg-gradient-to-r from-[#ec4899] to-[#f472b6] text-white"
                    : "text-[#6b7280] hover:bg-[#fdf2f8]"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-[#f3e8ff] text-[#6b7280] hover:text-[#ec4899] hover:border-[#ec4899] transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
      >
        <AnimatedKPICard
          icon={FolderKanban}
          label="Total Projects Created"
          value={analytics.totalProjects}
          gradient="from-[#ec4899] to-[#f472b6]"
          delay={0}
        />
        <AnimatedKPICard
          icon={Calendar}
          label="Total Events Completed"
          value={analytics.totalEvents}
          gradient="from-[#f472b6] to-[#fb7185]"
          delay={0.1}
        />
        <AnimatedKPICard
          icon={Clock}
          label="Total Hours Volunteered"
          value={analytics.totalHours}
          gradient="from-[#fb7185] to-[#f9a8d4]"
          delay={0.2}
        />
        <AnimatedKPICard
          icon={Users}
          label="Total Volunteers Collaborated"
          value={analytics.totalVolunteers}
          gradient="from-[#f9a8d4] to-[#fbcfe8]"
          delay={0.3}
        />
        <AnimatedKPICard
          icon={ClipboardList}
          label="Total Applications"
          value={analytics.applicationStats.total}
          gradient="from-[#fbcfe8] to-[#fdf2f8]"
          delay={0.4}
        />
        <AnimatedKPICard
          icon={Heart}
          label="Total Impact"
          value={analytics.totalImpact}
          gradient="from-[#ec4899] to-[#f472b6]"
          delay={0.5}
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Projects by Category - Bar Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-[#f3e8ff] p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart className="w-5 h-5 text-[#ec4899]" />
            <h2 className="text-xl font-bold text-[#1f2937]">Projects by Category</h2>
          </div>

          {analytics.categoryData.length === 0 ? (
            <p className="text-center text-[#6b7280] py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #f3e8ff",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Most Popular Skill Categories - Donut Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-[#f3e8ff] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-[#ec4899]" />
            <h2 className="text-xl font-bold text-[#1f2937]">Most Popular Skill Categories</h2>
          </div>

          {analytics.skillData.length === 0 ? (
            <p className="text-center text-[#6b7280] py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.skillData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {analytics.skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #f3e8ff",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </motion.div>

      {/* Volunteering Hours by Month - Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-md border border-[#f3e8ff] p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#ec4899]" />
          <h2 className="text-xl font-bold text-[#1f2937]">Volunteering Hours by Month</h2>
        </div>

        {analytics.hoursData.length === 0 ? (
          <p className="text-center text-[#6b7280] py-12">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.hoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #f3e8ff",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: "#ec4899", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {applicationBreakdown.map((item, index) => (
          <StatusStatCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            percentage={item.percentage}
            iconColor={item.iconColor}
            delay={0.6 + index * 0.1}
          />
        ))}
      </motion.div>

      {analytics.totalProjects > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-[#ec4899] via-[#f472b6] to-[#fb7185] rounded-xl p-8 text-white text-center shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Your Impact Summary</h2>
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm opacity-90 mb-6">Making a difference, one project at a time</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-4xl font-bold mb-1">{analytics.totalProjects}</p>
              <p className="text-sm opacity-90">Projects Created</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-4xl font-bold mb-1">{analytics.totalVolunteers}</p>
              <p className="text-sm opacity-90">Volunteers Engaged</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-4xl font-bold mb-1">{analytics.totalHours}+</p>
              <p className="text-sm opacity-90">Hours Contributed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-4xl font-bold mb-1">{analytics.totalImpact}+</p>
              <p className="text-sm opacity-90">Lives Impacted</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StatusStatCard({
  icon: Icon,
  label,
  value,
  percentage,
  iconColor,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: number
  percentage: number
  iconColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-md border border-[#f3e8ff] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
          <h3 className="text-sm font-semibold text-[#1f2937]">{label}</h3>
        </div>
        <span className="text-sm font-medium text-[#6b7280]">{percentage}%</span>
      </div>
      <p className="text-3xl font-bold text-[#1f2937]">{value}</p>
      <p className="text-xs text-[#9ca3af] mt-1">of total applications</p>
    </motion.div>
  )
}

function AnimatedKPICard({
  icon: Icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: number
  gradient: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-md border border-[#f3e8ff] p-6 cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-4`}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
        className="text-3xl font-bold text-[#1f2937] mb-1"
      >
        {value}
      </motion.p>
      <p className="text-sm text-[#6b7280]">{label}</p>
    </motion.div>
  )
}
