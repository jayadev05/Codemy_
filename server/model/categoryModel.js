const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
   {
    title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      }],
      tutors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
      }],
      isVisible: {
        type: Boolean,
        default: true,
      },
   },{
    timestamps: true,
   }
)


const Category = mongoose.model("Category",CategorySchema);

module.exports= Category