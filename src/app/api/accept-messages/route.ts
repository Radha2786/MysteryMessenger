import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user : User = session?.user;

    if(!session || !session.user){
        return Response.json({success:false, message:"Unauthorized"}, {status:401});
    }

    const userId = user._id;
    const {acceptMessages} = await request.json();

    try{
         // Update the user's message acceptance status
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: acceptMessages},
            {new:true}
        );
        if(!updatedUser){
            return Response.json({success:false, message:"Unable to find user to update message acceptance status"}, {status:404});
        }
        return Response.json({success:true,message:"Message acceptance status updated successfully"}, {status:200});
    } catch(error){
        console.log("error upadting message status", error);
        return Response.json({success:false, message: "Error updating message acceptance status"}, {status:500});
    }
}

// to get ki user messages accept kar raha hai ya nahi
export async function GET(request:Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user : User = session?.user;
    
    if(!session || !session.user){
        return Response.json({success:false, message:"Unauthorized"}, {status:401});
    }
    const userId = user._id;
    try{
        const founduser = await UserModel.findById(userId);
        if(!founduser){
            return Response.json({success:false, message:"User not found"}, {status:404});
        }
        console.log("found user is", founduser);
        console.log("foundUser is accepting msgs", founduser.isAcceptingMessages);
        return Response.json({success:true, message: "Message acceptance status retrieved successfully", isAcceptingMessages: founduser.isAcceptingMessages}, {status:200});

    } catch(error){
        console.log("error getting message status", error);
        return Response.json({success:false, message: "Error getting message acceptance status"}, {status:500});
    }

}


