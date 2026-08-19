import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured');
    return res.status(500).json({ error: 'AI service is not configured' });
  }

  try {
    const { action, coffee, method, query } = req.body ?? {};

    if (action === 'brew-advice') {
      if (!coffee || !method) {
        return res.status(400).json({
          error: 'Coffee and brew method are required',
        });
      }

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

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dose: { type: Type.NUMBER },
              yield: { type: Type.NUMBER },
              temp: { type: Type.NUMBER },
              grindSize: { type: Type.STRING },
              time: { type: Type.STRING },
              tastingNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              instructions: { type: Type.STRING },
            },
            required: [
              'dose',
              'yield',
              'temp',
              'grindSize',
              'time',
              'tastingNotes',
            ],
          },
        },
      });

      return res.status(200).json(
        JSON.parse(response.text || '{}')
      );
    }

    if (action === 'community-recipes') {
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          error: 'Search query is required',
        });
      }

      const prompt = `Generate 3 realistic community coffee recipes for: ${query}.
Ensure they include diverse brew methods such as Espresso, Pour Over and Aeropress.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
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
                recipe: { type: Type.STRING },
              },
            },
          },
        },
      });

      return res.status(200).json(
        JSON.parse(response.text || '[]')
      );
    }

    return res.status(400).json({
      error: 'Unknown Gemini action',
    });
  } catch (error) {
    console.error('Gemini server error:', error);

    return res.status(500).json({
      error: 'Unable to generate AI response',
    });
  }
}