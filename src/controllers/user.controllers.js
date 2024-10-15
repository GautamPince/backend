import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.models.js';
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSafe: false })

      return { accessToken, refreshToken }


   } catch (error) {
      throw new ApiError(500, "Somethingwent wrong while generating access and refresh token")
   }

}

const registerUser = asyncHandler(async (req, res) => {

   //1. get user details from frontend
   //2. validation - not empty
   //3. check if user already exists: username,email
   //4. check or images,check for avatar
   //5. upload them to cloudinary,avatar
   //6. create user object - crate entry in db 
   //7. remove password and refresh token field from response
   //8. check for user creation
   //9. return res


   const { fullName, email, username, password } = req.body
   console.log("email:", email)


   if (
      [fullName, email, username, password].some((field) =>
         field?.trim() === "")
   ) {
      throw new ApiError(400, "All fields are required");
   }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })
   if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
   }
   // console.log(req.files);
   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   // checking image is present or not
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }


   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudnary(avatarLocalPath)
   const coverImage = await uploadOnCloudnary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "", // check avatar is available or not if not return null 
      email,
      password,
      username: username.toLowerCase()
   })
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registring a user")
   }
   return res.status(201).json(
      new ApiResponse(200, createdUser, "sussfully register")
   )
});

const loginUser = asyncHandler(async (req, res) => {
   const { email, username, password } = req.body;
   console.log(email);

   if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
   }

   const user = await User.findOne({
      $or: [{ username }, { email }]
   });

   if (!user) {
      throw new ApiError(404, 'User does not exist!');
   }

   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, 'Password incorrect');
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // Added 'await'

   const options = {
      httpOnly: true,
      secure: true
   };

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200, {
            user: loggedInUser, // Make sure this contains the resolved user object
            accessToken,
            refreshToken
         },
            "User logged in successfully"
         )
      );
});

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )
   const options = {
      httpOnly: true,
      secure: true
   }
   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
         new ApiResponse(200, {}, "User Logged Out successfully")
      )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request")
   }
   try {

      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET,
      )
      const user = User.findById(decodedToken?._id)

      if (!user) {
         throw new ApiError(401, "Invalid refresh token")
      }
      if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refreshtoken is expired or used")
      }
      const options = {
         httpOnly: true,
         secure: true
      }
      const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
      return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
            new ApiResponse(
               200, {
               accessToken, refreshToken: newRefreshToken
            },
               "Access token Refreshed"
            )
         )
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
   }
});

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
}