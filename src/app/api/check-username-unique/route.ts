import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest } from "next/server";
import z from 'zod'

// Creating query schema

// creating a simple get method to check whether a provided username is valid or not/ it exists or not

// example of query parameter in the URL is: localhost:3000/api/check-username-unique?username=radha?phone=android

const UsernameQuerySchema = z.object({
    username: usernameValidation,
})

export async function GET(request: Request){
    await dbConnect();
    console.log("request",request); // this will print the request object in the console
     try{
        const {searchParams} = new URL(request.url);
        const queryParams = {
            username: searchParams.get("username")
        }
       const result = UsernameQuerySchema.safeParse(queryParams);
       console.log("result of safeparse", result);
       if(!result.success){
        const usernameErrors = result.error.format().username?._errors || [];
        return Response.json({
            success: false,
            message: usernameErrors.length >0 ? usernameErrors.join(', ') : 'Invalid query Parameters',
        },
        { status: 400}
    )
       }
       const {username} = result.data;
       const existingUser = await UserModel.findOne({username, isVerified: true});
       if(existingUser){
        return Response.json({
            success:"false",
            message: "username already taken",
        },{
            status: 200
        })
       }
         return Response.json({
              success: true,
              message: "username is available"
         },
        {status:200}
    )
     } catch (error){
        console.log("error checking username", error);
        return Response.json({
            success:false,
            message:"error checking username"
        },
        {status: 500}
        )
     }
}