"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice";
import axios from "axios";
import { useNavigate } from "react-router";
import Pagination from "../../components/utils/Pagination";
import Sidebar from "../../components/layout/admin/sidebar";
import axiosInstance from "../../config/axiosConfig";
import AdminHeader from "@/components/layout/admin/AdminHeader";

export default function CategoryManagement() {
  const admin = useSelector(selectAdmin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, SetErrors] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    title: "",
    description: "",
  });
  const [editCategory, setEditCategory] = useState({
    _id: "",
    title: "",
    description: "",
  });

  const itemsPerPage = 5;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/admin/categories");
    
      setCategories(response.data);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      }
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setIsEditModalOpen(true);
  };

  const validateInfo = () => {
    const newErrors = {};

    if (editCategory.title.trim().length < 8) {
      newErrors.title = "Please enter a title of atleast 8 characters";
    }
    if (editCategory.description.trim().length < 8) {
      newErrors.description =
        "Please enter a description of atleast 10-30 characters";
    }
    if (newCategory.title.trim().length < 8) {
      newErrors.newTitle = "Please enter a title of atleast 8 characters";
    }
    if (newCategory.description.trim().length < 8) {
      newErrors.newDescription =
        "Please enter a description of atleast 10-30 characters";
    }

    SetErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateInfo()) return;

    try {
      // Assuming you have an API endpoint for updating categories
      await axiosInstance.put(
        `/admin/categories/${editCategory._id}`,
        editCategory
      );

      const updatedCategories = categories.map((cat) =>
        cat._id === editCategory._id ? { ...cat, ...editCategory } : cat
      );
      setCategories(updatedCategories);
      setIsEditModalOpen(false);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDelete = (_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Fixed the typo in the URL (added missing 'h' in 'http')
          const response = await axiosInstance.delete(`/admin/category/${_id}`);

          // Remove the deleted category from the state
          const updatedCategories = categories.filter((cat) => cat._id !== _id);
          setCategories(updatedCategories);

          // Show success toast
          toast.success("Category deleted successfully");
        } catch (error) {
          console.log(error);
          if (error.response) {
            // Display error message from backend or a generic error
            toast.error(
              error.response.data.message || "Failed to delete category"
            );
          }
        }
      }
    });
  };

  const handleAddCategory = async () => {
    if (!validateInfo()) return;

    try {
      const response = await axiosInstance.post(
        "/admin/categories",
        newCategory
      );
      setCategories((prevCategories) => [
        ...prevCategories,
        response.data.category,
      ]);
      setNewCategory({ title: "", description: "" });
      setIsAddModalOpen(false);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="Category" />
      </div>

      <main className="flex-1">
        <AdminHeader heading="Category Management" />

        <div className="space-y-6 mt-12 px-12">
          <div className="flex max-w-6xl mx-auto justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300 flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </button>
          </div>

          <div className="bg-white shadow-md max-w-6xl mx-auto rounded-lg lg:min-h-[500px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 ">
                <tr className=" border border-b-gray-300">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sl. No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-12 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-sm text-gray-500 text-center"
                    >
                      No categories found
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category, index) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium ">
                        <button
                          onClick={() => handleEdit(category)}
                          className="bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 me-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="px-3 py-1 text-xs font-medium text-white hover:bg-red-600 bg-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            className="flex items-center justify-between"
            dataPerPage={itemsPerPage}
            totalData={filteredCategories.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </main>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Category</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Category Title"
                value={newCategory.title}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, title: e.target.value })
                }
                className="w-full mb-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                minLength={6}
              />
              {errors.newTitle && (
                <span className=" text-red-500 text-sm text-center ">
                  {errors.newTitle}
                </span>
              )}
            </div>

            <div>
              <textarea
                placeholder="Category Description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className="w-full mb-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                required
                minLength={12}
              />
              {errors.newDescription && (
                <span className="text-red-500 text-sm text-center ">
                  {errors.newDescription}
                </span>
              )}
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Category Title"
              value={editCategory.title}
              onChange={(e) =>
                setEditCategory({ ...editCategory, title: e.target.value })
              }
              className="w-full mb-4 px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              minLength={6}
            />

            <textarea
              placeholder="Category Description"
              value={editCategory.description}
              onChange={(e) =>
                setEditCategory({
                  ...editCategory,
                  description: e.target.value,
                })
              }
              className="w-full mb-4 px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
            />
            {errors.title && (
              <span className="text-red-500 text-sm text-center ">
                {errors.title}
              </span>
            )}
            {errors.description && (
              <span className="text-red-500 text-sm text-center ">
                {errors.description}
              </span>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#ff6738] text-white rounded-md hover:bg-orange-600 transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
