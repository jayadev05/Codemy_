import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react'


function BasicInfo({categories}) {
 
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState('Days');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
      };
    
      const handleDifficultyChange = (e) => {
        setSelectedDifficulty(e.target.value);
      };
    
      const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
      };

      const calculateProgressTab1 = () => {
        const fields = [title, selectedCategory, topic, selectedLanguage, selectedDifficulty, duration];
        const filledFields = fields.filter(field => field !== '').length;
        return Math.round((filledFields / fields.length) * 6);
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
  )
}

export default BasicInfo