import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a router instance
const router = Router();

// Define the route for user registration with file uploads
router.route("/register").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1
      },
      {
         name: "coverImage",
         maxCount: 1
      }
   ]),
   registerUser
);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;
