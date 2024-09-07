import mongoose , {Schema, Document} from 'mongoose';

export interface Message extends Document {
    content:string;
    createdAt: Date;
}

// ye jo interface hai ye jayega to database m hi to basically it is reprenting schema of mongoose document so here we are using type Document of mongoose
//  and we are defining the schema of the document in the interface so that we can use it in the future for the type checking and other stuffs like that 

const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry:Date,
    isVerified: boolean;
    isAcceptingMessages:boolean;
    messages: Message[];
}

// User Schema 
/**
 * Represents the schema for the User model.
 */
const UserSchema:Schema<User> = new Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  'Invalid email address'],

        // write a simple regex for email validation
        },
        password:{
            type:String,
            required:[true,'Password is required'],
        },
        verifyCode:{
            type:String,
            required:[true,'Verification code is required'],
        },
        verifyCodeExpiry:{
            type:Date,
            required:[true,'Verification code expiry is required'],
            },
            isVerified:{
                type:Boolean,
                required:true,
                default:false,
            },
            isAcceptingMessages:{
                type:Boolean,
                required:true,
                default:true,
            },
            messages:[MessageSchema],
        })

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;