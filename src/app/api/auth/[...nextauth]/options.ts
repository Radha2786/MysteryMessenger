// options -- credentials -- pages 
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/model/User"

export const authOptions : NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
              },
              async authorize(credentials:any): Promise<any> {
                await dbConnect();
                try{
                    const user = await UserModel.findOne({
                        // finding user by email or username (using both just for the sake of future improvement)
                        $or:[
                            {email:credentials.identifier},   // credentials.identifier.email se email access ho payega but bcz of ES6 we can write it as credentials.identifier
                            {username: credentials.identifier}
                        ]
                    })
                    if(!user){
                        throw new Error("No user found with this email");
                    }
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )
                    if(isPasswordCorrect){
                        return user;
                    }else{
                        throw new Error("Password is incorrect");
                    }
                }catch(error:any){
                    throw new Error(error);
                }
              }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || '',
            clientSecret: process.env.GOOGLE_SECRET || ''
          })
    ],
    callbacks:{
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && user && profile) {
                await dbConnect();
                let userDoc:any;
                try {
                    const existingUser = await UserModel.findOne({
                        email: profile.email
                    })

                    if (!existingUser) {
                        const newUser = await UserModel.create({
                            email: profile.email,
                            username: profile.name,
                            isVerified: true,
                            isAcceptingMessages: true,
                            verifyCode: "12345",
                            verifyCodeExpiry: new Date(),
                            password: bcrypt.hashSync((Math.random() * 18).toString(), 10),
                            messages: []
                        });

                        if (!newUser) {
                            throw new Error("Failed to create user");
                        }
                        userDoc = newUser;
                    }
                    else{
                        userDoc = existingUser;
                    }
                } catch (error: any) {
                    console.log(error);
                    throw new Error(error);
                }

                // IMPORTANT: Pass the user document to the JWT callback
                user._id = userDoc._id.toString();
                user.isVerified = userDoc.isVerified;
                user.isAcceptingMessages = userDoc.isAcceptingMessages;
                user.username = userDoc.username;
            }
            return true;
        },

        async jwt({ token, user}) {
            // ye user vo hai jo humne upar return kiya hai authorize function me 
            if(user){
                token._id = user._id?.toString();  // Convert ObjectID to string 
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;

            }
            return token
          },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
          }
        
    },
        // overwriting the default signin page given by nextauth
        pages:{
            signIn: '/sign-in'
        },
    session:{
        strategy:'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
}