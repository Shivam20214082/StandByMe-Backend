const mongoose=require("mongoose");
const validator=require("validator");

const userSchema=mongoose.Schema(
    {
        name: {
          type: String,
          required: true
        },
        Phone: {
          type: String,
          required: true
        },
        email: {
          type: String,
          required: true
        },
        'Email-Mode': {
          type: String,
          enum: ['on', 'off'],
        //   required: true
        },
        'Phone-Mode': {
          type: String,
          enum: ['on', 'off'],
        //   required: true
        },
        message: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now,
        }
      }
      
)



//creating a collection

const User= mongoose.model("User",userSchema);

module.exports =User;
