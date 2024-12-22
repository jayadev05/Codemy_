const Chat = require("../model/chatModel");
const Message = require("../model/messageModel");
const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Course = require('../model/courseModel')

const getChatsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const  userType  = req.user?.type;

    console.log("userType:", req.user?.type);

    const isUser = userType === "user";
    const populateField = isUser ? "tutorId" : "userId";
    const populateModel = isUser ? "Tutor" : "User";

    const chats = await Chat.find({
      $or: [{ userId:userId }, { tutorId: userId }],
    })
      .populate({
        path: populateField,
        model: populateModel,
        select: 'fullName profileImg userId'
      })
      .select('userId tutorId lastMessage isOnline unreadCount');

    res.status(200).json(chats);
    console.log(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: error.message });
  }
};

const getTutorsByUserId = async (req, res) => {
  try {
    const { courseIds } = req.query;

    console.log('courseIds',courseIds);

    if (!courseIds) {
      return res.status(400).json({ message: "CourseIds are missing" });
    }

    // Find courses by IDs
    const courses = await Course.find({ _id: { $in: courseIds } });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found for the given IDs" });
    }

    // Populate tutors for each course
    const tutors = await Promise.all(
      courses.map(async (course) => {
        await course.populate('tutorId', 'fullName profileImg');
        return course.tutorId; // Return the populated tutor
      })
    );

    res.status(200).json({
      message: "Tutors list fetched successfully",
      tutors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get tutor list" });
  }
};

const getStudentsByUserId = async (req, res) => {
  try {
    const { tutorId } = req.params;
  

    if (!tutorId) {
      return res.status(400).json({ message: "TutorId is missing" });
    }

    
    const courses = await Course.find({ tutorId }).select('_id');

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found for the given tutor" });
    }

    // Extract course IDs into an array
    const courseIds = courses.map(course => course._id);

    
    const students = await User.find({ activeCourses: { $in: courseIds } });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found for the given tutor's courses" });
    }

   
    res.status(200).json({
      message: "Students list fetched successfully",
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get students list" });
  }
};

const createChat = async (req, res) => {
  try {

    const { userId, tutorId } = req.body;
    const  userType  = req.user?.type;

    const isUser = userType === "user";
    const populateField = isUser ? "tutorId" : "userId";
    const populateModel = isUser ? "Tutor" : "User";

    let chat = await Chat.findOne({ userId, tutorId });

    if (!chat) {
      chat = await Chat.create({ 
        userId, 
        tutorId,
        isOnline: {
          student: false,
          tutor: false
        },
        unreadCount: {
          student: 0,
          tutor: 0
        },
        lastMessage: {
          content: '',
          senderId: null,
          timestamp: new Date()
        }
      });
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: populateField,
        model: populateModel,
        select: 'fullName profileImg userId'
      })
      .select('userId tutorId lastMessage isOnline unreadCount');

    res.status(200).json(populatedChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMessagesByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      // .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMessage = async (req, res) => {
  try {
    const { chatId, sender, receiver, content } = req.body;

    console.log(req.body);

    const newMessage = await Message.create({
      chatId,
      sender,
      receiver,
      content,
      isRead: false
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        content,
        senderId: sender.userId,
        timestamp: new Date()
      },
      $inc: {
        [`unreadCount.${receiver.role === 'user' ? 'student' : 'tutor'}`]: 1
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { chatId, userType } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Reset unread count for the appropriate user type
    const updateField = userType === "user" ? "unreadCount.student" : "unreadCount.tutor";
    
    await Chat.findByIdAndUpdate(chatId, {
      [updateField]: 0
    });

    // Mark all unread messages as read
    await Message.updateMany(
      { 
        chatId,
        'receiver.role': userType,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Delete all messages in the chat
    await Message.deleteMany({ chatId });
    
    // Delete the chat
    const chat = await Chat.findByIdAndDelete(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ message: "Chat and messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOnlineStatus = async (req, res) => {
  try {
    const { chatId, userType, isOnline } = req.body;
    
    const updateField = `isOnline.${userType === 'user' ? 'student' : 'tutor'}`;
    
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { [updateField]: isOnline },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChatsByUserId,
  getMessagesByChatId,
  createChat,
  deleteChat,
  createMessage,
  markMessageAsRead,
  updateOnlineStatus,
  getTutorsByUserId,
  getStudentsByUserId
};