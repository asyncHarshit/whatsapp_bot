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
  const from = req.body.From; // actual sender from Twilio

  console.log(`📩 User (${from}) said: ${incomingMsg}`);

  let botReply = "Sorry, I couldn’t generate a response.";
  try {
   const result = await model.generateContent(incomingMsg);

    botReply = result.response.text();
    if (botReply) {
      res.json({ reply: botReply });
    } else {
      res.status(500).json({ error: "No response generated." });
    }
  } catch (err) {
    console.error("Gemini error:", err);
  }

  // Twilio reply (TwiML)
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(botReply);

  res.type("text/xml");
  res.send(twiml.toString());
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
