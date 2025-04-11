import express from 'express'
import { addCourse, updateRoleToEducator } from '../controllers/educatorController.js'
import upload from '../config/multer.js'
import { protectEducator } from '../middleware/authMiddleware.js'


const educatorRouter=express.Router()


//Add Educator Role

educatorRouter.get('/update-role',updateRoleToEducator)

educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)

export default educatorRouter;