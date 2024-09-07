// har ek routes ke liye db connection lagega

import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';

import { sendVerificationemail } from '@/helpers/sendVerificationEmail';

import UserModel from '@/model/User';

export async function POST(request: Request){
    await dbConnect();
    console.log("request",request);
    console.log("inside post route of sign up");
    try{
        const {username,email, password} = await request.json(); 

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "username already exists"
            },{
                status: 400
            })
        }
        const existingUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success : false,
                    message : "email already exists",
                },{status : 400}
            );
            }else{
                // email exist kr rha h but verified nahi hai
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry time for verification link
                await existingUserByEmail.save();
            }

        }else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const expirydate = new Date();
            expirydate.setHours(expirydate.getHours() + 1); // 1 hour expiry time for verification link 
            const newUser=new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expirydate,
                isVerified:false,
                isAccceptingMessage:true,
                messages:[]
            })

            await newUser.save();
            console.log("new user",newUser);
        }
        // send verfification email
        const emailResponse = await sendVerificationemail(
            email,
            username,
            verifyCode
        );
        // console.log(emailResponse);
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message,
            },{status: 500}
        );
        }
        return Response.json({
            success: true,
            message:" user registered successfully, please verify your email to login"
        },{status: 201});
        
    } catch(error){
        console.error("error registering user:", error);
        return Response.json({
            success: false,
            message: "error registering user"
        },
    {
        status: 500
    })
    }
   
}