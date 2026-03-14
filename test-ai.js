import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("--- GEMINI API TEST ---");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ ERROR: Could not find GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

console.log(`✅ Key found! It starts with: ${apiKey.substring(0, 5)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

// WE ARE USING 1.5-FLASH HERE
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function runTest() {
  try {
    console.log("Sending a test message to Google...");
    const result = await model.generateContent("Say 'Hello World' if you can hear me!");
    console.log("\n✅ SUCCESS! Google AI Replied:");
    console.log(result.response.text());
  } catch (error) {
    console.log("\n❌ FAILED TO CONNECT!");
    console.error(error.message);
  }
}

runTest();