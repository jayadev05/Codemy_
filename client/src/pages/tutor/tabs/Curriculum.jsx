import React, { useEffect, useState } from "react";

function Curriculum({ sendData }) {
  const [sections, setSections] = useState([
    { id: 1, name: "Section name", isExpanded: false, content: [] },
    { id: 2, name: "Section name", isExpanded: false, content: [] },
    { id: 3, name: "Section name", isExpanded: false, content: [] },
  ]);

  const [state, setState] = useState({
    activeModal: { type: null, sectionId: null },
    editName: "",
    selectedFile: null,
    lectureNote: null,
    description: "",
    title: "",
    previewUrl: "",
    selectedThumbnail: null,
  });

  // Utility function to update state
  const updateState = (newState) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  // Improved file validation function
  const validateFile = (file, options = {}) => {
    const {
      maxSize = 4 * 1024 * 1024 * 1024, // 4GB default
      allowedTypes = ["video/*", "application/pdf", "image/*"],
    } = options;

    if (!file) {
      console.error("No file selected");
      return false;
    }

    // File size check
    if (file.size > maxSize) {
      alert(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    // File type check
    const isAllowedType = allowedTypes.some((type) =>
      file.type.match(new RegExp(type.replace("*", ".*")))
    );

    if (!isAllowedType) {
      alert("Invalid file type");
      return false;
    }

    return true;
  };

  // Unified file upload handler
  const handleFileUpload = (e, fileType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file based on type
    const validationOptions = {
      video: {
        maxSize: 4 * 1024 * 1024 * 1024,
        allowedTypes: ["video/*"],
      },
      file: {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ["application/pdf"],
      },
      image: {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ["image/*"],
      },
    };

    if (!validateFile(file, validationOptions[fileType] || {})) return;

    // Handle different file types
    switch (fileType) {
      case "video":
      case "file":
        updateState({
          selectedFile: file,
          activeModal: {
            type: fileType,
            sectionId: state.activeModal.sectionId,
          },
        });
        break;
      case "image":
        const reader = new FileReader();
        reader.onloadend = () => {
          updateState({
            selectedThumbnail: file,
            previewUrl: reader.result,
            selectedFile: file,
          });
        };
        reader.readAsDataURL(file);
        break;
    }
  };

  // Improved payload generation
  const generatePayload = () => ({
    title: state.title,
    thumbnail: state.selectedThumbnail,
    description: state.description,
    lectureNote: state.lectureNote,
    video: state.selectedFile,
    section: state.editName,
  });

  // Centralized data sending
  // Remove the dependency on sendData and only depend on the specific state values
useEffect(() => {
  const payload = {
    title: state.title,
    thumbnail: state.selectedThumbnail,
    description: state.description,
    lectureNote: state.lectureNote,
    video: state.selectedFile,
    section: state.editName,
  };
  
  // Only call sendData if the payload has meaningful content
  if (payload.title || payload.thumbnail || payload.description || 
      payload.lectureNote || payload.video || payload.section) {
    sendData(payload);
  }
}, [
  state.title,
  state.selectedThumbnail, 
  state.description,
  state.lectureNote,
  state.selectedFile,
  state.editName
]);
  // Simplified section management functions
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((s) => s.id), 0) + 1,
        name: "Section name",
        isExpanded: false,
        content: [],
      },
    ]);
  };

  const deleteSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  // Unified upload save handler
  const handleUploadSave = () => {
    const { selectedFile, activeModal } = state;
    if (selectedFile && activeModal.sectionId) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === activeModal.sectionId
            ? {
                ...section,
                isExpanded: true, // Always expand the section when adding content
                content: [
                  ...section.content,
                  {
                    type: activeModal.type,
                    name: selectedFile.name,
                    size: selectedFile.size,
                    lastModified: selectedFile.lastModified,
                  },
                ],
              }
            : section
        )
      );

      // Reset modal and file states
      updateState({
        activeModal: { type: null, sectionId: null },
        selectedFile: null,
        previewUrl: "",
        selectedThumbnail: null,
      });
    }
  };

  // Handle text save for title and description
  const handleTextSave = () => {
    const { activeModal } = state;
    if (activeModal.type === "description") {
      setSections((prev) =>
        prev.map((section) =>
          section.id === activeModal.sectionId
            ? {
                ...section,
                isExpanded: true,
                content: [
                  ...section.content,
                  {
                    type: "description",
                    name: state.description,
                  },
                ],
              }
            : section
        )
      );

      updateState({
        activeModal: { type: null, sectionId: null },
        description: state.description,
      });
    } else if (activeModal.type === "notes") {
      setSections((prev) =>
        prev.map((section) =>
          section.id === activeModal.sectionId
            ? {
                ...section,
                isExpanded: true,
                content: [
                  ...section.content,
                  {
                    type: "title",
                    name: state.title,
                  },
                ],
              }
            : section
        )
      );

      updateState({
        activeModal: { type: null, sectionId: null },
        title: state.title,
      });
    }
  };

  // Handle edit section name save
  const handleEditSave = () => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === state.activeModal.sectionId
          ? { ...section, name: state.editName }
          : section
      )
    );

    updateState({
      activeModal: { type: null, sectionId: null },
      editName: "",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Set active modal with additional safety
  const setActiveModal = (modalConfig) => {
    updateState({ activeModal: modalConfig });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center gap-4 flex-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${
                      section.isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Section {String(section.id).padStart(2, "0")}:{" "}
                    {section.name}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={() =>
                        setActiveModal({
                          type: "options",
                          sectionId: section.id,
                        })
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      setActiveModal({ type: "edit", sectionId: section.id });
                      updateState({ editName: section.name });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {section.isExpanded && section.content.length > 0 && (
                <div className="mt-4 space-y-2">
                  {section.content.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {item.type === "description" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                          </svg>
                        )}
                        {item.type === "image" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-pink-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                        {item.type === "video" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {item.type === "file" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                        {item.type === "description" ||
                          (item.type === "title" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-yellow-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                              />
                            </svg>
                          ))}
                        {item.type === "notes" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-purple-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                        <span className="text-sm font-medium">
                          {item.name ||
                            `${
                              item.type.charAt(0).toUpperCase() +
                              item.type.slice(1)
                            }`}
                        </span>
                      </div>
                      {item.size && (
                        <span className="text-xs text-gray-500">
                          {formatFileSize(item.size)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="w-full mt-4 px-4 py-2 border border-gray-300 text-orange-500 rounded-md hover:bg-gray-50"
          >
            Add Section
          </button>
        </div>
      </div>

      {state.activeModal.type === "edit" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Edit Section Name</h2>
            <input
              type="text"
              value={state.editName}
              onChange={(e) => updateState({ editName: e.target.value })}
              placeholder="Write your section name here..."
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  updateState({ activeModal: { type: null, sectionId: null } })
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {state.activeModal.type === "options" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add Content</h2>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    type: "notes",
                    sectionId: state.activeModal.sectionId,
                  })
                }
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Add Lecture Title
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    type: "video",
                    sectionId: state.activeModal.sectionId,
                  })
                }
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Add Video
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    type: "image",
                    sectionId: state.activeModal.sectionId,
                  })
                }
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Add Video Thumbnail
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    type: "file",
                    sectionId: state.activeModal.sectionId,
                  })
                }
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Attach Lecture Notes(pdf)
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    type: "description",
                    sectionId: state.activeModal.sectionId,
                  })
                }
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Add Description
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, sectionId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {state.activeModal.type === "video" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Lecture Video</h2>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, "video")}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <p className="text-sm text-gray-500 mb-4">
              Note: All files must be at least 720p and less than 4.0 GB.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, sectionId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSave}
                disabled={!state.selectedFile}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}

      {state.activeModal.type === "file" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              Attach Lecture Note (pdf)
            </h2>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e, "file")}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, sectionId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSave}
                disabled={!state.selectedFile}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {state.activeModal.type === "image" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Attach Video Thumbnail</h2>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, "image")}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              accept="image/*"
            />
            {state.previewUrl && (
              <div className="mb-4">
                <img
                  src={state.previewUrl}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, sectionId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSave}
                disabled={!state.selectedFile}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {(state.activeModal.type === "description" ||
        state.activeModal.type === "notes") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              {state.activeModal.type === "description"
                ? "Add Description"
                : "Add Lecture Title"}
            </h2>
            <textarea
              value={
                state.activeModal.type === "description"
                  ? state.description
                  : state.title
              }
              onChange={(e) =>
                updateState(
                  state.activeModal.type === "description"
                    ? { description: e.target.value }
                    : { title: e.target.value }
                )
              }
              placeholder={`Write your ${
                state.activeModal.type === "description"
                  ? "description"
                  : "lecture title"
              } here...`}
              className={`w-full p-2 border border-gray-300 rounded mb-4 h-${
                state.activeModal.type === "description" ? 32 : 12
              }`}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, sectionId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTextSave}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save{" "}
                {state.activeModal.type === "description"
                  ? "Description"
                  : "Title"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Curriculum;
