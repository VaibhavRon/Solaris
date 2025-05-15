import {motion} from 'framer-motion'
import {Mail,Lock} from 'lucide-react'
import { useState } from 'react';
import Input from '../components/Input'
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


export default function Login(){
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState(""); 
    const{login,error}=useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await login(email,password);
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
            <h2 className="text-3xl py-2 font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-500">
                   Log In
                </h2>

                <form onSubmit={handleSubmit} >
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
                <div className='flex mb-4'>
						<Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>
							Forgot password?
						</Link>
					</div>
                {error && <p className='text-red-500 font-semibold mb-'>{error}</p>}
                    <motion.button
						className='mt-3 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-500
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type='submit'
					>
						Log In
					</motion.button>
                </form>
            </div>
            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center rounded-b-xl'>
				<p className='text-sm text-gray-400'>
					Dont have an account?{" "}
					<Link to={"/signup"} className='text-blue-400 hover:underline'>
						SignUp
					</Link>
				</p>
			</div>
        </motion.div>
        </>
    )
}