import express from "express"
import dotenv from 'dotenv'
import connectMongpDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import notificationRoutes from "./routes/notification.routes.js"

import { v2 as cloudinary } from 'cloudinary';
dotenv.config();
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app=express()
const port=process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/post",postRoutes)
app.use("/api/notification",notificationRoutes)

app.listen(port,()=>{
    console.log(`server is running at port ${port}`)
    connectMongpDB()
})