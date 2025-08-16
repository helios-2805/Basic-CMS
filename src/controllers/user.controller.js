import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave : false})

    return { accessToken, refreshToken };

  } catch(error) {
    throw new apiError(500, "Something went wrong while generating refresh and access token!");
  }
}

const registerUser = asyncHandler( async (req, res) => {
  const { username, email, password, fullName } = req.body
  // console.log("Email!!",email);

  if(
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required!")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  
  if(existedUser) {
    throw new apiError(409, "Username or Email already Exists!!");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required!!");
  } 

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar) {
    throw new apiError(400, "Avatar file is required!!");
  }

  const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) {
    throw new apiError(500, "Something went wrong while registeration!")
  }

  return res.status(201).json(
    new apiResponse(200, createdUser, "User Registered Successfully!!")
  )
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body
  if(!username || !email) {
    throw new apiError(404, "Username or Email is required!!");
  }

  const user = await User.findOne({
    $or: [{ username },{ email }]
  });

  if(!user){
    throw new apiError(404, "User doesn't exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
    throw new apiError(401, "Invalid User Credentials!");
  }

  const { accessToken, refreshToken } = await
  generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken");

  const options = {
    httpOnly : true,
    secure : true // disable cookie modification from front-end browser i.e only server side modification is allowed
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new apiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User Logged In Sucessfully!"
    )
  )
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )
  const options = {
    httpOnly : true,
    secure : true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(
    200, {}, "User Logged out!"
  ))
});

export { registerUser, loginUser, logOutUser }