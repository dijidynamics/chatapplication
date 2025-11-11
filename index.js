const express = require('express');
/* express – Loads the Express framework (used to build APIs) */

const multer = require("multer");

const path = require("path");

const cors = require('cors');

const User = require("./models/userDetailsModel")
const mongoose = require('mongoose');

const fs = require("fs");

require("dotenv").config();

const Chatbot = require("./models/chatbotModel");
const AIChatbotData = require("./models/aichatbotModel");
const UserDetails = require("./models/userDetailsModel"); // import your model 
/* cors – Enables Cross-Origin Resource Sharing (frontend & backend) */
const app = express();
/* Initializes an instance of an Express application */
app.use(cors());
/* app.use(cors()) – Allows requests from your frontend (even from different ports) */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* app.use(express.json()) – Parses JSON data in incoming requests (e.g., form data) */

// Serve static files from public folder
app.use("/public", express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI)

.then(() => {
    console.log("connected to mongodb");
})
.catch((err) => {
    console.error("mongodb connection error:", err);
});

//req → contains the data sent from frontend (React).
//res → used to send a response back to the frontend.

app.post("/api/chatbots", async (req, res) => {
  try {
    const chatbotData = req.body // data comes from frontend
        const newChatbot = new Chatbot(chatbotData);
    await newChatbot.save();
    res.status(201).json({ message: "Chatbot saved successfully!", chatbot: newChatbot });

 } catch (error) {
    console.error("Error saving chatbot:", error);
    res.status(500).json({ message: "Failed to save chatbot", error });
  }

})

//testing openai
app.get("/api/openai/test", async (req, res) => {
  try {
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: "Write a short greeting from an AI chatbot.",
    });

    const message = response.output[0].content[0].text;
    res.json({ success: true, message });
  } catch (err) {
    console.error("OpenAI Test Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.post("/api/openai/generate-data", async (req, res) => {
  try {
    const { chatbotcontent } = req.body;
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are an assistant that helps generate chatbot setup data.
Given the following content:
"""${chatbotcontent}"""
Generate:
1️⃣ One short heading (max 10 words)
2️⃣ 4 to 5 relevant tags (each 1-2 words)
3️⃣ One relevant question and answer.
Return as a JSON object with keys: heading, tags (array), and faqs.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });
       // 🧠 Log the full model output for debugging
    console.log("🔹 Raw OpenAI response:", response.output_text);

    let outputText = response.output[0].content[0].text;
    // Clean any code block formatting
    outputText = outputText.replace(/```json|```/g, "").trim();

    const data = JSON.parse(outputText);
    res.json({
      heading: data.heading,
      tags: data.tags || [],  // ✅ always array
      faqs: data.faqs || [],
    });
  } catch (err) {
    console.error("JSON parse error:", err);
    res.status(500).json({ error: "Failed to generate AI data" });
  }
});

// 🟢 Get all chatbots from MongoDB
app.get("/api/chatbots", async (req, res) => {
  try {
    const chatbots = await Chatbot.find(); // Fetch all records
    res.status(200).json(chatbots);
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    res.status(500).json({ message: "Failed to fetch chatbots", error });
  }
});


// 🧠 Save chatbot data (AI-generated + user input)
app.post("/api/openai/save-chatbot-data", async (req, res) => {
  try {
    const chatbotData = req.body;
    const newChatbot = new Chatbot(chatbotData);
    await newChatbot.save();
    res.status(201).json({ message: "Chatbot saved successfully via OpenAI route!", chatbot: newChatbot });
  } catch (error) {
    console.error("Error saving chatbot via OpenAI route:", error);
    res.status(500).json({ message: "Failed to save chatbot data", error });
  }
});


