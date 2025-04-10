import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth,useUser} from '@clerk/clerk-react'

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate =useNavigate()

    const {getToken}=useAuth()
    const {user}=useUser()
    const [allCourses, setallCourses] = useState([])
    const [isEducator, setIsEducator] = useState(true)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    
    //Fetch all courses 
    const fetchAllcourses = async () => {
        setallCourses(dummyCourses)
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
        return totalRating / course.courseRatings.length;
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
    setEnrolledCourses(dummyCourses)
}
    useEffect(() => { fetchAllcourses() 
        fetchUserEnrolledCourses()
    }, [])

    const logToken=async ()=>{
        console.log(await getToken());
    }
    useEffect(() => {
        if (user) {
            logToken();
        }
    }, [user]); // <- This ensures the effect runs again when user is available
    
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
        fetchUserEnrolledCourses

    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};