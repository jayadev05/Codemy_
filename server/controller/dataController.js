const Course = require("../model/courseModel");
const Cart = require("../model/cartModel");
const Lesson = require("../model/lessonModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");

const viewAllCourse = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("tutor")
      .populate("lessons")
      .populate("category");
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error in viewAllCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    console.log("courseId received:", courseId);

    const course = await Course.findById(courseId)
      .populate("tutor")
      .populate("lessons")
      .populate("category");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("Course data:", course);
    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in viewCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const toggleCourseVisibility = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    course.isVisible = !course.isVisible;
    await course.save();
    res.status(200).json({ message: "Course visibility updated", course });
  } catch (error) {
    res.status(500).json({
      message: "Error updating course visibility",
      error: error.message,
    });
  }
};

const addCart = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    console.log("dvidnvij", courseId);
    const { userId } = req.body;

    console.log("jvifjbijbibjububu", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    console.log("User ID:", userId, "Course ID:", courseId);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ courseId, price: course.price }],
        totalCartPrice: course.price,
      });
    } else {
      const itemIndex = cart.items.findIndex((item) =>
        item.courseId.equals(courseId)
      );
      if (itemIndex === -1) {
        cart.items.push({ courseId, price: course.price });
      } else {
        cart.items[itemIndex].price = course.price;
      }

      cart.totalCartPrice = cart.items.reduce(
        (total, item) => total + item.price,
        0
      );
    }

    await cart.save();
    res
      .status(200)
      .json({ message: "Course added to cart successfully!", cart });
  } catch (error) {
    console.error("Error in addCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cartCount = async (req, res) => {
  try {
    console.log("In cart count----------");
    const { userId } = req.params;
    console.log("User  ID received:", userId);

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log("Cart not found for user ID:", userId);
      return res.status(200).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const totalItems = cart.items.length;
    console.log("Total items in cart:", totalItems);

    res.status(200).json({ totalItems });
  } catch (error) {
    console.error("Error in cartCount:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCart = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("jvifjbijbibjububu", userId);

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.courseId",
      model: "courses",
      select: "coursetitle thumbnail price",
    });
    // console.log("carttt_______>", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error in viewCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeCart = async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    console.log("jvifjbijbibjububu", userId);

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.courseId.equals(courseId)
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Course not found in cart" });
    }

    cart.items.splice(itemIndex, 1);

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res
        .status(200)
        .json({ message: "Cart is empty and has been removed" });
    }

    cart.totalCartPrice = cart.items.reduce(
      (total, item) => total + item.price,
      0
    );

    await cart.save();

    res.status(200).json({ message: "Course removed from cart", cart });
  } catch (error) {
    console.error("Error in removeCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewAllCategory = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: "courses",
      model: "courses",
      select: "coursetitle price thumbnail",
    });

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error in viewAllCategory:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log("categoryId received:", categoryId);

    const category = await Category.findById(categoryId).populate({
      path: "courses",
      model: "courses",
      select: "coursetitle price thumbnail difficulty tutor",
      populate: {
        path: "tutor",
        model: "user",
        select: "name profileImage",
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    console.log("Courses with tutors fetched:", category.courses);
    res.status(200).json({ courses: category.courses });
  } catch (error) {
    console.error("Error in viewCategory:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewAllTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor" });

    if (!tutors || tutors.length === 0) {
      return res.status(404).json({ message: "No tutors found" });
    }

    res.status(200).json({ tutors });
  } catch (error) {
    console.error("Error in viewAllTutors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewTutor = async (req, res) => {
  try {
    const tutorId = req.params.id;

    const tutor = await User.findById(tutorId).select(
      "name profileImage email role"
    );
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const courses = await Course.find({ tutor: tutorId })
      .populate({
        path: "category",
        model: "categories",
        select: "title",
      })
      .select("coursetitle thumbnail price category");

    res.status(200).json({
      tutor,
      courses,
    });
  } catch (error) {
    console.error("Error in viewTutor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewLessons = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).populate({
      path: "lessons",
      model: "lessons",
      select: "lessontitle description Video pdfnotes duration",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ lessons: course.lessons });
  } catch (error) {
    console.error("Error in viewLessons:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewMyCoursesAsTutor = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user || user.role !== "tutor") {
      return res
        .status(403)
        .json({ message: "Access denied: Only tutors can view their courses" });
    }

    const courses = await Course.find({ tutor: userId })
      .populate({
        path: "category",
        model: "categories",
        select: "title",
      })
      .select("coursetitle price thumbnail category");

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this tutor" });
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error in viewMyCoursesAsTutor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  viewAllCourse,
  viewCourse,
  addCart,
  viewCart,
  removeCart,
  viewLessons,
  viewAllCategory,
  viewCategory,
  viewAllTutors,
  viewTutor,
  toggleCourseVisibility,
  viewMyCoursesAsTutor,
  cartCount,
};
