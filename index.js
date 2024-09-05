import express from "express"
import dotenv from 'dotenv'
import mongoose from "mongoose"
dotenv.config()
import {UserRouter} from './routes/User.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from "cookie-parser"

const app = express()

app.use(cors());

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))


app.use(express.json())

app.use('/auth',UserRouter)





app.use(cookieParser())

mongoose.connect("mongodb+srv://buchichowdary2002:sevika123@cluster0.omrg6a6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})