// 🧠 Save AI-generated chatbot data (tags + FAQs) separately
app.post("/api/ai-chatbot-data", async (req, res) => {
  try {
    const {
      chatbotRefID,   // optional (reference to main Chatbot _id)
      userID,
      chatbotname,
      chatbotlogo,
      chatbotcontent,
      chatbotID,
      tags,
      faqs,
    } = req.body;

    // 🛑 Optional: validate required fields only
    if (!userID || !chatbotname || !chatbotcontent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🧩 Prepare the document (no ObjectId validation for chatbotRefID)
    const aiData = new AIChatbotData({
      chatbotRefID: chatbotRefID || null, // allow null safely
      userID,
      chatbotname,
      chatbotlogo,
      chatbotcontent,
      chatbotID,
      tags: tags || [],
      faqs: faqs || [],
    });

    // 💾 Save to MongoDB
    const savedAI = await aiData.save();

    console.log("✅ Saved AI Chatbot Data:", savedAI);
    res.status(201).json({
      message: "✅ AI chatbot data saved successfully",
      aiData: savedAI,
    });
  } catch (err) {
    console.error("❌ Error saving AI chatbot data:", err);
    res.status(500).json({ error: "Failed to save AI chatbot data" });
  }
});

//update query
app.put("/api/chatbots/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedChatbot = await Chatbot.findByIdAndUpdate(
      id,
      updatedData,
      { new: true } // returns the updated document
    );

    if (!updatedChatbot) {
      return res.status(404).json({ message: "Chatbot not found" });
    }

    res.json({ message: "Chatbot updated successfully!", chatbot: updatedChatbot });
  } catch (error) {
    console.error("Error updating chatbot:", error);
    res.status(500).json({ message: "Failed to update chatbot", error });
  }
});


// 🧠 Chatbot AI reply route
// 🧠 Chat reply endpoint (AI generates response using saved chatbot content)
app.post("/api/openai/chatreply", async (req, res) => {
  try {
    const { userMessage, chatbotId } = req.body;

    if (!chatbotId || !userMessage) {
      return res.status(400).json({ error: "Missing chatbotId or userMessage" });
    }

    // 🔍 Fetch the chatbot content from MongoDB
    const chatbot = await Chatbot.findById(chatbotId);
    if (!chatbot) {
      return res.status(404).json({ error: "Chatbot not found" });
    }

    const chatbotcontent = chatbot.chatbotcontent || "";

    // 🧠 Generate AI reply based on saved content
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are a chatbot assistant.
Use the following information to answer the user's question:

--- Chatbot Content ---
${chatbotcontent}

--- User Message ---
${userMessage}

Respond naturally and helpfully, but only based on the chatbot content above.
If the content does not include relevant info, politely say: 
"I'm sorry, I don't have that information right now."
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const reply = response.output[0].content[0].text;
    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat reply error:", err);
    res.status(500).json({ error: "Failed to generate chat reply" });
  }
});


// ✅ Ensure icons folder exists
const ICONS_FOLDER = path.join(__dirname, "public/icons");
if (!fs.existsSync(ICONS_FOLDER)) {
  fs.mkdirSync(ICONS_FOLDER, { recursive: true });
  console.log("Created folder:", ICONS_FOLDER);
}


// ✅ Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Destination folder:", ICONS_FOLDER); // 🔍 check this
    cb(null, ICONS_FOLDER);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    console.log("Saving file as:", uniqueName);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Multer setup
//const storage = multer.diskStorage({
 // destination: (req, file, cb) => {
 //    cb(null, path.join(__dirname, "public/icons"));
 // },
 // filename: (req, file, cb) => {
  //  const uniqueName =
   //   Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
  //  cb(null, uniqueName);
  //},
//});

//const upload = multer({ storage });




// Example: your chatbot routes below
// app.use("/api/chatbots", require("./routes/chatbots"));

// ✅ Upload endpoint
// upload route
app.post("/api/upload-icon", upload.single("icon"), (req, res) => {

  console.log("📥 Upload endpoint hit!");

  if (!req.file) {
    console.log("❌ No file received!");
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log("✅ File received:");
  console.log("➡ Saved as:", req.file.filename);
  console.log("➡ Full path:", req.file.path);
  console.log("req.file:", req.file);
 const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
 const imageUrl = `${BASE_URL}/public/icons/${req.file.filename}`;

  res.json({ imageUrl });
});

//login mongodb 
app.post("/api/register", async (req, res) => {
  try {
    const {username, email, password,  companyName, role} = req.body;

   // 1️⃣ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

  // 2️⃣ Create new user (password stored as plain text)
    const newUser = new User({
      username,
      email,
      password,
      companyName,
      role
    });

        await newUser.save();

    // 3️⃣ Send success response
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });

  }
})


//login api
// ✅ LOGIN API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Check password (plain text for now)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 3. Success
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



app.listen(3001, () => {
  console.log("Server is Running");
});