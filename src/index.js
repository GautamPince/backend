// require('dotenv').config({ path: './env' })
// import 'dotenv/config'
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
   path: './env'
})

connectDB()






















/** IIFE (Immediately Invoked Function Expression) */
/*
import express from "express"
const app = express()
; (async () => {
   try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      // listener 
      app.on("error", () => {
         console.log("ERRR: ", error);
         throw error
      })
      app.listen(process.env.PORT, () => {
         console.log(`App is listening on ${process.env.PORT}`)
      })


   } catch (error) {
      console.error("ERROR", error)
      throw error
   }
})()
*/