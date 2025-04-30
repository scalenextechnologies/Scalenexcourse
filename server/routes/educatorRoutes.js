import express from 'express'
import { addCourse, educatorDashBoardData, getEducatorCourses, getenrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js'
import upload from '../config/multer.js'
import { protectEducator } from '../middleware/authMiddleware.js'


const educatorRouter=express.Router()



//Add Educator Role

educatorRouter.get('/update-role',updateRoleToEducator)

educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)
educatorRouter.get('/courses',protectEducator,getEducatorCourses)
educatorRouter.get('/dashboard',protectEducator,educatorDashBoardData)
educatorRouter.get('/enrolled-students',protectEducator,getenrolledStudentsData)


export default educatorRouter;