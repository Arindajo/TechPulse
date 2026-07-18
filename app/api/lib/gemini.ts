import { GoogleGenAI } from "@google/genai";

// Initialize the new Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getMatchIcebreaker(userA: any, userB: any) {
  const prompt = `User A likes ${userA.interests.join(', ')}. User B likes ${userB.interests.join(', ')}. 
                  Write a friendly 15-word icebreaker for them to connect at a tech event.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using the highly efficient, low-latency MVP model
      contents: prompt,
    });

    return response.text || "Hi! Let's connect and talk about our shared tech interests.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hi! Glad to meet you at the event. What projects are you working on?";
  }
}