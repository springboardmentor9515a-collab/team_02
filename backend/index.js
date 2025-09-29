const mongo=require("mongoose")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const express=require("express")
const {signin,signup}= require("./backend/auth")
const bodyParser = require("body-parser")
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const route =express();
route.use(bodyParser.json());
route.use(cors());

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
    res.json(signedin);
  } catch (err) {
    console.error("Signin error:", err); 
    res.status(400).json({ error: "Try again later" }); 
  }
});

const PORT = 5000;
route.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));