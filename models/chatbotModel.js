const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  chatbotname: { type: String, required: true },
  chatbotlogo: { type: String },
  chatbotcontent: { type: String },
  chatbotcreatedat: { type: Date, default: Date.now },
  chatbotmodifiedat: { type: Date, default: Date.now }, // 🕒 New field!
  chatbotID: { type: String  },
  tags: { type: [String], default: [] },
  faqs: {
    type: [
      {
        question: String,
        answer: String,
      },
    ],
    default: [],
  },
  // 🆕 Add chatbot color theme
  // 🆕 Two-color gradient support
  chatbotFromColor: {
    type: String,
    default: "#4f46e5", // indigo
  },
  chatbotToColor: {
    type: String,
    default: "#ec4899", // pink
  },

    // 🆕 Chatbot name text color
  chatbotNameColor: { type: String, default: "#ffffff" }, // default white
});

// ✅ Export correctly using CommonJS
module.exports = mongoose.model("Chatbot", chatbotSchema);
//That string "Chatbot" automatically creates/uses a MongoDB collection named: