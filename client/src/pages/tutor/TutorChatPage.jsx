import Sidebar from "@/components/layout/tutor/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreHorizontal, Bell, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectTutor } from "../../store/slices/tutorSlice";
import defProfile from "../../assets/user-profile.png";

const conversations = [
  {
    id: 1,
    name: "Jane Cooper",
    message: "Yeah sure, hit me later",
    time: "just now",
    avatar: "/placeholder.svg",
    active: true,
  },
  {
    id: 2,
    name: "Jenny Wilson",
    message: "Thank you so much! 💕",
    time: "2 m",
    avatar: "/placeholder.svg",
    active: false,
  },
  {
    id: 3,
    name: "Marvin McKinney",
    message: "You're Welcome!",
    time: "1 m",
    avatar: "/placeholder.svg",
    active: true,
  },
  {
    id: 4,
    name: "Eleanor Pena",
    message: "Thank you so much! 💕",
    time: "1 m",
    avatar: "/placeholder.svg",
    active: false,
  },
  {
    id: 5,
    name: "Ronald Richards",
    message: "Sorry, I can't help you",
    time: "2 m",
    avatar: "/placeholder.svg",
    active: true,
  },
  {
    id: 6,
    name: "Kathryn Murphy",
    message: "Your message",
    time: "2 m",
    avatar: "/placeholder.svg",
    active: false,
  },
  {
    id: 7,
    name: "Jacob Jones",
    message: "Thank you so much! 💕",
    time: "5 m",
    avatar: "/placeholder.svg",
    active: true,
  },
];

export default function TutorChatPage() {
  const tutor = useSelector(selectTutor);

  const navigate = useNavigate();

  return (
    <>
      <div className="flex h-[78vh] bg-white">
        <Sidebar activeSection={"Message"} />

        <div className="flex flex-col flex-1">

         <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
                  <div>
                    <h1 className="text-xl font-semibold">Messages</h1>
                    <p className="text-sm text-gray-500">Good Morning</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300" placeholder="Search" />
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <Bell className="h-5 w-5" />
                    </button>
                    <img  referrerPolicy="no-referrer" crossOrigin="anonymous" src={tutor.profileImg || defProfile} className="w-12 h-12 rounded-full" alt="" />
        
                   
                   
                   
                  </div>
                </header>

          <div className="flex flex-1">
            {/*Chat Sidebar */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold">Chat</h1>
                  <Button
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                    size="sm"
                  >
                    + Compose
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    className="pl-8 bg-gray-50"
                    placeholder="Search"
                    type="search"
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        conversation.id === 1 ? "bg-orange-50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={conversation.avatar}
                              alt={`${conversation.name}'s avatar`}
                            />
                            <AvatarFallback>
                              {conversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              conversation.active
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                            aria-label={
                              conversation.active ? "Online" : "Offline"
                            }
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold truncate">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg"
                        alt="Jane Cooper's avatar"
                      />
                      <AvatarFallback>JC</AvatarFallback>
                    </Avatar>
                    <span
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"
                      aria-label="Online"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold">Jane Cooper</h2>
                    <p className="text-sm text-green-600">Active Now</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="flex gap-3 max-w-xl">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage
                        src="/placeholder.svg"
                        alt="Teacher's avatar"
                      />
                      <AvatarFallback>T</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="bg-gray-100 rounded-2xl p-3">
                        <p>
                          Hello and thanks for signing up to the course. If you
                          have any questions about the course or Adobe XD, feel
                          free to get in touch and I'll be happy to help 😊
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Today</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="flex gap-3 max-w-xl">
                      <div>
                        <div className="bg-[#ff6738] text-white rounded-2xl p-3">
                          <p>
                            I only have a small doubt about your lecture, can
                            you give me some time for tomorrow?
                          </p>
                        </div>
                        <div className="bg-[#ff6738] text-white rounded-2xl p-3 mt-2">
                          <p>Yeah sure, hit me later</p>
                        </div>
                      </div>
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage
                          src="/placeholder.svg"
                          alt="Jane Cooper's avatar"
                        />
                        <AvatarFallback>JC</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input className="flex-1" placeholder="Type your message" />
                  <Button className="bg-[#ff4f38] hover:bg-[#e63f2a]">
                    <span>Send</span>
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
