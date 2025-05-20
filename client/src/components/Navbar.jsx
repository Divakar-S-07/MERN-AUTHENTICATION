import React from 'react'
import { assets } from '../assets/assets'
import {useNavigate} from 'react-router-dom';

const Navbar = () => {
  const Navigate = useNavigate();
  return (
    <div className='absolute top-0 flex justify-between w-full sm:p-6 sm:px-24'>
        <img src={assets.logo} alt="" className='w-28 sm:w-32'/>
        
        <button onClick={()=>Navigate("/login")} className='flex items-center gap-2 px-6 py-2 text-gray-800 transition-all border border-gray-500 rounded-full hover:bg-gray-100'>Login <img src={assets.arrow_icon} alt="" /></button>
    </div>
  )
}

export default Navbar