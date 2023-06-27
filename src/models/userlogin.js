const mongoose = require("mongoose");
const validator = require("validator");

const userSchema1 = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
  password: { type: String, required: true },
});

//creating a collection

const User1 = mongoose.model("Register", userSchema1);
module.exports = User1;
