
import { GoogleGenAI, Type } from "@google/genai";
import { BrewMethod, CoffeeBean } from "../types";

// Always use process.env.API_KEY directly in the named parameter object
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBrewAdvice = async (coffee: CoffeeBean, method: BrewMethod) => {
  const prompt = `Act as a world-class barista. I have a coffee: ${coffee.name} from ${coffee.roaster}. 
  Origin: ${coffee.origin}. Roast: ${coffee.roastLevel}. Process: ${coffee.process}.
  I want to brew this using ${method}. 
  Please provide a recommended starting recipe including:
  1. Dose (g)
  2. Yield (g)
  3. Water Temp (Celsius)
  4. Grind Size suggestion (relative scale)
  5. Brew Time target
  6. Tasting notes to look for.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dose: { type: Type.NUMBER },
            yield: { type: Type.NUMBER },
            temp: { type: Type.NUMBER },
            grindSize: { type: Type.STRING },
            time: { type: Type.STRING },
            tastingNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.STRING }
          },
          required: ["dose", "yield", "temp", "grindSize", "time", "tastingNotes"]
        }
      }
    });

    // Use .text property directly
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const searchCommunityRecipes = async (query: string) => {
  const prompt = `Generate 3 realistic community coffee recipes for: ${query}. 
  Ensure they include diverse brew methods (Espresso, Pour Over, Aeropress).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              coffeeName: { type: Type.STRING },
              roasterName: { type: Type.STRING },
              author: { type: Type.STRING },
              method: { type: Type.STRING },
              description: { type: Type.STRING },
              likes: { type: Type.NUMBER },
              recipe: { type: Type.STRING }
            }
          }
        }
      }
    });
    // Use .text property directly
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};
