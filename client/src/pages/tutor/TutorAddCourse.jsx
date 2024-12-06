import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, CirclePlay, ClipboardList, Layers, MonitorPlay, Search } from 'lucide-react';
import Sidebar from "../../components/layout/tutor/Sidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectTutor } from "../../store/tutorSlice";
import defProfile from '../../assets/user-profile.png'
import { toast } from 'react-hot-toast';
import BasicInfo from './tabs/BasicInfo';
import AdvancedInfo from './tabs/AdvancedInfo';
import Curriculum from './tabs/Curriculum';

export default function CourseCreation() {
  const tutor = useSelector(selectTutor);
  const [categories,setCategories]=useState([]);

  const[basicInfo,setBasicInfo]=useState([]);
  const[advanceInfo,setAdvanceInfo]=useState([]);
  const[curriculum,setCurriculum]=useState([]);

 

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

  const handleBasicInfoData=async(dataFromChild)=>{
    setBasicInfo(dataFromChild);
  }
  const handleAdvanceInfoData=async(dataFromChild)=>{
    setAdvanceInfo(dataFromChild);
  }
  const handleCurriculumData=async(dataFromChild)=>{
    setCurriculum(dataFromChild);
  }

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
        // This is now the final submission
        handleFinalSubmit();
      }
    } else {
      toast("Please fill all fields before proceeding.", {
        icon: '✍️',
        style: {
          borderRadius: '10px',
          background: '#111826',
          color: '#fff',
        }
      });
    }
  };

  const handleFinalSubmit = async () => {
    const courseData = {
      basicInfo: basicInfo,
      advancedInfo: advanceInfo,
      tutodId:tutor._id
    };
  
    try {
      const response = await axios.post("http://localhost:3000/course/create-course", courseData);
      toast.success("Course created successfully!");
    
    } catch (error) {
      console.error(error);
      if(error.response){
        toast.error(error.response.data.message||"Failed to create course");
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
                  {/* {index === 0 && (
                    <span
                      className={`text-xs ${
                        calculateProgressTab1() === 6 ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {calculateProgressTab1()}/6
                    </span>
                  )} */}
                </button>
              ))}
            </nav>

            <div className="mt-8">
              <div className="flex justify-between mb-8">
                <h2 className="text-xl font-semibold">{tabs[activeTab].name}</h2>
              </div>

              <form className="space-y-6" onSubmit={handleSaveAndNext}>

                {activeTab === 0 && <BasicInfo categories={categories} sendData={handleBasicInfoData}/>}
                  
              
                {activeTab === 1 && <AdvancedInfo sendData={handleAdvanceInfoData}/>}
              
                                      
                {activeTab === 2 && <Curriculum sendData={handleCurriculumData}/>}
                      
                                              
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

