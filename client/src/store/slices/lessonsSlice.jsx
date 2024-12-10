import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lessons: [] // Initialized as an array
};

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    // Adds multiple lessons or replaces the entire array
    setLessons: (state, action) => {
      state.lessons = action.payload; // Payload should be an array of lessons
    },
    // Adds a single lesson to the array
    addLesson: (state, action) => {
      state.lessons.push({
        _id: action.payload.id,
        title: action.payload.lessonTitle,
        thumbnail: action.payload.lessonThumbnail,
        video: action.payload.video,
        description: action.payload.description,
        lessonNotes: action.payload.lessonNotes,
        duration:action.payload.duration,
        durationUnit:action.payload.durationUnit
      });
    },
    // Clears all lessons
    clearLessons: (state) => {
      state.lessons = [];
    },
    // Removes a specific lesson by ID
    removeLesson: (state, action) => {
      state.lessons = state.lessons.filter(lesson => lesson._id !== action.payload);
    }
  }
});

// Export actions
export const { setLessons, addLesson, clearLessons, removeLesson } = lessonsSlice.actions;

// Export selector
export const selectLessons = (state) => state.lessons.lessons;

// Export reducer
export default lessonsSlice.reducer;
