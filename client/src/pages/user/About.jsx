import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Award, Globe, Timer } from 'lucide-react'
import MainHeader from "@/components/layout/user/MainHeader"
import Header from "@/components/layout/Header"
import gallery from '../../assets/Gallery.png';
import anand2 from '../../assets/anand 2.webp';
import anand from '../../assets/anand.webp';
import nufail from '../../assets/nufail.jpeg';
import SecondaryFooter from "@/components/layout/user/SecondaryFooter"

const stats = [
  { number: "50k+", label: "Students", icon: <Users className="w-4 h-4" /> },
  { number: "200+", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
  { number: "15+", label: "Languages", icon: <Globe className="w-4 h-4" /> },
  { number: "98%", label: "Success rate", icon: <Award className="w-4 h-4" /> },
]

const instructors = [
  {
    name: "Anand Sreekumar",
    avatar:anand,
    role: "Python & Data Science Expert",
    courses: "12 courses",
    students: "15k+ students"
  },
  {
    name: "Nufail TB",
    avatar:nufail,
    role: "Web Development Lead",
    courses: "15 courses",
    students: "20k+ students"
  },
  {
    name: "Anand Junior",
    avatar:anand2,
    role: "Machine Learning",
    courses: "8 courses",
    students: "10k+ students"
  }
]

export default function AboutPage() {
  return (
    <div>

<Header/>
      <div className="min-h-screen ">
        <MainHeader />

        <div className="min-h-screen bg-white dark:bg-[#1d2026]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12  ">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Empowering Future Developers at <span className="text-orange-600">Codemy</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Join our community of learners and start your coding journey today. 
            We make learning to code accessible, engaging, and rewarding.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white/50 dark:bg-[var(--backgorund)]   backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2 text-orange-600">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white  mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              At Codemy, we believe everyone should have access to quality coding education. 
              Our platform combines expert instruction, hands-on practice, and a supportive 
              community to help you master programming skills and advance your career.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Timer className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Learn at Your Pace</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Access course content 24/7 and learn on your schedule</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Community Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect with fellow learners and get help when needed</p>
                </div>
              </div>
            </div>
          </div>
         
            <img src={gallery} alt="" className="max-w-2xl"  />
       
        </div>
      </section>

      {/* Instructors Section */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Meet Our Expert Instructors</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <Card key={instructor.name} className="border-none shadow-sm  dark:bg-slate-900 ">
              <CardContent className="p-6">
                <img src={instructor.avatar} className="w-28 h-28 object-cover bg-orange-100 rounded-full mb-4 mx-auto"></img>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-300">{instructor.name}</h3>
                  <p className="text-orange-600 text-sm mb-2">{instructor.role}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <p>{instructor.courses}</p>
                    <p>{instructor.students}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mb-16">
        <Card className="border-none bg-gradient-to-r from-orange-500 to-orange-600">
          <CardContent className="p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Coding Journey?</h2>
            <p className="mb-6 text-orange-50">
              Join thousands of students who are already learning and building with Codemy
            </p>
            <Button className="bg-white text-orange-600 hover:bg-orange-50">
              Get Started Today
            </Button>
          </CardContent>
        </Card>
      </section>
      <SecondaryFooter/>
    </div>

    </div>

    </div>

        )}
    
    
  


