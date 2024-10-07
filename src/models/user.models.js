import mongoose, { Schema } from "mongoose";
import jwt from "JsonWebTokenError";
import bcrypt from "bcrypt";
// now direct encryption is not possible so we need some mongoose hooks (pre)

const userSchema = new Schema(
   {
      username: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
         index: true, // enables searching field
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
      },
      fullName: {
         type: String,
         required: true,
         trim: true,
         index: true,
      },
      avatar: {
         type: String, // cloudnary url ||aws url etc
         required: true,

      },
      coverImage: {
         type: String, //cloudnary url

      },
      watchHistory: [
         {
            type: Schema.Types.ObjectId,
            ref: "Video"
         }
      ],
      password: {
         type: String,
         reqirerd: [true, 'password is required']
      },
      refreshToken: {
         type: String,
      }

   },
   {
      timestamps: true
   }
)
// 'save' is middleware , and it is use for encryption on "saving time" .
userSchema.pre("save", async function (next,) {
   if (!this.isModified("password")) return next()

   this.password = bcrypt.hash(this.password, 10)
   next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}
userSchema.methods.genetateAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         username: this.username,
         fullName: this.fullName
      },
      process.env.ACCESS_TOKEN_SECRATE,
      {
         expairyIn: process.env.ACCESS_TOKEN_EXPIRY
      }
   )
}
userSchema.methods.genetateRefreshToken = function () {
   return jwt.sign(
      {
         _id: this._id,

      },
      process.env.REFRESH_TOKEN_SECRATE,
      {
         expairyIn: process.env.REFRESH_TOKEN_EXPIARY
      }
   )
}

export const User = mongoose.model("User", userSchema)