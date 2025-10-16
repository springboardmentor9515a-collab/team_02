const mongo = require("mongoose");

const petitionSchema = new mongo.Schema({
  creator: {
    type: mongo.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  summary: {
    type: String,
    trim: true,
    
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  targetAuthority: {
    type: String,
    required: true, 
    trim: true,
    maxlength: 150,
  },
  signatureGoal: {
    type: Number,
    required: true,
    default: 100, 
    min: 1,
  },
  signaturesCount: {
    type: Number,
    default: 0, 
  },
  status: {
    type: String,
    enum: ["Active", "Trending", "Closed"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Petition = mongo.model("petition", petitionSchema);
module.exports = Petition;
