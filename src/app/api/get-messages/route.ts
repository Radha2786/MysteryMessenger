import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request:Request){
 await dbConnect();
 console.log("inside get messages", request);
 const session = await getServerSession(authOptions);
 const _user: User = session?.user;

//  console.log("session inside get messages", session)
//  console.log("_user inside get messages", _user)

 if(!session || !_user){
     return Response.json({success:false, message:"Unauthorized"}, {status:401});
 }
//  console.log("user in session is", _user);

//  const userId = user._id; // ye id actually m ek string hai which will create issue in aggregation pipeline so we need to convert it to mongoose ka object id 
const userId = new mongoose.Types.ObjectId(_user._id);

// console.log("userId inside get-messages is", userId);

try{
    const user = await UserModel.aggregate([
        { $match : { _id : userId}},
        {$unwind : {path: '$messages', preserveNullAndEmptyArrays: true}},
        {$sort: {'messages.createdAt': -1}},
        {$group:{_id: '$_id', messages:{$push: '$messages'}}},
    ]).exec();

    // console.log("user inside getMessage is", user);
    // console.log("user[0].messages inside getMessage is", user[0].messages);

    if(user[0].messages.length==0){
        return Response.json({success:true, message:"No messages found"}, {status:404});
    }else if(!user || user.length === 0){
        return Response.json({success:false, message:"User not found"}, {status:404});
    }

    // see the return type from aggregation pipeline

    return Response.json({success:true, 
        messages: user[0].messages}, 
        {status:200});

} catch (error){
    return Response.json({success:false, message:"Error getting messages"}, {status:500});
}
}