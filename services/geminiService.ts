import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateTeamName = async (gameName: string): Promise<string> => {
  if (!ai) {
    console.warn("API Key missing for Gemini");
    return "Team " + Math.floor(Math.random() * 1000);
  }

  try {
    const prompt = `Generate a cool, short, competitive esports team name for a ${gameName} tournament. 
    Just return the name, nothing else. No quotes.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "Unknown Team";
  } catch (error) {
    console.error("Error generating team name:", error);
    return "Team " + Math.floor(Math.random() * 1000);
  }
};