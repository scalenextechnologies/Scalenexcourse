import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { Console } from 'console'
import connectDB from './config/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './config/cloudinary.js'

//Intialise Express
const app=express()

//connect to database
await connectDB()
await connectCloudinary()

//Middlewear
app.use(cors())
app.use(clerkMiddleware())


//Route

app.get('/', (req,res)=>res.send("API working"))
app.post('/clerk',express.json(),clerkWebhooks)
app.use('/api/educator', express.json(), educatorRouter)

//port
const PORT=process.env.PORT  || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
}
)