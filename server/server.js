import express from 'express';
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();

//connection to the databse
await connectDB(); 

//middlewares
app.use(cors());
app.use(express.json()); 


//routes
app.get("/",(req,res)=>res.send("server is live."));
app.use("/api/user",userRouter);
app.use("/api/chat",chatRouter);
app.use('/api/message',messageRouter);
 
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log("Server Started at port: ",port);
});