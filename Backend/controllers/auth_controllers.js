import { User } from "../models/user_model.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import bcryptjs from 'bcryptjs';
import {sendVerificationEmail,WelcomeEmail,sendPasswordResetToken, sendPasswordResetSuccess} from "../mailTrap/emails.js"

 
export const signup=async (req,res)=>{
    try{
        const{email,password,name}=req.body;
        console.log(req.body);

        if(!email || !password || !name)
        {
           throw new Error("All Feilds are required")
        }
        const userExists=await User.findOne({email});
        if(userExists)
        {
           return res.status(400).json({success:false,message:"User already exists"})
        }
        const hashedPassword=await bcryptjs.hash(password,10);
        const verificationToken=Math.floor(100000+Math.random()*900000).toString();
        const user=new User({
            email,
            password:hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt:Date.now() + 24*60*60*1000
        })

        await user.save();

        //jwt
        generateTokenAndSetCookies(res,user._id);

        await sendVerificationEmail(user.email,verificationToken);

        res.status(201).json({
            success:true,
            message:"verification sent successfully",
            user: {
				...user._doc,
				password: undefined,
			},
        })
    }catch(err)
    {
        res.status(400).json({success:false,message:err.message})
    }
}

export const login=async (req,res)=>{
    const {email,password}=req.body;
    try{
        if(!email || !password)
        {
            return res.status(400).json({success:false,message:"All feilds are required"})
        }
        const user=await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({success:false,message:"Invalid credentials"})
        }
        const pass=await bcryptjs.compare(password,user.password);
        if(!pass)
        {
            return res.status(400).json({success:false,message:"Invalid credentials"})
        }

        generateTokenAndSetCookies(res,user._id);
        user.lastLogin=new Date()
        await user.save()

        res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
    }catch(error)
    {
        return res.status(400).json({success:false,message:error.message})
    }

}

export const logout=async (req,res)=>{
    res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const verify=async(req,res)=>{
    //verification code
    const{code}=req.body;
    try{
        if(!code)
        {
            return res.status(400).json("Code is required");
        }
        const user=await User.findOne({
            verificationToken:code,
            verificationTokenExpiresAt:{$gt:Date.now()}
        })
        if(!user)
        {
            return res.status(400).json({success:false,message:"Invalid verification code "})
        }
        user.isVerified=true
        user.verificationToken=undefined
        user.verificationTokenExpiresAt=undefined
        await user.save()

        await WelcomeEmail(user.email,user.name)
        res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
    }catch(err)
    {
        return res.status(400).json({success:false,message:err.message})
    }
}

export const forgot=async(req,res)=>{
    const{email}=req.body
    try
    {
        const user=await User.findOne({email})
        if(!user)
        {
            return res.status(400).json({success:false,message:"User not found"});
        }

        const resetToken=Math.random()*100000
        const resetTokenExpiresAt=Date.now() +1*60*60*1000
        user.resetPasswordToken=resetToken;
        user.resetPasswordExpiresAt=resetTokenExpiresAt;

        await user.save();

        //send email
        await sendPasswordResetToken(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`)
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    }catch(err)
    {
        return res.status(500).json({success:false,message:err.message});
    }
}

export const reset=async(req,res)=>{
    const{password}=req.body
    const{token}=req.params

    try{

        const user=await User.findOne({
            resetPasswordToken:token,
            resetPasswordExpiresAt:{$gt:Date.now()}
        })
        if(!user)
        {
            res.status(400).json({success:false,message:"Token problem"})
        }

        const newHashedPassword=await bcryptjs.hash(password,10);
        user.password=newHashedPassword
        user.resetPasswordExpiresAt=undefined
        user.resetPasswordToken=undefined
        await user.save()

        console.log("Password changed successfully");

        await sendPasswordResetSuccess(user.email)

        console.log("Password Reset success mail sent successfully")
        return res.status(200).json({ success: true, message: "Password reset to your email" });

    }catch(err)
    {
        return res.status(500).json({success:false,message:err.message});
    }
}

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};