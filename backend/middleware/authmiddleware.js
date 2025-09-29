const jwt =require("jsonwebtoken");
require("dotenv").config();
const secret =process.env.jwtsecret;

function verifyuser(req,res,next){
    const header= req.headers["authorization"];
    if(!header) throw new Error("No token received");

  const token =header.split(" ")[1];
  jwt.verify(token,secret,(err,decode)=>{
        if (err) throw new Error("invalid token");
        req.userid =decode.id;
        next();



  });

}
module.exports=verifyuser;
