import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import { GoogleGenAI  } from "@google/genai";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Gemini client
const ai = new GoogleGenAI ({
  apiKey: process.env.GEMINI_API_KEY,
});

// Twilio webhook (user sends message here)
app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body;
  const from = req.body.From; // actual sender from Twilio

  console.log(`📩 User (${from}) said: ${incomingMsg}`);

  let botReply = "Sorry, I couldn’t generate a response.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: incomingMsg }] }],
    });

    botReply = response.response.text();
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
