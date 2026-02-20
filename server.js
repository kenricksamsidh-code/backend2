import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gemini setup (v1 API)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// -------------------- CHAT (Gemini) --------------------
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Use v1 models (flash = fast, pro = powerful)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(userMessage);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini error details:", err);
    res.json({ reply: "⚠️ Gemini API error. Check console for details." });
  }
});

// -------------------- MATH --------------------
app.post("/math", (req, res) => {
  try {
    const expr = req.body.message.replace(/math/i, "").trim();
    const result = Function(`"use strict"; return (${expr})`)();
    res.json({ reply: `🧮 Result: ${result}` });
  } catch (err) {
    res.json({ reply: "⚠️ Invalid math expression." });
  }
});

// -------------------- WEATHER --------------------
app.post("/weather", async (req, res) => {
  try {
    const city = req.body.message.replace(/weather/i, "").trim() || "Bengaluru";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    res.json({
      reply: `🌤 Current weather in ${data.name}: ${data.weather[0].description}, ${data.main.temp}°C`
    });
  } catch (err) {
    console.error("Weather API error:", err);
    res.json({ reply: "⚠️ Weather API error." });
  }
});

// -------------------- RAINFALL --------------------
app.post("/rainfall", (req, res) => {
  const city = req.body.message.replace(/rainfall/i, "").trim() || "Bengaluru";
  const rainfallInfo = `🌧️ Rainfall in ${city}: 
- Monsoon (June–Sept): heavy, often 150–200 mm/month
- Winter (Dec–Feb): very low, <10 mm/month
- Summer (Mar–May): moderate, 40–60 mm/month`;
  res.json({ reply: rainfallInfo });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
