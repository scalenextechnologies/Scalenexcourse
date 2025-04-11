import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js'
import { v2 as cloudinary } from 'cloudinary'

// Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })

        res.json({ success: true, message: 'You can publish a course now' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//Add New Course
export const addCourse = async (req, res) => {
    try {
      const { courseData } = req.body;
      const imageFile = req.file;
      const educatorId = req.auth.userId;
  
      if (!imageFile || !imageFile.path) {
        return res.json({ success: false, message: "Thumbnail Not Attached" });
      }
  
      // Upload thumbnail to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
  
      const parsedCourseData = JSON.parse(courseData);
      parsedCourseData.educator = educatorId;
      parsedCourseData.courseThumbnail = imageUpload.secure_url; 
  
      const newCourse = await Course.create(parsedCourseData);
  
      res.json({ success: true, message: "Course added", course: newCourse });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };