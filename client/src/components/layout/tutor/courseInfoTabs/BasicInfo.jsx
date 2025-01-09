import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import axiosInstance from "@/config/axiosConfig";

function BasicInfo({ initialData, sendData }) {
  // Use initialData to set initial state values
  const [title, setTitle] = useState(initialData?.title || "");
  const [topic, setTopic] = useState(initialData?.topic || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [durationUnit, setDurationUnit] = useState(
    initialData?.durationUnit || "Days"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.category || "default"
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    initialData?.language || "default"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    initialData?.difficulty || "default"
  );

  const [categories, setCategories] = useState([]);

  // Create formData object
  const formData = {
    title,
    topic,
    duration,
    durationUnit,
    category: selectedCategory,
    language: selectedLanguage,
    difficulty: selectedDifficulty,
  };

  // Send data to parent whenever any field changes
  useEffect(() => {
    sendData(formData);
  }, [
    title,
    topic,
    duration,
    durationUnit,
    selectedCategory,
    selectedLanguage,
    selectedDifficulty,
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:3000/admin/categories"
      );
      setCategories(response.data);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(
          error.response.data.message || "Failed to fetch category data"
        );
      }
    }
  };

  // Handlers for select changes
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <>
      <div>
        <label className="block mb-2 font-medium">Title</label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your course title"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            maxLength={50}
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {title.length}/50
          </span>
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Course Category</label>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-3 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="default">Select...</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div>
        <label className="block mb-2 font-medium">Course Topic</label>
        <div className="relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What this course is based on"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            maxLength={100}
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {topic.length}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 font-medium">Course Language</label>
          <div className="relative">
            <select
              id="language"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full p-3 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="default">Select...</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Malayalam">Malayalam</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Course Level</label>
          <div className="relative">
            <select
              id="level"
              value={selectedDifficulty}
              onChange={handleDifficultyChange}
              className="w-full p-3 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="default">Select...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Duration</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Course duration"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <div className="relative w-24">
              <select
                id="timeUnit"
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                className="w-full p-3 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Days">Days</option>
                <option value="Hours">Hours</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BasicInfo;
