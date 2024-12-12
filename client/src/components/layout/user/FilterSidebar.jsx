import React, { useEffect, useState } from "react";
import axios from "axios";

const FilterSidebar = ({ filters, setFilters }) => {
  const [categories, setCategories] = useState([]);

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: prevFilters[name]?.includes(value)
        ? prevFilters[name].filter((item) => item !== value)
        : [...(prevFilters[name] || []), value],
    }));
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/admin/get-categories"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="filter-sidebar p-4">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Category Filter */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Category</h4>
        {categories.map((category) => (
          <div key={category._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`category-${category._id}`}
              checked={filters.category?.includes(category.title)}
              onChange={() => handleFilterChange("category", category.title)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor={`category-${category._id}`} className="ml-2">
              {category.title}
            </label>
          </div>
        ))}
      </div>

      {/* Rating Filter */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Rating</h4>
        {[4, 3, 2].map((rating) => (
          <div key={rating} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`rating-${rating}`}
              checked={filters.rating?.includes(rating)}
              onChange={() => handleFilterChange("rating", rating)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor={`rating-${rating}`} className="ml-2">
              {rating}+ Stars
            </label>
          </div>
        ))}
      </div>

      {/* Course Level Filter */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Course Level</h4>
        {["All Level", "Beginner", "Intermediate", "Expert"].map((level) => (
          <div key={level} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`level-${level}`}
              checked={filters.level?.includes(level)}
              onChange={() => handleFilterChange("level", level)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor={`level-${level}`} className="ml-2">
              {level}
            </label>
          </div>
        ))}
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-medium mb-2">Price</h4>
        <input
          type="range"
          min="0"
          max="10000"
          value={filters.price || 10000}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, price: Number(e.target.value) }))
          }
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-2">
          <span>₹0</span>
          <span>₹{filters.price || 10000}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
