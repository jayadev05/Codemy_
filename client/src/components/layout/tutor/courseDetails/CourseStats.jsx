import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Star, Globe, TrendingUp, BarChart } from 'lucide-react'

export function CourseStats({ course }) {
  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "")
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : ""
  }

  const stats = [
    {
      label: "Lessons",
      value: course.lessons.length,
      icon: BookOpen,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "Total Ratings",
      value: course.ratings.length,
      icon: Star,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      label: "Students Enrolled",
      value: course.enrolleeCount,
      icon: Users,
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Course Language",
      value: course.language,
      icon: Globe,
      bgColor: "bg-gray-50",
      iconColor: "text-gray-500",
    },
    {
      label: "Total Revenue",
      value: `₹${formatCurrency(course.enrolleeCount * course.price.$numberDecimal)}`,
      icon: TrendingUp,
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Course Level",
      value: course.level,
      icon: BarChart,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`${stat.bgColor} border-none`}>
            <CardContent className="flex items-center gap-4 p-6">
              <Icon className={`h-8 w-8 ${stat.iconColor}`} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

