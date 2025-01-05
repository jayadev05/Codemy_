import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone, Clock, MessageSquare, Send } from 'lucide-react'
import Header from "@/components/layout/Header"
import MainHeader from "@/components/layout/user/MainHeader"
import SecondaryFooter from "@/components/layout/user/SecondaryFooter"

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email Us",
    details: "support@codemy.com",
    description: "We'll respond within 24 hours"
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Visit Us",
    details: "123 Coding Street, Tech Valley",
    description: "Mon-Fri, 9:00 AM - 6:00 PM"
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Call Us",
    details: "+1 (555) 123-4567",
    description: "Available during business hours"
  }
]

const faqItems = [
  {
    question: "How do I get started with Codemy?",
    answer: "Sign up for a free account and explore our course catalog. You can start with our beginner-friendly courses and progress at your own pace."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and offer various subscription plans to suit your needs."
  },
  {
    question: "Do you offer certificates?",
    answer: "Yes, upon completion of each course, you'll receive a verified certificate that you can share with employers."
  }
]

export default function ContactPage() {
  return (
    <>
  <Header/>
  <MainHeader/>
    <div className="min-h-screen bg-white dark:bg-[#1d2026]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch with <span className="text-orange-600">Codemy</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300  text-lg">
            Have questions? We'd love to hear from you. Send us a message
            and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {contactInfo.map((info) => (
            <Card key={info.title} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                    {info.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white  mb-2">{info.title}</h3>
                  <p className="text-orange-600 font-medium mb-1">{info.details}</p>
                  <p className="text-sm text-gray-600">{info.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm ">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white  mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white  mb-1 block">
                      First Name
                    </label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white  mb-1 block">
                      Last Name
                    </label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white  mb-1 block">
                    Email
                  </label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white  mb-1 block">
                    Subject
                  </label>
                  <Input placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white  mb-1 block">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us more about your inquiry..." 
                    className="min-h-[150px]"
                  />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white  mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <Card key={index} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white  mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 text-orange-600 mr-2" />
                        {item.question}
                      </h3>
                      <p className="text-sm text-gray-600">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border-none bg-gradient-to-r from-orange-500 to-orange-600">
              <CardContent className="p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Response</h3>
                    <p className="text-sm text-orange-100">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
                <p className="text-sm text-orange-50">
                  Our support team is here to help you with any questions or concerns
                  you may have about our courses or platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-4 mb-16">
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-[300px] bg-orange-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-orange-600" />
            {/* Replace this div with an actual map component */}
          </div>
        </Card>
      </section>
      <SecondaryFooter/>
    </div>
    </>
    
  )
}

