const mongo = require("mongoose");

const signatureSchema = new mongo.Schema({
  petition: {
    type: mongo.Schema.Types.ObjectId,
    ref: "petition",
    required: true,
  },
  user: {
    type: mongo.Schema.Types.ObjectId,
    ref: "user", 
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const signature = mongo.model("signature", signatureSchema);
module.exports = signature;
