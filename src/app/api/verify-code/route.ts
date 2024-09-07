import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest } from "next/server";
import z from 'zod'

export async function POST(request: Request){
    await dbConnect();

    try{
      const {username,code} = await request.json();
      const decodedUsername = decodeURIComponent(username);
     const user =  await UserModel.findOne({username});
     if(!user){
        return Response.json({
            success:false,
            message:"user does not exist"
        },
        {status: 500}
    )
     }
     if(user.verifyCode == code && new Date(user.verifyCodeExpiry) > new Date()){
        user.isVerified = true;
        await user.save();
        return Response.json({
            success:true,
            message:"user verified successfully"
        },  
        {status: 200}
    )
     }else if(new Date(user.verifyCodeExpiry) < new Date()){
        // code has expired
        return Response.json({
            success:false,
            message:"verification code expired. Please sign Up to get a new code"
        },
        {status: 400}
    )
     }else{
        return Response.json({
            success:false,
            message:"invalid verification code"
        },
        {status: 400}
    )
     }
    } catch(error){
        console.log("error verifying user", error);
        return Response.json({
            success:false,
            message:"error verifying username"
        },
        {status: 500}
    )
    }
}