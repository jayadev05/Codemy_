import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 course: null
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    addCourse: (state, action) => {
      // action.payload will be the userData from your API response
        state.course = {
        _id:action.payload._id,
        title:action.payload.title,
        thumbnail:action.payload.thumbnail,
        enrolleeCount:action.payload.enrolleeCount,
        ratings:action.payload.ratings,
        topic:action.payload.topic,
        language:action.payload.language,
        category:action.payload.category,
        difficulty:action.payload.difficulty,
        price:action.payload.price,
      };
    },
   clearCourse: (state) => {
      state.course = null;
     
    }
  }
});

// Export actions
export const { addCourse, clearCourse } = courseSlice.actions;

// Export selector
export const selectCourse = (state) => state.course.course;

// Export reducer
export default courseSlice.reducer;