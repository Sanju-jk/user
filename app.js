import express from 'express'
import mongoose from 'mongoose'
import userRoutes from './routes/user.route.js'

import dotenv from 'dotenv'
dotenv.config();


const app = express()
app.use(express.json())

app.use('/user', userRoutes)




mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(3080, () => console.log("Server is running on port 3080"))
}).catch((error) => console.log('Error connecting to MongoDB:', error));