import { VERIFICATION_EMAIL_TEMPLATE,PASSWORD_RESET_REQUEST_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE  } from "./emailTemplates.js";
import { client,sender } from "./mailtrap.js";

export const sendVerificationEmail=async (email,verificationToken)=>{
    const recipient=[{email}]
    try{
        const response=await client.send({
            from:sender,
            to:recipient,
            subject:"verify your email",
            html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category:"email verification"
        })
        console.log("Verification Email sent successfully",response);
    }
    catch(err)
    {
        console.log("Error sending verification",err);
        throw new Error(`error sending verification email ${err}`)

    }
}

export const WelcomeEmail=async (email,name)=>{
    const recipient=[{email}]
    try{
        const response=await client.send({
            from:sender,
            to:recipient,
            template_uuid:"efc6b679-e5c4-47db-86a5-d80bfd2dfe9a",
            template_variables:{
                "name": name,
                "company_info_name": "Auth company"
              }
        })
        console.log("Welcome Email sent successfully",response);
}catch(err)
{
    console.log("Error sending Welcome",err);
    throw new Error(`error sending Welcome email ${err}`)
}
}

export const sendPasswordResetToken=async(email,resetUrl)=>{
    const recipient=[{email}]
    try{
            const response=await client.send({
                from:sender,
                to:recipient,
                subject:"Reset password email",
                html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetUrl),
                category:"password reset"
            })
            console.log("reset Email sent successfully",response);
    }catch(err)
    {
        console.log("Error sending password reset email",err);
        throw new Error(`error sending password email ${err}`)
    }
}

export const sendPasswordResetSuccess=async(email)=>{
    const recipient=[{email}]
    try{
        const response=await client.send({
            from:sender,
            to:recipient,
            subject:"Reset password Success email",
            html:PASSWORD_RESET_SUCCESS_TEMPLATE,
            category:"password reset Success"
        })
        console.log("reset Password done successfully",response);
}catch(err)
{
    console.log("Error sending password reset success email",err);
    throw new Error(`error sending reset password success email ${err}`)
}
}