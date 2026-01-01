
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function fetchAiWords(category: 'CELEBRITIES' | 'RANDOM'): Promise<string[]> {
  const prompt = category === 'CELEBRITIES' 
    ? "Genera una lista de 50 celebridades famosas mundiales (actores, cantantes, deportistas, etc.) para un juego de palabras. Devuelve solo los nombres en español."
    : "Genera una lista de 50 conceptos o palabras interesantes para un juego de adivinar el impostor. Evita palabras muy abstractas.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["words"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"words": []}');
    return data.words;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails
    return ["Messi", "Shakira", "Elon Musk", "Brad Pitt", "Rihanna", "Beyoncé", "Cristiano Ronaldo"];
  }
}
