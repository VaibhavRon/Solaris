import { useAuthStore } from "../store/authStore"
import { motion } from "framer-motion";

export default function HomePage(){
    const{logout,user,error}=useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await logout();
        }catch(err){
        console.log(err)
      }
      }

    return(
        <div>
           <motion.div
        initial={{opacity:0,y:40}}
        animate={{opacity:1,y:0}}
        transition={{duration:1.0}}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur rounded-2xl shadow-xl"
        >
            <div className="p-8">
            <h2 className="text-3xl py-2 font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">
                  Dashboard
                </h2>
                <motion.div
					className='p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<h3 className='text-xl font-semibold text-green-400 mb-3'>Profile Information</h3>
					<p className='text-gray-300'>Name: {user.name}</p>
					<p className='text-gray-300'>Email: {user.email}</p>
				</motion.div>
                {error && <p className='text-red-500 font-semibold mb-'>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <motion.button
						className='mt-3 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type='submit'
					>
						Logout
					</motion.button>
                </form>
            </div>
        </motion.div>
        </div>
    )
}