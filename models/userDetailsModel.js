const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userDetailsSchema);
