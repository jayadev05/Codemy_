import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  ChevronDown,
  CirclePlay,
  ClipboardList,
  Layers,
  MonitorPlay,
  Search,
} from "lucide-react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { selectTutor } from "../../store/slices/tutorSlice";
import defProfile from "../../assets/user-profile.png";
import { toast } from "react-hot-toast";
import BasicInfo from "../../components/layout/tutor/courseInfoTabs/BasicInfo";
import AdvancedInfo from "../../components/layout/tutor/courseInfoTabs/AdvancedInfo";
import Curriculum from "../../components/layout/tutor/courseInfoTabs/Curriculum";
import CoursePreview from "../../components/layout/tutor/Preview";
import {
  addCourse,
  clearCourse,
  selectCourse,
} from "../../store/slices/courseSlice";
import { useNavigate } from "react-router";
import TutorHeader from "@/components/layout/tutor/TutorHeader";
import axiosInstance from "@/config/axiosConfig";

export default function AddCourse() {
  const tutor = useSelector(selectTutor);
  const existingCourse = useSelector(selectCourse);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const [courseData, setCourseData] = useState({
    basicInfo: existingCourse?.basicInfo || {
      title: "",
      category: "",
      topic: "",
      language: "",
      difficulty: "",
      duration: "",
      durationUnit: "Day",
    },
    advanceInfo: existingCourse?.advanceInfo || {
      price: "",
      description: "",
      thumbnail: "",
      courseContent: "",
    },
    curriculum: Array.isArray(existingCourse?.curriculum)
      ? existingCourse.curriculum
      : [],
  });

  const payload = {
    ...courseData.basicInfo,
    ...courseData.advanceInfo,
    lessons: courseData.curriculum,
    tutorId: tutor._id,
  };


  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Basic Information", icon: Layers },
    { name: "Advance Information", icon: ClipboardList },
    { name: "Curriculum", icon: MonitorPlay },
    { name: "Publish Course", icon: CirclePlay },
  ];

  // useEffect(() => {
  //   dispatch(addCourse(courseData));
  // }, [courseData, dispatch]);

  const updateCourseData = (section, newData) => {
    setCourseData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        ...newData,
      },
    }));
  };

  const handleBasicInfoData = (dataFromChild) => {
    updateCourseData("basicInfo", dataFromChild);
  };

  const handleAdvanceInfoData = (dataFromChild) => {
    updateCourseData("advanceInfo", dataFromChild);
  };

  const handleCurriculumData = useCallback((dataFromChild) => {
    // Ensure we're not updating if the data is the same
    const curriculumArray = Array.isArray(dataFromChild)
      ? dataFromChild
      : dataFromChild?.curriculum || [];

    setCourseData((prevData) => {
      const curriculumChanged =
        JSON.stringify(prevData.curriculum) !== JSON.stringify(curriculumArray);

      return curriculumChanged
        ? {
            ...prevData,
            curriculum: curriculumArray,
          }
        : prevData;
    });
  }, []);

  const handleTabChange = (index) => {
    if (isCurrentTabComplete()) {
      setActiveTab(index);
    } else {
      toast("Please fill all fields before moving to the next tab.", {
        icon: "✍️",
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
    }
  };

  const validateBasicInfo = () => {
    const { title, category, topic, language, difficulty, duration } =
      courseData.basicInfo;
    const newErrors = {};

    if (!title || title.trim().length < 8) {
      newErrors.title = "Title must be at least 8 characters long.";
    }

    if (!category) {
      newErrors.category = "Category is required.";
    }

    if (!topic || topic.trim().length < 8) {
      newErrors.topic = "Topic must be at least 8 characters long.";
    }

    if (!language) {
      newErrors.language = "Language is required.";
    }

    if (!difficulty) {
      newErrors.difficulty = "Difficulty level is required.";
    }

    if (!duration) {
      newErrors.duration = "Duration is required.";
    }

    return newErrors; // Return errors instead of setting state directly
  };

  const validateAdvanceInfo = () => {
    const { price, description, thumbnail, courseContent } =
      courseData.advanceInfo;
    const newErrors = {};

    if (!price) {
      newErrors.price = "Price is required.";
    }

    if (!description || description.trim().length < 8) {
      newErrors.description = "Description must be at least 8 characters long.";
    }

    if (!thumbnail) {
      newErrors.thumbnail = "Thumbnail is required.";
    }

    if (!courseContent || courseContent.trim().length < 10) {
      newErrors.courseContent =
        "Course content must be at least 10 characters long.";
    }

    return newErrors; // Return errors instead of setting state directly
  };

  const validateCurriculum = () => {
    const curriculumArray = Array.isArray(courseData.curriculum)
      ? courseData.curriculum
      : Object.values(courseData.curriculum || {});

    // Check if there are any lessons
    if (curriculumArray.length === 0) {
      return false;
    }

    // Validate each lesson
    const isValid = curriculumArray.every((lesson) => {
      return (
        // Validate lesson title
        lesson.lessonTitle &&
        lesson.lessonTitle.trim() !== "" &&
        lesson.lessonTitle.trim().toLowerCase() !== "lesson name" &&
        lesson.video &&
        lesson.description &&
        lesson.description.trim() !== ""
      );
    });

    

    return isValid;
  };

  const isCurrentTabComplete = () => {
    switch (activeTab) {
      case 0: {
        const basicInfoErrors = validateBasicInfo();

        return Object.keys(basicInfoErrors).length === 0;
      }
      case 1: {
        const advanceInfoErrors = validateAdvanceInfo();
        return Object.keys(advanceInfoErrors).length === 0;
      }
      case 2: {
        const curriculumErrors = validateCurriculum();
        return Object.keys(curriculumErrors).length === 0;
      }
      default:
        return true;
    }
  };

  const calculateProgressTab1 = () => {
    const fields = [
      courseData.basicInfo?.title,
      courseData.basicInfo?.category,
      courseData.basicInfo?.topic,
      courseData.basicInfo?.language,
      courseData.basicInfo?.difficulty,
      courseData.basicInfo?.duration,
    ];

    const filledFields = fields.filter(
      (field) => field && field !== "" && field !== "default"
    ).length;

    return filledFields;
  };

  const calculateProgressTab2 = () => {
    const fields = [
      courseData.advanceInfo?.price,
      courseData.advanceInfo?.description,
      courseData.advanceInfo?.thumbnail,
      courseData.advanceInfo?.courseContent,
    ];

    const filledFields = fields.filter(
      (field) => field && field !== "" && field !== "default"
    ).length;
    return filledFields;
  };

  const handleSaveAndNext = (e) => {
    e.preventDefault();

    if (!validateBasicInfo || !validateAdvanceInfo) return;

    if (isCurrentTabComplete()) {
      if (activeTab === 2) {
        dispatch(addCourse(payload));
      }

      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      } else {
        // This is now the final submission
        handleFinalSubmit();
      }
    } else {
      toast("Please fill all fields before proceeding.", {
        icon: "✍️",
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const response = await axiosInstance.post("/course/courses", payload);
      toast.success("Course created successfully!", {
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });

      dispatch(clearCourse(existingCourse));
      navigate("/tutor/myCourses");
    } catch (error) {
      console.error(error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to create course", {
          style: {
            borderRadius: "10px",
            background: "#111826",
            color: "#fff",
          },
        });
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <div className="sticky top-0 h-screen">
          <Sidebar activeSection={"New Course"} />
        </div>

        <main className="w-full bg-gray-100 pb-8">
          <TutorHeader heading="Create new Course" />

          <div className="bg-white max-w-[1100px] mx-auto px-8 py-2 mt-3  ">
            <nav className="flex gap-8 border-b">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(index)}
                  className={`flex items-center gap-2 px-4 py-4 ${
                    activeTab === index
                      ? "border-b-2 border-orange-500 text-orange-500 -mb-[2px]"
                      : "text-gray-500"
                  }`}
                >
                  <tab.icon />
                  {tab.name}
                  {index === 0 && (
                    <span
                      className={`text-xs ${
                        calculateProgressTab1() === 6
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {calculateProgressTab1()}/6
                    </span>
                  )}
                  {index === 1 && (
                    <span
                      className={`text-xs ${
                        calculateProgressTab2() === 4
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {calculateProgressTab2()}/4
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-8">
              <div className="flex justify-between mb-8">
                <h2 className="text-xl font-semibold">
                  {tabs[activeTab].name}
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSaveAndNext}>
                {activeTab === 0 && (
                  <BasicInfo
                    initialData={courseData.basicInfo}
                    errors={errors}
                    sendData={handleBasicInfoData}
                  />
                )}

                {activeTab === 1 && (
                  <AdvancedInfo
                    initialData={courseData.advanceInfo}
                    errors={errors}
                    sendData={handleAdvanceInfoData}
                  />
                )}

                {activeTab === 2 && (
                  <Curriculum
                    initialData={courseData.curriculum}
                    sendData={handleCurriculumData}
                  />
                )}

                {activeTab === 3 && <CoursePreview />}

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
                    onClick={() => activeTab > 0 && setActiveTab(activeTab - 1)}
                  >
                    {activeTab === 0 ? "Cancel" : "Previous"}
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-lg ${
                      isCurrentTabComplete()
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isCurrentTabComplete()}
                  >
                    {activeTab === tabs.length - 1 ? "Publish" : "Save & Next"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
