import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        mongoose.connection.on("connected",()=>console.log("Database Connected..."));
        await mongoose.connect(`${process.env.MONGODB_URI}`) //it will connect to the uri and create a database named as neuroChat if not created before.
    }catch(err){
        console.log(err);
    }
}

export default connectDB;