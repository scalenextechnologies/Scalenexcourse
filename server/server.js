import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { Console } from 'console'
import connectDB from './config/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'

//Intialise Express
const app=express()

//connect to database
await connectDB()

//Middlewear
app.use(cors())

//Route

app.get('/', (req,res)=>res.send("API working"))
// app.post('/clerk',express.json(),clerkWebhooks)

//port
const PORT=process.env.PORT  || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
}
)