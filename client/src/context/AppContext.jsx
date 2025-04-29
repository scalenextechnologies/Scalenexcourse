import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth,useUser} from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const backendUrl=import.meta.env.VITE_BACKEND_URL;
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate =useNavigate()

    const {getToken}=useAuth()
    const {user}=useUser()
    const [allCourses, setallCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)
    //Fetch all courses 
    const fetchAllcourses = async () => {
        try {
            const {data}=await axios.get(backendUrl + '/api/course/all');
            if(data.success){
                setallCourses(data.courses)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
           toast.error(error.message) 
        }
    }

    //fetch UserData

    const fetchUserData= async()=>{
        if(user.publicMetadata.role==='educator'){
            setIsEducator(true)
        }
        try {
            const token=await getToken()
            const {data}=await axios.get(backendUrl + '/api/user/data',{headers: {Authorization: `Bearer ${token}`}})

            if(data.success){
                setUserData(data.user)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }




    //Function To claculate average rating of course
    const calculateRating = (course) => {
        if (!course.courseRatings || course.courseRatings.length === 0) {
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });
        return Math.floor(totalRating / course.courseRatings.length)
    };
  // Function to calculate Chapter Time
const calculateChapterTime = (chapter) => {
    let time = 0; // Initialize time here
    chapter.chapterContent.forEach((lecture) => {
        time += lecture.lectureDuration;
    });
    return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
}

// Function to calculate Course Duration
const calculateCourseDuration = (course) => {
    let time = 0; // Initialize time here
    course.courseContent.forEach((chapter) => {
        chapter.chapterContent.forEach((lecture) => {
            time += lecture.lectureDuration;
        });
    });
    return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
}

// Function to calculate Number of Lectures
const calculateNoOfLectures = (course) => {
    return course.courseContent.reduce((totalLectures, chapter) => {
        if (Array.isArray(chapter.chapterContent)) {
            totalLectures += chapter.chapterContent.length;
        }
        return totalLectures;
    }, 0); // Start with 0 lectures
}

// Fetch Userenrolled Courses
const fetchUserEnrolledCourses= async()=>{
    try {
        const token=await getToken()
    const {data}=await axios.get(backendUrl + '/api/user/enrolled-courses',{headers: {Authorization: `Bearer ${token}`}})

    if(data.success){
        setEnrolledCourses(data.enrolledCourses.reverse())
    }
    else{
        toast.error(data.message)
    }
    } catch (error) {
        toast.error(error.message)
    }
    
}
    useEffect(() => { fetchAllcourses() 
      
    }, [])

    const logToken=async ()=>{
        console.log(await getToken());
    }
    useEffect(() => {
        if (user) {
            logToken();
            fetchUserData();
            fetchUserEnrolledCourses()
        }
    }, [user])
    
    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        calculateChapterTime,
        calculateNoOfLectures,
        calculateCourseDuration,
        enrolledCourses,
        fetchUserEnrolledCourses,
        backendUrl,
        setUserData,
        getToken,fetchAllcourses,
        setIsEducator,
        userData

    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};