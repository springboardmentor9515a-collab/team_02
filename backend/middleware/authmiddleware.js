const jwt =require("jsonwebtoken");
require("dotenv").config();
const secret =process.env.jwtsecret;

async function verifyuser(req,res,next){
    const header= req.headers["authorization"];
    if(!header) throw new Error("No token received");

  const token =header.split(" ")[1];
  const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ message: "Token is invalidated" });

  jwt.verify(token,secret,(err,decode)=>{
        if (err) throw new Error("invalid token");
        req.userid =decode.id;
        next();

  });

}
module.exports=verifyuser;
