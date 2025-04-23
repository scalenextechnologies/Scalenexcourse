import express, { application } from 'express'
import cors from 'cors'
import 'dotenv/config'
import { Console } from 'console'
import connectDB from './config/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './config/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'


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
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//port
const PORT=process.env.PORT  || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
}
)