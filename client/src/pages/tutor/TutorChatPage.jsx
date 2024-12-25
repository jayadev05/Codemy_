import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreHorizontal, Search, Bell, Check, CheckCheck, AlertTriangle, Trash2Icon } from "lucide-react";
import { socketService } from "@/services/socket";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/userSlice";
import axiosInstance from "@/config/axiosConfig";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/layout/tutor/sidebar";
import { selectTutor } from "@/store/slices/tutorSlice";
import TypingIndicator from "@/components/utils/TypingIndicator";
import toast from "react-hot-toast";
import { handleChatDeletion } from "@/utils/ChatUtils";
import { updateChatsList } from "@/utils/ChatUtils";
import ComposeModalUser from "@/components/layout/tutor/chat/StudentList";

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
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);


  const messagesEndRef = useRef(null);

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
        `/chat/get-all-chats/${tutor._id}`
      );

      const filteredChat = response.data.filter((chat) => {
        if (chat.deletedBy.length > 0) {
          return !chat.deletedBy.includes(tutor._id);
        }
        return true;
      });

      setChats(filteredChat);

      if (selectedChat) {
        const chatStillExists = filteredChat.find(
          (chat) => chat._id === selectedChat._id
        );
        if (!chatStillExists) {
          setSelectedChat(null);
        } else {
          const updatedSelectedChat = filteredChat.find(
            (chat) => chat._id === selectedChat._id
          );
          setSelectedChat(updatedSelectedChat);
        }
      }
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

      const handleStatusUpdate = async () => {
        await fetchChats();  
      };
      

      const handleRecieveMessage = (message) => {

        console.log("recieved message");

        updateChatLastMessage(message);
      
        // Update messages if we're in the relevant chat
        if (selectedChat?._id === message.chatId) {
          setMessages((prevMessages) => {
            // Avoid duplicate messages
            if (prevMessages.some((m) => m._id === message._id)) {
              return prevMessages;
            }
            return [...prevMessages, message];
          });
          socketService.markMessagesRead({
            chatId:selectedChat._id,
            userType,
            userId: tutor._id,
          });
        } else {
          // If message is for a different chat, update the unread count
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat._id === message.chatId) {
                return {
                  ...chat,
                  unreadCount: {
                    ...chat.unreadCount,
                    [userType === "user" ? "student" : "tutor"]: 
                      (chat.unreadCount?.[userType === "user" ? "student" : "tutor"] || 0) + 1
                  }
                };
              }
              return chat;
            })
          );
        }
      };

      const handleTyping = ({ senderId }) => {
       
        console.log('Typing event received from:', senderId);
       
        
          setIsTyping(true);
        
      };

      const handleStopTyping = ({ senderId }) => {
        console.log('Stop typing event received from:', senderId);
        
          setIsTyping(false);
        
      };

      const handleMessageDelivered =({ messageId }) => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === messageId
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }
      
      const handleMessageRead = (data) => {
        if (!data) {
          console.error('handleMessageRead received undefined data');
          return;
        }
      
        const { chatId, userType, unreadCount, messageIds = [] } = data;
        console.log('message-read event received:', { chatId, userType, unreadCount, messageIds });
      
        // Update unread count in chats
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  unreadCount,
                }
              : chat
          )
        );
      
        // Update the status of all read messages
        if (messageIds.length > 0) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              messageIds.includes(msg._id) ? { ...msg, status: 'read' } : msg
            )
          );
        }
      };
      
      

      socketService.on("user-status-update", handleStatusUpdate);
      socketService.on("receive-message", handleRecieveMessage);
      socketService.on('message-delivered',handleMessageDelivered);
      socketService.on('message-read', handleMessageRead);
      socketService.on("typing", handleTyping);
      socketService.on("stop-typing", handleStopTyping);

      return () => {

 socketService.off("user-status-update", handleStatusUpdate);
        socketService.off("receive-message", handleRecieveMessage);
        socketService.off('message-delivered',handleMessageDelivered);
        socketService.off('message-read', handleMessageRead);
        socketService.off("typing", handleTyping);
        socketService.off("stop-typing", handleStopTyping)

        if (typingTimeout) clearTimeout(typingTimeout);;
        
        socketService.disconnect();
      };
    };

    initializeChat();
  }, [tutor?._id, localStorage.getItem("accessToken"),selectedChat?._id]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
    }

    if (selectedChat) {
      socketService.markMessagesRead({
        chatId:selectedChat._id,
        userType,
        userId: tutor._id,
      });
    }
      
  }, [selectedChat,socketService]);

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
      await axiosInstance.put(`/chat/messages-read`, {
        chatId,
        userType
      });

      socketService.markMessagesRead({
        chatId,
        userType,
        userId: tutor._id 
      });

      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat._id === chatId) {
            return {
              ...chat,
              unreadCount: {
                ...chat.unreadCount,
                [userType === 'user' ? 'student' : 'tutor']: 0
              }
            };
          }
          return chat;
        })
      );

      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    try {
      // Fetch messages before updating selectedChat
      const response = await axiosInstance.get(`/chat/get-messages/${chat._id}`);
      
      // Update messages first
      setMessages(response.data);
      
      // Then update selectedChat
      setSelectedChat(chat);
  
      // Mark messages as read
      const hasUnreadMessages = chat.unreadCount?.[userType === "user" ? "student" : "tutor"] > 0;
      if (hasUnreadMessages) {
        await markMessagesAsRead(chat._id, userType);
      }
    } catch (error) {
      console.error("Error in chat selection:", error);
    }
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
        _id: response.data._id,
        timestamps:response.data.createdAt,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    
  };

  // Handle typing events
  const handleTyping = () => {
    if (selectedChat) {
      const receiverId = userType === "user" 
        ? selectedChat.tutorId._id 
        : selectedChat.userId._id;

      socketService.sendTyping({
        chatId: selectedChat._id,
        senderId: tutor._id, 
        receiverId: receiverId
      });

      // Clear existing timeout
      if (typingTimeout) clearTimeout(typingTimeout);

      // Set new timeout to stop typing
      const timeout = setTimeout(() => {
        socketService.sendStopTyping({
          chatId: selectedChat._id,
          senderId: tutor._id, 
          receiverId: receiverId
        });
      }, 1000); 

      setTypingTimeout(timeout);
    }
  };

   //deleting chat
   const handleDeleteChat = async () => {
    await handleChatDeletion(selectedChat._id, tutor._id, axiosInstance, {
      onSuccess: () => {
        setSelectedChat(null);
        setChats(prevChats => updateChatsList(prevChats, selectedChat._id));
        setOptionsModalOpen(false);
      },
      onError: () => toast.error("Failed to delete chat")
    });
  };

  const handleOptionsModalOpen = () => {
    setOptionsModalOpen(!optionsModalOpen);
  };

  const MessageStatus = ({ status }) => {
    if (!status || status === 'sent') {
      return <Check className="h-4 w-4 text-gray-400" />;
    } else if (status === 'delivered') {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    } else if (status === 'read') {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    }
    return null;
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
        <div className="flex h-[calc(100vh-90px)] bg-white">
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
                              {otherUser?.profileImg ? (
                                <AvatarImage
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  src={otherUser?.profileImg}
                                  alt={`${
                                    otherUser?.fullName || "User"
                                  }'s avatar`}
                                  onError={(e) => {
                                    e.target.src = "/placeholder.svg"; // Fallback image
                                  }}
                                />
                              ) : (
                                <AvatarFallback>
                                  {(otherUser?.fullName || "?").charAt(0)}
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
                                {otherUser?.fullName || "Unknown User"}
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
                              ? selectedChat.tutorId?.profileImg
                              : selectedChat.userId?.profileImg
                          }
                          alt="Chat partner's avatar"
                        />
                        <AvatarFallback>
                          {userType === "user"
                            ? selectedChat.tutorId?.fullName?.charAt(0)
                            : selectedChat.userId?.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm">
                        {userType === "user"
                          ? selectedChat.tutorId?.fullName
                          : selectedChat.userId?.fullName}
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
                          ? "Online"
                          : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                  <Button
                    onClick={() => handleOptionsModalOpen()}
                    variant="ghost"
                    size="icon"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                  {optionsModalOpen && (
                    <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 w-full transition-colors">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                        Block Tutor
                      </button>
                      <button
                        onClick={handleDeleteChat}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 w-full transition-colors"
                      >
                        <Trash2Icon className="w-4 h-4 mr-2 text-orange-500" />
                        Delete chat
                      </button>
                    </div>
                  )}
                </div>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                   {messages.map((message) => (
  <div
    key={message._id}
    className={`flex gap-2 max-w-[85%] ${
      message.sender.userId === tutor._id ? "justify-end ml-auto" : ""
    }`}
  >
    {message.sender.userId !== tutor._id && (
      <Avatar className="h-6 w-6 mt-1">
        <img
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
          src={
            userType === "user"
              ? selectedChat.tutorId?.profileImg
              : selectedChat.userId?.profileImg
          }
          alt="Sender's avatar"
        />
        <AvatarFallback>
          {userType === "tutor"
            ? selectedChat.tutorId?.fullName?.charAt(0)
            : selectedChat.userId?.fullName?.charAt(0)}
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
      <div className="flex mt-1">
                      
                        {message.sender.userId === tutor._id && (
                    <MessageStatus status={message.status} />
                  )}
                    <span className="text-xs text-gray-500 ml-2">
                          {formatTime(message.createdAt || message.timestamps)}
                        </span>
                        </div>
    </div>
    {message.sender.userId === tutor._id && (
      <Avatar className="h-6 w-6 mt-1">
        <AvatarImage src={tutor?.profileImg} alt="Your avatar" />
        <AvatarFallback>{tutor?.fullName.charAt(0)}</AvatarFallback>
      </Avatar>
    )}
  </div>
))}
{isTyping && <TypingIndicator />}


                    
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

        <ComposeModalUser
          open={composeOpen}
          onOpenChange={setComposeOpen}
          onChatCreated={handleCreateChat}
          recipients={students}
          tutor={tutor}
        />
      </div>
    </div>
  );
}
