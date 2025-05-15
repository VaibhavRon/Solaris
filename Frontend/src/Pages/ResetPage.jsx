import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import Input from "../components/Input";
import {Lock} from 'lucide-react'
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPage(){
    const[password,setPassword]=useState("");
    const[confirmPassword,setConfirmPassword]=useState("");
    const{reset,error}=useAuthStore();

    const {token}=useParams();
    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(password!==confirmPassword)
        {
            alert("Passwords do not match")
            return;
        }
        try{
            console.log("Submitting reset request..."); 
        await reset(token, password);
        console.log("Password reset successful"); 

        setTimeout(() => {
            console.log("Navigating to login page...");
            navigate("/login");
        }, 2000);
        }catch(e)
        {
            console.log(e);
        }
    }
    return(
        <>
            <motion.div
        initial={{opacity:0,y:40}}
        animate={{opacity:1,y:0}}
        transition={{duration:1.0}}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur rounded-2xl shadow-xl"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500">
                   Set New Password
                </h2>

                <form onSubmit={handleSubmit} >
                <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />
                <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                />
                {error && <p className='text-red-500 font-semibold mt-2'>{error}</p> }
                    <motion.button
						className='mt-5 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type='submit'
					>
						Submit
					</motion.button>
                </form>
            </div>
        </motion.div>
        </>
    )
}