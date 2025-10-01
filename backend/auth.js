const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const axios = require("axios");
const Blacklist = require("./model/blacklist");
require("dotenv").config();

const secret =process.env.jwtsecret;
const userschema=new mongo.Schema({
    name: {type:String ,required:true},
    email: {type:String ,required:true},
    password: {type:String ,required:true},
    location: {type:String ,required:true},
    role: {type:String ,enum:['Citizen',"Official"],required:true},
    resettoken:{type:String},
resettokenexpiry:{type:Date}
});
const user =mongo.model("user",userschema);


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

async function resetpassword(req,res){
    const {token}= req.params;
    const {newpassword}=req.body;
      if (!newpassword) return res.status(400).json({ message: "New password is required" });
    try{
        const decoded=jwt.verify(token,secret);
        const euser = await user.findOne({
            _id:decoded.id,
            resettoken:token,
            resettokenexpiry:{$gt:Date.now()}
        });
        if(!euser) return res.status(400).json({message:'invalid token'});
        const timer= await bcrypt.genSalt(11);
        euser.password=await bcrypt.hash(newpassword,timer);
        euser.resettoken=undefined;
        euser.resettokenexpiry=undefined;
        await euser.save();

        res.json({message:'Password has been reset successfully'});

    }catch(err){
        res.status(400).json({message:'invalid token '});
    }
}
async function logout(req, res) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const decode = jwt.decode(token);
    const expiryDate = new Date(decode.exp * 1000); 
    await Blacklist.create({ token, expiry: expiryDate });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
}

module.exports={signin,signup,user,resetpassword,logout};
