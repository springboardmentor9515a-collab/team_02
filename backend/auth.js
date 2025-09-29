const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const axios = require("axios");

require("dotenv").config();

const secret =process.env.jwtsecret;
const userschema=new mongo.Schema({
    name: {type:String ,required:true},
    email: {type:String ,required:true},
    password: {type:String ,required:true},
    location: {type:String ,required:true},
    role: {type:String ,enum:['Citizen',"Official"],required:true}
});
const user =mongo.model("user",userschema)

async function city(lat,long){

    try{
        const url=`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
         const res = await axios.get(url, {
      headers: { "User-Agent": "Infosys/1.0" } 
    });
    return res.data.address.city||res.data.address.town||res.data.address.village||"unknown";
    }catch(err)
    {console.log("city not known");
        return "unknown"
    }
}



async function signup({name,email,password,lat,long,role}) {
        let existuser=await user.findOne({email});
        if (existuser) throw new Error("user already exist");
        
        const hashpd= await bcrypt.hash(password,11);
        const cityname = await city(lat,long);
        let newuser=new user({name,email,password:hashpd,location:cityname,role});
        await newuser.save();
   const token= jwt.sign({id:newuser._id},secret,{expiresIn:"1hr"});
   return {token};
   }

   
    
async function signin({email,password}) {
    const existuser=await user.findOne({email});
    if(!existuser) return {error:"user not exist "}

        const pd=await bcrypt.compare(password,existuser.password)
        if (!pd) return {error:"incorrect password"};
        const token =jwt.sign({id:existuser._id},secret,{expiresIn:"1hr"} );
        return {token};

}
module.exports={signin,signup,user};
