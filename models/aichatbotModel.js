const mongoose = require("mongoose");

const aiChatbotSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  chatbotname: { type: String, required: true },
  chatbotlogo: { type: String },
  chatbotcontent: { type: String, required: true },
  chatbotcreatedat: { type: Date, default: Date.now },
  chatbotID: { type: String, required: true },
  chatbotRefID: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" }, // optional link
  tags: { type: [String], default: [] },
  faqs: [
    {
      question: String,
      answer: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIChatbotData", aiChatbotSchema);
