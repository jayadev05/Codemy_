const User = require("../model/userModel");
const Cart = require('../model/cartModel');
const Course = require('../model/courseModel');


const addToCart= async (req,res)=>{


    const {courseId,userId}=req.body;

    if(!courseId || !userId){

        return res.status(400).json({message:"TutorId or CourseId is missing / innapropriate"})
    }

    try {
        
     const course = await Course.findById(courseId);
     if(!course) return res.status(404).json({message:"Course not found"});

     let cart = await Cart.findOne({userId});
     
    
     if(!cart){
        cart = new Cart({
            userId,
            items: [
                {
                    courseId,
                    price:course.price
                }
            ],
            totalCartPrice: course.price
          });
     }


     else {
        const courseInCart = cart.items.some((item)=>item.courseId.toString()===courseId);

        if(!courseInCart){
           cart.items.push({
               courseId,
               price:course.price
           })
        }
        else {
            return res.status(400).json({message:'Course already in cart'});
        }
       
        
     }
        

     //update total cart price

     cart.totalCartPrice= cart.items.reduce((sum,item)=>sum+item.price,0);

     await cart.save();

     res.status(200).json({message:"Course added to cart successfully",cart});


    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to add course , Internal Server Error!"})
    }


}

const removeFromCart= async (req,res)=>{

    const {userId,courseId}=req.query;

    if(!userId || !courseId) return res.status(400).json({message:"UserId / CourseId is missing or innapropriate"})

try {
    
    let cart = await Cart.findOne({userId});
    
    if(!cart) return res.status(404).json({message:"Cart not found"});


    // removing item from cart
     cart.items = cart.items.filter((item)=> item.courseId.toString()!==courseId);

     //update total cart price
     cart.totalCartPrice = cart.items.reduce((sum,item)=>sum+item.price,0);

    await cart.save();

    res.status(200).json({message:"Course removed from  cart successfully"});

} catch (error) {
    console.log(error);
    res.status(500).json({message:"Failed to remove course , Internal Server Error!"})
}
}

const viewCart= async (req,res)=>{

const {userId}=req.query;

if(!userId)  return res.status(400).json({message:"User ID is missing / innapropriate"})

try {
   
    const cart=await Cart.findOne({userId})
    .populate({
        path: 'items.courseId',
        select: 'title thumbnail enrolleeCount averageRating ratings tutorId',
        populate: {
            path: 'tutorId',
            select: 'profileImg fullName'
        }
    });

    if (!cart) {
        return res.status(200).json({ cart: [], message: "Cart is empty" });
      }
      

    res.status(200).json({message:"Cart fetched succesfully",cart});

} catch (error) {
    console.log(error);
    res.status(500).json({message:"Failed to get course , Internal Server Error!"})
}
}

const clearCart= async (req,res)=>{

    const {userId}=req.query;

    if(!userId)  return res.status(400).json({message:"User ID is missing / innapropriate"})

try {

    const cart=await Cart.findOne({userId});

    if(cart){
        cart.items=[];
        cart.totalCartPrice=0;

        await cart.save();
    }

   

    res.status(200).json({message:"Cart cleared successfully",cart});
    
} catch (error) {
    console.log(error);
    res.status(500).json({message:"Failed to clear cart , Internal Server Error!"})
}
}


module.exports={
    addToCart,
    removeFromCart,
    viewCart,
    clearCart
}