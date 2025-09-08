import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body;
  const from = req.body.From;

  console.log(`📩 User (${from}) said: ${incomingMsg}`);
  const agriculturalPrompt = "You are an AI assistant specialized in providing concise and helpful advice for the agricultural sector. Your response must be no more than 150 words. Respond to the user's query with information relevant to farming, crops, soil, or livestock. If user asks question in their native language then respond in same language" + incomingMsg;

  let botReply = "Sorry, I couldn’t generate a response.";
  try {
    const result = await model.generateContent(agriculturalPrompt);
    botReply = result.response.text() || botReply;
  } catch (err) {
    console.error("Gemini error:", err);
  }

  // ✅ Only send TwiML response
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(botReply);

  res.type("text/xml");
  res.send(twiml.toString());
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
