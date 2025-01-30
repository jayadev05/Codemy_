import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 course: null
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {

    addCourse: (state, action) => {
     
        state.course = {
        _id:action.payload._id,
        tutorId:action.payload.tutorId,
        title:action.payload.title,
        thumbnail:action.payload.thumbnail,
        enrolleeCount:action.payload.enrolleeCount,
        ratings:action.payload.ratings,
        topic:action.payload.topic,
        description:action.payload.description,
        courseContent:action.payload.courseContent,
        language:action.payload.language,
        category:action.payload.category,
        level:action.payload.level,
        price:action.payload.price,
        lessons:action.payload.lessons,
        averageRating:action.payload.averageRating,
        isListed:action.payload.isListed,
        duration:action.payload.duration,
        durationUnit:action.payload.durationUnit,
        createdAt:action.payload.createdAt,
        updatedAt:action.payload.updatedAt,

      };
    },

    setCurrentCourse(state, action) {
      state.course = action.payload;
    },
    

    updateCourse: (state, action) => {
      return { ...state, ...action.payload };
    },

   clearCourse: (state) => {
      state.course = null; 
    }
  }
});

// Export actions
export const { addCourse, clearCourse ,updateCourse ,setCurrentCourse} = courseSlice.actions;

// Export selector
export const selectCourse = (state) => state.course.course;

// Export reducer
export default courseSlice.reducer;