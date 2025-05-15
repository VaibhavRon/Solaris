import jwt from "jsonwebtoken"

export const generateTokenAndSetCookies=(res,userId)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d",
    })
    
    res.cookie("token",token,{
        httponly:true,
        secure:process.env.NODE_ENV==="production",
        samesite:"strict",
        maxage:7*24*60*60*1000,
    })
    return token;
}