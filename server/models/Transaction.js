import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId : {type:mongoose.Schema.Types.ObjectId, required:true,ref:"User"}, ///it is referencing the the user id;
    planId:{type:String,required:true},
    amount:{type:Number,required:true},
    credits:{type:Number,required:true},
    isPaid:{type:Boolean,required:true}
},{timestamps:true});

const Transaction  = mongoose.model("Transaction",transactionSchema);

export default Transaction;