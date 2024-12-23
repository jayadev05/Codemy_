import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import MainHeader from "@/components/layout/user/MainHeader";
import Tabs from "@/components/layout/user/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreHorizontal } from "lucide-react";
import { socketService } from "@/services/socket";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/userSlice";
import axiosInstance from "@/config/axiosConfig";
import ComposeModal from "@/components/layout/user/chat/TutorListModal";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function ChatInterface() {
  const user = useSelector(selectUser);

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [tutors, setTutors] = useState([]);

  const messagesEndRef = useRef(null);

  const courseIds = user.activeCourses;

  console.log(messages);

  const userType = getUserRoleFromToken();

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
        `/chat/get-all-chats/${user._id}`
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
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch tutors when modal opens
  const fetchTutors = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/chat/get-tutors", {
        params: { courseIds },
      });

      console.log("response", response);

      setTutors(response.data.tutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
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
      if (!user?._id) return;

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
        console.log("Received message:", message);

        if (message.chatId === selectedChat?._id) {
          setMessages((prevMessages) => {
            if (prevMessages.some((m) => m._id === message._id))
              return prevMessages;
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
  }, [user?._id, localStorage.getItem("accessToken")]);

  socketService.on("error", (error) => {
    console.error("Socket error:", error);
    // Handle error appropriately (show toast, notification, etc.)
  });

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

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat._id);

    // // Mark messages as read
    // await axiosInstance.put("/chat/messages-read", {
    //   params:{
    //   chatId: chat._id,
    //   userType,
    // }

    // })
  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        chatId: selectedChat._id,
        sender: { userId: user._id, role: userType },
        receiver: {
          userId:
            userType === "user"
              ? selectedChat.tutorId._id
              : selectedChat.userId._id,
          role: userType === "user" ? "tutor" : "user",
        },
        content: inputMessage,
      };

      const response = await axiosInstance.post(
        "/chat/create-message",
        messageData
      );

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
        senderId: user._id,
        receiverId:
          userType === "user"
            ? selectedChat.tutorId._id
            : selectedChat.userId._id,
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
    <>
      <Header />
      <MainHeader />
      <Tabs />
      <div className="flex h-[78vh] bg-white">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Chat</h1>
              <Button
                className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                size="sm"
                onClick={() => setComposeOpen(true)}
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
                                alt={`${otherUser.fullName || "User"}'s avatar`}
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <img
                        crossOrigin="anonymus"
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
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        selectedChat.isOnline[
                          userType === "user" ? "tutor" : "student"
                        ]
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {userType === "user"
                        ? selectedChat.tutorId.fullName
                        : selectedChat.userId.fullName}
                    </h2>
                    <p
                      className={`text-sm ${
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

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex gap-3 max-w-xl ${
                        message.sender.userId === user._id
                          ? "justify-end ml-auto"
                          : ""
                      }`}
                    >
                      {message.sender.userId !== user._id && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage
                            src={
                              userType === "user"
                                ? selectedChat.tutorId.profileImg
                                : selectedChat.userId.profileImg
                            }
                            alt="Sender's avatar"
                          />
                          <AvatarFallback>
                            {userType === "user"
                              ? selectedChat.tutorId.fullName?.charAt(0)
                              : selectedChat.userId.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl p-3 ${
                            message.sender.userId === user._id
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
                    <div className="text-sm text-gray-500">Typing...</div>
                  )}
                  <div ref={messagesEndRef}></div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    className="flex-1"
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

        <ComposeModal
          open={composeOpen}
          onOpenChange={setComposeOpen}
          onChatCreated={handleCreateChat}
          recipients={tutors}
          user={user}
        />
      </div>
    </>
  );
}
