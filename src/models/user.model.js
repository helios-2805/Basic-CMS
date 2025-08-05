import mongoose, { Schema } from "mongoose";
// module usesd for generating tokens by which data is encrypted and stored - every the same algo is used for encoding 
// and decoding but we can enter a 64byte string in it by which the encryption is unique
import jwt from "jsonwebtoken";
// this module is used for hashing the password with some algos
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // index is used to make the searching part in the db way smoother and easier(but kinda makes the db heavy)
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    }, 
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String, // here we keep the cloudinary url
      required: true
    },
    coverImage: {
      type: String, // here we keep the cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      required: [true, 'Password is required!']
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
// creating a hook - pre hook where it is used to update db when changes are made to password
userSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next()
});

// creating custom methods
userSchema.methods.isPasswordCorrect = async function
(password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email : this.email,
      username : this.username,
      fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);