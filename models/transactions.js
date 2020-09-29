const mongoose=require('mongoose');
var TransactionSchema= new mongoose.Schema({
    amount:String,
    timestamp:{ type: Date, default: Date.now },
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    razorpay_payment_id: String,
    razorpay_order_id:String
});

module.exports= mongoose.model('Transaction',TransactionSchema);


