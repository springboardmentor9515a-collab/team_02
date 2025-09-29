const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const express=require("express")
const {signin,signup,user}= require("./auth")
const bodyParser = require("body-parser")
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const route =express();
route.use(bodyParser.json());
route.use(cors());
const verifyUser = require("./middleware/authmiddleware");
const { error } = require("console")
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
const PORT = 5000;
route.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
