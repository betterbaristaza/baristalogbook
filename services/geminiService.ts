import { BrewMethod, CoffeeBean } from "../types";

export const getBrewAdvice = async (
  coffee: CoffeeBean,
  method: BrewMethod
) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "brew-advice",
        coffee,
        method,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const searchCommunityRecipes = async (query: string) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "community-recipes",
        query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};