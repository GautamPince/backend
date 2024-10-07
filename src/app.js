import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credentials: true
}))

// for configurtaion, or to set middlewares
// 1. limit for how much data is expected from user 
app.use(express.json({ limit: "16kb" }))
//2.  excepting data to url
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
//3. store file folder for public
app.use(express.static("public",))

// for storing user's browser cookie 
app.use(cookieParser())


export { app }