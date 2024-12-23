import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import MainHeader from "@/components/layout/user/MainHeader";
import Tabs from "@/components/layout/user/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreHorizontal, Search, Bell } from "lucide-react";
import { socketService } from "@/services/socket";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/userSlice";
import axiosInstance from "@/config/axiosConfig";
import ComposeModal from "@/components/layout/user/chat/TutorListModal";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/layout/tutor/sidebar";
import { selectTutor } from "@/store/slices/tutorSlice";

export default function TutorChatPage() {
  const tutor = useSelector(selectTutor);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [students, setStudents] = useState([]);

  const messagesEndRef = useRef(null);

  const userType = getUserRoleFromToken();

  console.log(messages);

  //get userType form token
  function getUserRoleFromToken() {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.type;
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
    return null;
  }

  // Fetch all chats for the current user
  const fetchChats = async () => {
    try {
      const response = await axiosInstance.get(
        `/chat/get-all-chats/${tutor._id}`
      );
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    try {
      const response = await axiosInstance.get(`/chat/get-messages/${chatId}`);
      console.log(response);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch tutors when modal opens
  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/chat/get-students/${tutor._id}`
      );

      setStudents(response.data.students);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);
  // Scroll to bottom when messages update or typing status changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleCreateChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
    fetchMessages(newChat._id);
  };

  // Initialize chat data and socket connection
  useEffect(() => {
    const initializeChat = async () => {
      if (!tutor?._id) return;

      setLoading(true);
      await fetchChats();
      setLoading(false);

      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) return;

      // Socket connection
      socketService.connect(token, refreshToken);

      // Socket event listeners
      const handleMessage = (message) => {
        console.log('Received message:', message);
        
        // Only add the message if it's not already in the messages array
        if (message.chatId === selectedChat?._id) {
          setMessages((prevMessages) => {
            if (prevMessages.some((m) => m._id === message._id)) return prevMessages;
            return [...prevMessages, message];
          });
        }
        updateChatLastMessage(message);
      };

      const handleTyping = ({ senderId }) => {
        if (
          selectedChat?.userId === senderId ||
          selectedChat?.tutorId === senderId
        ) {
          setIsTyping(true);
        }
      };

      const handleStopTyping = () => {
        setIsTyping(false);
      };

      socketService.on("receive-message", handleMessage);
      socketService.on("typing", handleTyping);
      socketService.on("stop-typing", handleStopTyping);
      return () => {
        socketService.off("receive-message", handleMessage);
        socketService.off("typing", handleTyping);
        socketService.off("stop-typing", handleStopTyping);
        socketService.disconnect();
      };
    };

    initializeChat();
  }, [tutor?._id, localStorage.getItem("accessToken")]);

  // Update chat's last message
  const updateChatLastMessage = (message) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === message.chatId
          ? {
              ...chat,
              lastMessage: {
                content: message.content,
                senderId: message.sender.userId,
                timestamp: message.createdAt,
              },
            }
          : chat
      )
    );
  };

  const markMessagesAsRead = async (chatId, userType) => {
    try {
      await axiosInstance.put(`/chat/messages-read/${chatId}`, {
        userType
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat._id);

    // Mark messages as read
    await markMessagesAsRead(chat._id,userType);

  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat) return;
  
    try {
      const messageData = {
        chatId: selectedChat._id,
        sender: { userId: tutor._id, role: userType },
        receiver: {
          userId: userType === "user" ? selectedChat.tutorId._id : selectedChat.userId._id,
          role: userType === "user" ? "tutor" : "user",
        },
        content: inputMessage,
      };
    
      const response = await axiosInstance.post("/chat/create-message", messageData);
    
      // Optimistically update UI
      setMessages((prevMessages) => [...prevMessages, response.data]);
    
      setInputMessage("");
      updateChatLastMessage(response.data);
    
      // Emit socket event
      socketService.sendMessage({
        ...messageData,
        messageId: response.data._id,
        timestamps: response.data.createdAt,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    
  };
  // Handle typing events
  const handleTyping = () => {
    if (selectedChat) {
      socketService.sendTyping({
        chatId: selectedChat._id,
        senderId: tutor._id,
      });
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex">
      <Sidebar activeSection="Messages" />

      <div className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white p-4">
          <div>
            <h1 className="text-lg lg:text-xl font-semibold">Messages</h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Good Morning
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="w-48 lg:w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300"
                placeholder="Search"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <img
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              src={tutor?.profileImg || defProfile}
              className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
              alt=""
            />
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex h-[calc(100vh-73px)] bg-white">
          {/* Chat List */}
          <div
            className={`${
              selectedChat ? "hidden" : "w-full"
            } md:block md:w-80 border-r flex flex-col`}
          >
            <div className="p-3 lg:p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-semibold">Chat</h1>
                <Button
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm"
                  size="sm"
                  onClick={() => setComposeOpen(true)}
                >
                  + Compose
                </Button>
              </div>
              <div className="relative">
                <Input
                  className="pl-8 bg-gray-50 text-sm"
                  placeholder="Search"
                  type="search"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y">
                {chats
                  .filter((chat) => {
                    // Filter out undefined/null chats and ensure required properties exist
                    return (
                      chat &&
                      chat._id &&
                      ((userType === "user" && chat.tutorId) ||
                        (userType === "tutor" && chat.userId))
                    );
                  })
                  .map((chat) => {
                    const otherUser =
                      userType === "user" ? chat.tutorId : chat.userId;

                    // Additional validation to ensure otherUser exists
                    if (!otherUser) {
                      return null;
                    }

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
                              {otherUser.profileImg ? (
                                <AvatarImage
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  src={otherUser.profileImg}
                                  alt={`${
                                    otherUser.fullName || "User"
                                  }'s avatar`}
                                  onError={(e) => {
                                    e.target.src = "/placeholder.svg"; // Fallback image
                                  }}
                                />
                              ) : (
                                <AvatarFallback>
                                  {(otherUser.fullName || "?").charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                chat.isOnline?.[
                                  userType === "user" ? "tutor" : "student"
                                ]
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">
                                {otherUser.fullName || "Unknown User"}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {chat.lastMessage?.timestamp &&
                                  formatTime(chat.lastMessage.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage?.content ||
                                  "Start a conversation"}
                              </p>
                              {chat.unreadCount?.[
                                userType === "user" ? "student" : "tutor"
                              ] > 0 && (
                                <p className="text-xs bg-orange-400 px-[9px] py-[3px] rounded-full text-white">
                                  {
                                    chat.unreadCount[
                                      userType === "user" ? "student" : "tutor"
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              !selectedChat ? "hidden" : "flex flex-col w-full"
            } md:flex md:flex-1`}
          >
            {selectedChat ? (
              <>
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <button
                      className="md:hidden"
                      onClick={() => setSelectedChat(null)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <img
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          src={
                            userType === "user"
                              ? selectedChat.tutorId.profileImg
                              : selectedChat.userId.profileImg
                          }
                          alt="Chat partner's avatar"
                        />
                        <AvatarFallback>
                          {userType === "user"
                            ? selectedChat.tutorId.fullName?.charAt(0)
                            : selectedChat.userId.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                          selectedChat.isOnline[
                            userType === "user" ? "tutor" : "student"
                          ]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm">
                        {userType === "user"
                          ? selectedChat.tutorId.fullName
                          : selectedChat.userId.fullName}
                      </h2>
                      <p
                        className={`text-xs ${
                          selectedChat.isOnline[
                            userType === "user" ? "tutor" : "student"
                          ]
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {selectedChat.isOnline[
                          userType === "user" ? "tutor" : "student"
                        ]
                          ? "Active Now"
                          : "Offline"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex gap-2 max-w-[85%] ${
                          message.sender.userId === tutor._id
                            ? "justify-end ml-auto"
                            : ""
                        }`}
                      >
                        {message.sender.userId !== tutor._id && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarImage
                              src={
                                userType === "user"
                                  ? selectedChat.tutorId.profileImg
                                  : selectedChat.userId.profileImg
                              }
                              alt="Sender's avatar"
                            />
                            <AvatarFallback>
                              {userType === "tutor"
                                ? selectedChat.tutorId.fullName?.charAt(0)
                                : selectedChat.userId.fullName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div
                            className={`rounded-2xl p-2 text-sm ${
                              message.sender.userId === tutor._id
                                ? "bg-[#ff6738] text-white"
                                : "bg-[#ffeee8]"
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        {message.sender.userId === tutor._id && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarImage
                              src={tutor.profileImg}
                              alt="Your avatar"
                            />
                            <AvatarFallback>
                              {tutor.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="text-xs text-gray-500">Typing...</div>
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>
                </ScrollArea>

                <div className="p-3 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      className="flex-1 text-sm"
                      placeholder="Type your message"
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        handleTyping();
                      }}
                    />
                    <Button
                      type="submit"
                      className="bg-[#ff4f38] hover:bg-[#e63f2a]"
                    >
                      <span className="hidden sm:inline">Send</span>
                      <Send className="h-4 w-4 sm:ml-2" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 text-sm">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>

        <ComposeModal
          open={composeOpen}
          onOpenChange={setComposeOpen}
          onChatCreated={handleCreateChat}
          recipients={students}
          user={tutor}
        />
      </div>
    </div>
  );
}
