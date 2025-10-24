const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const express=require("express")
const {signin,signup,requestReset,resetpassword,logout}= require("./auth")
const user= require("./model/user")
const bodyParser = require("body-parser")
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const route =express();
const Blacklist = require("./model/blacklist");
route.use(cors());
const {verifyUser} = require("./middleware/authmiddleware");
const { error } = require("console")
route.use(express.json());
const Volunteer = require("./model/volunteer");
const petitionAssignment = require("./model/assignment"); 
const complaintRoutes = require("./route/complaint");
const  petitionRoutes=require("./route/petititon");
const pollRoutes= require("./route/poll")
const verifyOfficial=require("./middleware/verifyofficial")
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
route.post("/requestreset", async (req, res) => {
    try {
        await requestReset(req, res); 
    } catch (err) {
        console.error("Request reset error:", err);
        res.status(500).json({ error: "Failed to send OTP" });
    }
});


route.post("/resetpassword", async (req, res) => {
    try {
        await resetpassword(req, res); 
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Failed to reset password" });
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
route.delete("/deleteuser", verifyUser, async (req, res) => {
  try {
    const userId = req.userid;

    await user.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

route.post("/volunteerregister", verifyUser, async (req, res) => {
  try {
    const { skills, preferredContact } = req.body;

    if ( !skills || !preferredContact) {
      return res.status(400).json({ message: "All volunteer fields are required." });
    }
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const volunteer = new Volunteer({
      name: currentUser.name,
      email: currentUser.email,
      password: currentUser.password,
      location: currentUser.location,
      roles:[currentUser.role],
      skills,
      preferredContact,
      registrationCompleted: true,
    });

    await volunteer.save();
    currentUser.role = "volunteer";
    await currentUser.save();
    res.status(201).json({
      message: "Volunteer registration completed successfully!",
      volunteer,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error during volunteer registration",
      error: err.message,
    });
  }
});
route.use("/petition",petitionRoutes);
route.use("/complaint", complaintRoutes);
route.use("/polls", pollRoutes);

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
const port = process.env.PORT;
route.listen(port, () => console.log(`Server running on http://localhost:${port}`));
