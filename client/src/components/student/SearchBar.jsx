import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({ data }) => {
  const navigate = useNavigate()
  const [input, setInput] = useState(data ? data : '')
  const onsearchHandler = (e) => {
    e.preventDefault();
    navigate('/course-list/' + input)
  }

  return (


    <form onSubmit={onsearchHandler} className='max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-blue-200  backdrop-blur-xl shadow-sx  rounded-full'>
      <img src={assets.search_icon} alt="search_icon"
        className='md:w-auto w-10 px-3' />
      <input
        onChange={e => setInput(e.target.value)}
        value={input}
        type="text" placeholder='What do you want to learn today?' className='w-full h-full outline-none text-gray-500/80' />
      <button type='submit' className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full text-white md:px-10 px-7 md:py-3 py-2 mx-1'>Search</button>
    </form>

  )
}

export default SearchBar