import {motion} from 'framer-motion'
import Input from '../components/Input'
import {Mail, User,Lock} from 'lucide-react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useAuthStore } from '../store/authStore';

export default function Signup(){

    const[name,setName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const { signup,error }=useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            await signup(email,password,name);
            navigate("/verify");
        }catch(err){
        console.log(err)
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
                <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-500">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} >
                <Input
                icon={User}
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                />
                 <Input
                icon={Mail}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                />
                <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />
                {error && <p className='text-red-500 font-semibold mt-2'>{error}</p> }
                <PasswordStrengthMeter  password={password}></PasswordStrengthMeter>

                    <motion.button
						className='mt-5 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type='submit'
					>
						Sign Up
					</motion.button>
                </form>
            </div>
            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center rounded-b-xl'>
				<p className='text-sm text-gray-400'>
					Already have an account?{" "}
					<Link to={"/login"} className='text-blue-400 hover:underline'>
						Login
					</Link>
				</p>
			</div>
        </motion.div>
        </>
    )
}