import express from "express"
import dotenv from 'dotenv'
import connectMongpDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app=express()
const port=process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/auth",authRoutes)

app.listen(port,()=>{
    console.log(`server is running at port ${port}`)
    connectMongpDB()
})