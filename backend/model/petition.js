const mongo = require("mongoose");

const petitionSchema = new mongo.Schema({
  creator: {
    type: mongo.Schema.Types.ObjectId,
    ref: "User",
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
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
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
  signatures: [
    {
      type: mongo.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  official_response: {
    type: String,
    default: null,
  },
  assigned_to: {
    type: mongo.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: [
      "active",
      "assigned",
      "under_review",
      "responded",
      "closed",
      "resolved",
    ],
    default: "active",
  },
  status_history: {
    type: [
      {
        status: { type: String },
        by: { type: mongo.Schema.Types.ObjectId, ref: "User" },
        note: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  comments: [
    {
      by: { type: mongo.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      at: { type: Date, default: Date.now },
    },
  ],
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Petition = mongo.model("petition", petitionSchema);
module.exports = Petition;
