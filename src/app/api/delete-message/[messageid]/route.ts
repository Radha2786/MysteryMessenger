import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";
import UserModel from "@/model/User";

export async function DELETE(request: Request, {params}:{params:{messageid:string}}){
   
    const messageid = params.messageid;
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user : User = session?.user;
    if(!session || !_user){
     return Response.json({success:false, message:"Unauthorized"}, {status:401});
    }

    try{
        const updateResult = await UserModel.updateOne(
            {_id: _user._id},
            {$pull :{ messages: { _id: messageid}}}
        );

    if(updateResult.modifiedCount==0){
        return Response.json({success:false, message:"message does not exist or already deleted"}, {status:400})
    }

    return Response.json({success:true,message:"Message deleted", status:200})

    } catch(error){
        console.log("Error is delete message route", error);
        return Response.json({success:false, message:"Error deleting message"}, {status:500});

    }


}