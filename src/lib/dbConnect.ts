import mongoose from "mongoose";

// database ke connection ke baad jo object humare paas aa rha h usme se hume kya values chahiye uska data type kya rkhna hai
type ConnectionObject = {
    isConnected?: number;
}
// ye value optional hai but agar aayegi to number format m hi aayegi

const connection : ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log('Already connected to database');
        return 
    }

    try{
       const db= await mongoose.connect(process.env.MONGODB_URI || '',{})
       console.log(db);
       console.log(db.connections)
       connection.isConnected = db.connections[0].readyState;

       console.log('Connected to database successfully');
        
    } catch(error){
        console.log('Error connecting to database',error);
        process.exit(1); // to know more about process.exit(1) visit https://nodejs.org/api/process.html#process_process_exit_code
    }
}

export default dbConnect;