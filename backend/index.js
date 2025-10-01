const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const express=require("express")
const {signin,signup,user,sendResetEmail,resetpassword,logout}= require("./auth")
const bodyParser = require("body-parser")
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const route =express();
const Blacklist = require("./model/blacklist");
route.use(cors());
const verifyUser = require("./middleware/authmiddleware");
const { error } = require("console")
route.use(express.json());

mongo.connect(process.env.mongourl).then(()=> console.log("mongodb connected")).
    catch(e=>console.error(e));

const secret = process.env.jwtsecret;
if (!secret) throw new Error("JWT secret is not defined");

route.post("/signup",async(req ,res )=>{
  try {  const signedup = await signup(req.body);
    res.json(signedup);
  } catch (err) {
    console.error("Signup error:", err); 
    res.status(400).json({ error: "Try again later" }); 
  }
}
);  

route.post("/signin",async(req ,res )=>{
  try {  const signedin = await signin(req.body);

    if (signedin.error){
      return res.status(400).json({error:signedin.error})
    }
    res.json(signedin);
  } catch (err) {
    console.error("Signin error:", err); 
    res.status(400).json({ error: "Try again later" }); 
  }
});
route.post("/requestreset",async(req,res)=>{
  const {email}= req.body;
  const etuser=await user.findOne({email});
  if(!etuser) return res.status(400).json({message:"user not found"});
  const token =jwt.sign({id:etuser._id},secret,{expiresIn:"1hr"});
  etuser.resettoken=token;
  etuser.resettokenexpiry=Date.now()+3600000;
  
  await etuser.save();
  res.json({message:"reset token generated",token});
})
route.put("/resetpassword/:token",resetpassword);

route.get("/dashboard",verifyUser,async(req,res)=>{
    try {
      const currentuser= await user.findById(req.userid).select("-password");
      if(!currentuser) return res.status(400).json({error:"user not found"});
      res.json(currentuser);

    } catch (error) {
      console.log(error);
      res.status(400).json({error:"server error"});
    }
});
route.delete("/deleteuser", verifyUser, async (req, res) => {
  try {
    const userId = req.userid;

    await user.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});
route.post("/logout",async (req,res)=>{
   try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const decoded = jwt.decode(token);
    const expiryDate = new Date(decoded.exp * 1000); 

    await Blacklist.create({ token, expiry: expiryDate });
    res.json({message:"Logged out successfully"});

  } catch (error) {
    res.status(500).json({message:"logout failed"});
    
  }
});
const PORT = 5000;
route.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
