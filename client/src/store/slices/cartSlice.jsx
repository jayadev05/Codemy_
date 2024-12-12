import { createSlice } from "@reduxjs/toolkit";


const cartSlice = createSlice({

    name:'cart',
    initialState:{
        items:[]
    },
    reducers:{

        addToCart:(state,action)=>{
            
        },

        removeFromCart:(state,action)=>{

        },

        ClearCart:(state,action)=>{
            state.cart=null;
        }


    }
});

export const {
    addToCart,
    removeFromCart,
    ClearCart
} =cartSlice.actions;


export default cartSlice.reducer;