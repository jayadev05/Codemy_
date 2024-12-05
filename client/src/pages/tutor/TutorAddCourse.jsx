import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, CirclePlay, ClipboardList, Layers, MonitorPlay, Search } from 'lucide-react';
import Sidebar from "../../components/layout/tutor/Sidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectTutor } from "../../store/tutorSlice";
import defProfile from '../../assets/user-profile.png'
import { toast } from 'react-hot-toast';

export default function CourseCreation() {
  const tutor = useSelector(selectTutor);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('Days');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState([""]);
  const [thumbnail, setThumbnail] = useState(null);

  const [sections, setSections] = useState([
    { id: 1, name: "Section name", isExpanded: false },
    { id: 2, name: "Section name", isExpanded: false },
    { id: 3, name: "Section name", isExpanded: false },
  ]);


  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Basic Information", icon: Layers },
    { name: "Advance Information", icon: ClipboardList },
    { name: "Curriculum", icon: MonitorPlay },
    { name: "Publish Course", icon: CirclePlay },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admin/get-categories");
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addNewObjective = () => {
    if (objectives.length < 8) {
      setObjectives([...objectives, ""]);
    }
  };


  const calculateProgress = () => {
    const fields = [title, selectedCategory, topic, selectedLanguage, selectedDifficulty, duration];
    const filledFields = fields.filter(field => field !== '').length;
    return Math.round((filledFields / fields.length) * 6);
  };

  const handleTabChange = (index) => {
    if (isCurrentTabComplete()) {
      setActiveTab(index);
    } else {
      toast("Please fill all fields before moving to the next tab.",{
        icon: '✍️',
        style: {
          borderRadius: '10px',
          background: '#111826',
          color: '#fff',
        }
      });
    }
  };

  const isCurrentTabComplete = () => {
    switch (activeTab) {
      case 0: // Basic Information
      return true;
        // return title !== '' && 
        //        selectedCategory !== '' && 
        //        topic !== '' && 
        //        selectedLanguage !== '' && 
        //        selectedDifficulty !== '' && 
        //        duration !== '';
      case 1: // Advance Information
        // Add logic for Advance Information tab
        return true;
      case 2: // Curriculum
        // Add logic for Curriculum tab
        return true;
      case 3: // Publish Course
        // Add logic for Publish Course tab
        return true;
      default:
        return false;
    }
  };

  const handleSaveAndNext = (e) => {
    e.preventDefault();
    if (isCurrentTabComplete()) {
      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      } else {
        // Handle form submission for the last tab
        console.log("Form submitted successfully!");
        // Add your form submission logic here
      }
    } else {
      alert("Please fill all fields before proceeding.");
    }
  };

  const toggleSection = (id) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const addSection = () => {
    const newId = Math.max(...sections.map(s => s.id), 0) + 1;
    setSections([...sections, { id: newId, name: "Section name", isExpanded: false }]);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection={"New Course"} />
        </div>
        
        <main className="w-full bg-gray-100 pb-8">
          <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
            <div>
              <h1 className="text-xl font-semibold">Create New Course</h1>
              <p className="text-sm text-gray-500">Good Morning</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300"
                  placeholder="Search"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <img crossOrigin="anonymous" src={tutor.profileImg || defProfile} className="w-12 h-12 rounded-full" alt="" />
            </div>
          </header>

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
                        calculateProgress() === 6 ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {calculateProgress()}/6
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-8">
              <div className="flex justify-between mb-8">
                <h2 className="text-xl font-semibold">{tabs[activeTab].name}</h2>
              </div>

              <form className="space-y-6" onSubmit={handleSaveAndNext}>
                {activeTab === 0 && (
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
                          maxLength={20}
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {title.length}/20
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
                          <option value="">Select...</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Course Topic</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="What this course is based on"
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          maxLength={20}
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {topic.length}/20
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
                            <option value="">Select...</option>
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
                            <option value="">Select...</option>
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
                )}

                {activeTab === 1 && (
              
                  
                  <>
                   <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Course Thumbnail</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
                        {thumbnail ? (
                          <img src={thumbnail} alt="Course thumbnail" className="max-w-[200px] mx-auto" />
                        ) : (
                          <div >
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Upload your course Thumbnail here. <span className="font-semibold text-orange-500">Important guidelines:</span>
                            </p>
                            <p className="text-sm text-gray-500">1200×800 pixels or 12:8 Ratio. Supported format: .jpg, .jpeg, or .png</p>
                            <button className="mt-4  px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Upload Image</button>
                          </div>
                        )}
                      </div>
                    
            
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Course Descriptions</h3>
                      <textarea
                        placeholder="Enter your course descriptions"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full min-h-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
            
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">What you will teach in this course </h3>
                        
                      </div>
                      <div className="space-y-3">
                        
                          <div className="flex items-center gap-2">
                            <textarea
                              placeholder="What you will teach in this course..."
                              
                              onChange={(e) => handleObjectiveChange(index, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <div className="w-16 text-right">
                              <span className="text-sm text-gray-500">0/120</span>
                            </div>
                          </div>
                        
                      </div>
                  
                  </div>
            
                </div>
                  </>
                  
                )}

                {activeTab === 2 && (
                      
                      
                
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="space-y-2">
                          {sections.map((section) => (
                            <div
                              key={section.id}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => toggleSection(section.id)}
                                  className="flex items-center gap-4 flex-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    Sections {String(section.id).padStart(2, '0')}: {section.name}
                                  </span>
                                </button>
                                <div className="flex items-center gap-2">
                                  <button className="p-1 hover:bg-gray-200 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <div className="relative">
                                    <button className="p-1 hover:bg-gray-200 rounded">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                      </svg>
                                    </button>
                                    {/* Dropdown menu would go here */}
                                  </div>
                                  <button className="p-1 hover:bg-gray-200 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                       
                
                        <button
                          onClick={addSection}
                          className="w-full mt-4 px-4 py-2 border border-gray-300 text-orange-500 rounded-md hover:bg-gray-50"
                        >
                          Add Sections
                        </button>
                      </div>
                
                     
                    </div>
                )}

                {activeTab === 3 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Publish Course</h3>
                    {/* Add your publish course form fields here */}
                    <p>Publish Course form fields will be added here.</p>
                  </div>
                )}

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

