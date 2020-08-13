const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true
    },
    lastName : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['ADMIN', 'BASIC'],
        default: 'BASIC'
    },
   cart: {
       items:[
           {
               productId: {type:mongoose.Schema.Types.ObjectId,ref: "Product", required: true},
               quantity: {type: Number, required: true}
           }
       ]
   },
   resetToken:{
       type:String
   },
   resetExp:{
       type:String
   }
});

module.exports = mongoose.model("User",userSchema);