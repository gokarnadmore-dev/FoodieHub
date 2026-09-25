const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
      name : {
            type: String,
            required: true
      },
      email: {
            type: String,
            required: true,
            unique: true
      },
      password: {
            type: String,
            required: true
      },
      contact: {
            type: String,
            // required: true
      },
      isAdmin: {
            type: Boolean,
            default: false
      },
      address: {
            type: String,
      },
      profileImage: {
            type: String,
      }
}, {
      timestamps:true
});

module.exports = mongoose.model("User", userSchema);
