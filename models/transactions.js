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
    }
});

module.exports= mongoose.model('Transaction',TransactionSchema);


