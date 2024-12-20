import { useEffect, useState } from "react"
import Header from "@/components/layout/Header"
import MainHeader from "@/components/layout/user/MainHeader"
import Tabs from "@/components/layout/user/Tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MoreHorizontal } from 'lucide-react'
import { socketService } from "@/services/socket"
import { useSelector } from "react-redux"
import { selectUser } from "@/store/slices/userSlice"
import axiosInstance from "@/config/axiosConfig"

export default function ChatInterface() {
  const user = useSelector(selectUser)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch all chats for the current user
  const fetchChats = async () => {
    try {
      const response = await axiosInstance.get(`/api/chats/${user._id}?userType=${user.role}`)
      setChats(response.data)
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    try {
      const response = await axiosInstance.get(`/api/messages/${chatId}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Initialize chat data and socket connection
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true)
      await fetchChats()
      setLoading(false)
    }

    if (user?._id) {
      initializeChat()
      
      // Socket connection
      const token = localStorage.getItem('accessToken')
      if (token) {
        socketService.connect(token)
        
        // Socket event listeners
        socketService.onReceiveMessage((message) => {
          setMessages(prev => [...prev, message])
          // Update last message in chat list
          updateChatLastMessage(message)
        })

        socketService.onTyping(({ senderId }) => {
          if (selectedChat?.userId === senderId || selectedChat?.tutorId === senderId) {
            setIsTyping(true)
          }
        })

        socketService.onStopTyping(() => {
          setIsTyping(false)
        })

        return () => {
          socketService.disconnect()
        }
      }
    }
  }, [user?._id])

  // Update chat's last message
  const updateChatLastMessage = (message) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat._id === message.chatId 
          ? {
              ...chat,
              lastMessage: {
                content: message.content,
                senderId: message.sender.userId,
                timestamp: message.createdAt
              }
            }
          : chat
      )
    )
  }

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat)
    await fetchMessages(chat._id)
    // Mark messages as read
    await axiosInstance.post('/api/messages/read', {
      chatId: chat._id,
      userType: user.role
    })
  }

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedChat) return

    try {
      const messageData = {
        chatId: selectedChat._id,
        sender: {
          userId: user._id,
          role: user.role
        },
        receiver: {
          userId: user.role === 'user' ? selectedChat.tutorId._id : selectedChat.userId._id,
          role: user.role === 'user' ? 'tutor' : 'user'
        },
        content: inputMessage
      }

      const response = await axiosInstance.post('/api/messages', messageData)
      setMessages(prev => [...prev, response.data])
      updateChatLastMessage(response.data)
      setInputMessage('')

      // Emit socket event
      socketService.sendMessage(messageData)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Handle typing events
  const handleTyping = () => {
    if (selectedChat) {
      socketService.sendTyping({
        chatId: selectedChat._id,
        senderId: user._id
      })
    }
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <>
      <Header />
      <MainHeader />
      <Tabs />
      <div className="flex h-[78vh] bg-white">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Messages</h1>
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
              {chats.map((chat) => {
                const otherUser = user.role === 'user' ? chat.tutorId : chat.userId
                return (
                  <div
                    key={chat._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedChat?._id === chat._id ? "bg-orange-50" : ""
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={otherUser.profileImg || "/placeholder.svg"} 
                            alt={`${otherUser.fullName}'s avatar`} 
                          />
                          <AvatarFallback>{otherUser.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                            chat.isOnline[user.role === 'user' ? 'tutor' : 'student']
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {otherUser.fullName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {chat.lastMessage?.timestamp && 
                              formatTime(chat.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.content || 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.role === 'user' 
                          ? selectedChat.tutorId.profileImg 
                          : selectedChat.userId.profileImg}
                        alt="Chat partner's avatar"
                      />
                      <AvatarFallback>
                        {user.role === 'user'
                          ? selectedChat.tutorId.fullName.charAt(0)
                          : selectedChat.userId.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        selectedChat.isOnline[user.role === 'user' ? 'tutor' : 'student']
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {user.role === 'user'
                        ? selectedChat.tutorId.fullName
                        : selectedChat.userId.fullName}
                    </h2>
                    <p className="text-sm text-green-600">
                      {selectedChat.isOnline[user.role === 'user' ? 'tutor' : 'student']
                        ? 'Active Now'
                        : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex gap-3 max-w-xl ${
                        message.sender.userId === user._id
                          ? 'justify-end ml-auto'
                          : ''
                      }`}
                    >
                      {message.sender.userId !== user._id && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage
                            src={user.role === 'user'
                              ? selectedChat.tutorId.profileImg
                              : selectedChat.userId.profileImg}
                            alt="Sender's avatar"
                          />
                          <AvatarFallback>
                            {user.role === 'user'
                              ? selectedChat.tutorId.fullName.charAt(0)
                              : selectedChat.userId.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl p-3 ${
                            message.sender.userId === user._id
                              ? 'bg-[#ff6738] text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      {message.sender.userId === user._id && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage
                            src={user.profileImg}
                            alt="Your avatar"
                          />
                          <AvatarFallback>
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="text-sm text-gray-500">
                      Typing...
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Type your message"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value)
                      handleTyping()
                    }}
                  />
                  <Button
                    type="submit"
                    className="bg-[#ff4f38] hover:bg-[#e63f2a]"
                  >
                    <span>Send</span>
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </>
  )
}