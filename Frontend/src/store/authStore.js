import {create} from 'zustand'
import axios from "axios";


const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";
axios.defaults.withCredentials=true;
export const useAuthStore=create((set)=>({
    user:null,
    isAuthenticated:false,
    error:null,
    isCheckingAuth:true,
    message:null,

    signup:async(email,password,name)=>{
        set({error:null});
        try{
            const response=await axios.post(`${API_URL}/signup`,{email,password,name})
            set({user:response.data.user,isAuthenticated:true})
        }catch(err)
        {
            set({error:err.response.data.message || "Error signing In"})
            throw err;
        }
    },
    login:async(email,password)=>{
        set({error:null});
        try{

            const response=await axios.post(`${API_URL}/login`,{email,password})
            set({
                isAuthenticated:true,
                user:response.data.user,
                error:null,
            })

        }catch(err)
        {
            set({error:err.response.data.message || "Error Login In"})
            throw err;
        }
    },
    logout:async()=>{
        set({error:null})
        try{
            await axios.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false, error: null,message: null});
        }
        catch(err)
        {
            set({error:"error logging out"});
            throw err;
        }
    },
    verifyEmail:async(code)=>{
        set({error:null})
        try{

            const res=await axios.post(`${API_URL}/verify`,{code})
            set({
                isAuthenticated:true,
                error:null,
                user:res.data.user
            })
          
        }catch (error) {
			set({ error: error.response.data.message || "Error verifying email"});
			throw error;
        }
    },
    checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},
    forgot:async(email)=>{
        set({error:null});
        try{
            const resp=await axios.post(`${API_URL}/forgot-password`,{email});
            set({error:null,message:resp.data.message})
        }catch (error) {
			set({ error:error.resp.data.message, isAuthenticated: false,message:null });
		}
    },
    reset: async (token, password) => {
		set({ error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message});
            return response;
		} catch (error) {
			set({
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	}
}))