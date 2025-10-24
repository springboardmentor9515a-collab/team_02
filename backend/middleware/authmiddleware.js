const jwt =require("jsonwebtoken");
require("dotenv").config();
const Blacklist = require("../model/blacklist"); 
const secret =process.env.jwtsecret;

async function verifyUser(req,res,next){
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

function verifyRole(requiredRoles) {
  return (req, res, next) => {
    const { role } = req.user;
    if (!requiredRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}
module.exports={verifyUser,verifyRole};
