import express from 'express';
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes.js';
import webhooks from './routes/webhooks.js';

const app = express();

//connection to the databse
await connectDB(); 

//middlewares
app.use(cors());

app.use("/api/webhook", webhooks );

app.use(express.json()); 


//routes
app.get("/",(req,res)=>res.send("server is live."));
app.use("/api/user",userRouter);
app.use("/api/chat",chatRouter);
app.use('/api/message',messageRouter);
app.use("/api/credit/",creditRouter);

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log("Server Started at port: ",port);
});