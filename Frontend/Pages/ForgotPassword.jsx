import { motion } from "framer-motion"
import { useAuthStore } from "../store/authStore"
import {Mail} from 'lucide-react'
import { useState } from "react";
import Input from "../components/Input";
import { Link } from "react-router-dom";

export default function ForgotPassword(){
    const[email,setEmail]=useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const{message,error,forgot} = useAuthStore();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            setIsDisabled(true); 
            setTimeout(() => {
                setIsDisabled(false);
            }, 4000);
            await forgot(email);
        }catch(err)
        {
            console.log(err)
        }
    }
    return(
        <>
        <motion.div
         initial={{opacity:0,y:40}}
         animate={{opacity:1,y:0}}
         transition={{duration:1.0}}
         className="max-w-md w-full p-10 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur rounded-2xl shadow-xl"
        >
            <div className="p-8">
            <h2 className="text-3xl py-2 font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                 Registered Email
                </h2>
                <form onSubmit={handleSubmit}>
                <Input
                icon={Mail}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                />
                {message && <p className="text-green-500 font-semibold m-3">{message}</p>}
                {error && <p className="text-red-500 font-semibold m-2">{error}</p>}
                    <motion.button
						className={`mt-3 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200  ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type='submit'
                        disabled={isDisabled}
					>
						Submit
					</motion.button>
                </form>
                </div>
                <div className='px-8 py-4 m-5 bg-gray-900 bg-opacity-50 flex justify-center rounded-b-xl'>
				<p className='text-sm text-gray-400'>
					Return to Login{" "}
					<Link to={"/login"} className='text-blue-400 hover:underline'>
						Login
					</Link>
				</p>
			</div>
        </motion.div>
        </>
    )
}