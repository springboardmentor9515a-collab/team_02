const mongo = require("mongoose");

const userschema=new mongo.Schema({
    name: {type:String ,required:true},
    email: {type:String ,required:true},
    password: {type:String ,required:true},
    location: {type:String ,required:true},
    role: {type:String ,enum:['Citizen','volunteer',"Official"],required:true},
     otp: { type: Number },
    otpExpiry: { type: Date }
});
const user =mongo.model("user",userschema);
module.exports=user;
