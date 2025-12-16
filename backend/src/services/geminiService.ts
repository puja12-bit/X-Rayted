import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, RiskLevel, ProductCategory } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_PROMPT = `
You are an expert product safety, material, and nutritional analyst. Your goal is to analyze ANY consumer item—packaged goods, fresh food, utensils, clothes, toys, etc.

**MODES OF OPERATION:**
1. **Label/Text Visible:** Read the ingredients, composition, or nutritional info. 
   - **QUANTITY EXTRACTION:** Extract specific quantities if listed (e.g., "10g Sugar", "5% Niacin").
   - **COMPLIANCE CHECK:** Analyze compliance with health standards.
2. **No Label / Visual Only (Objects):** Visually identify the object and infer its material (e.g., "Aluminum Pot").
3. **Fresh Food (Fruits, Veg, Meat):** 
   - **WEIGHT ESTIMATION:** Estimate the TOTAL VISIBLE weight or count (e.g., "Approx. 1kg", "6 Bananas", "500g Steak").
   - **NUTRITION CALCULATION:** Provide approximate nutritional values (Calories, Protein, Carbs, Fat, Vitamins) for that ESTIMATED amount.
4. **Legal & Controversy Check:** Identify lawsuits, bans, or health scandals.

**OUTPUT INSTRUCTIONS:**
- You will receive a specific number of images.
- **CRITICAL:** Return exactly one result object per image in order.
- **Verdict:** Short, punchy title.
- **Ingredients:** List ingredients found. If fresh food, list key nutrients as ingredients.
- **Nutrition (New):** For fresh food/meat, fill the nutrition object. For others, return null.
- **Estimated Weight:** Best guess of quantity shown.
- **Search Query:** A search term to find health benefits (e.g., "Benefits of eating organic tomatoes").
- **Risk Level:** Strict 'Safe', 'Caution', 'Toxic/Unhealthy'.

Return strict JSON.
`;

export const analyzeImages = async (base64Images: string[]): Promise<Omit<ScanResult, 'id' | 'timestamp' | 'imageUrl'>[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageCount = base64Images.length;

    const parts: any[] = [];
    
    base64Images.forEach(img => {
       const cleanBase64 = img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
       parts.push({
         inlineData: {
           mimeType: "image/jpeg",
           data: cleanBase64
         }
       });
    });

    parts.push({
      text: `Analyze these ${imageCount} images. Return exactly ${imageCount} results. For fresh food, estimate weight and nutrition.`
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  risk_level: { type: Type.STRING },
                  verdict: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  legal_issues: { type: Type.STRING },
                  estimated_weight: { type: Type.STRING, description: "Approximate weight visible (e.g., '1.5kg'). Null if not applicable." },
                  search_query: { type: Type.STRING, description: "Query for health benefits (e.g., 'Health benefits of ...')" },
                  nutrition: {
                    type: Type.OBJECT,
                    nullable: true,
                    description: "Nutritional info for the estimated weight. Null for non-food.",
                    properties: {
                      calories: { type: Type.STRING },
                      protein: { type: Type.STRING },
                      carbs: { type: Type.STRING },
                      fat: { type: Type.STRING },
                      vitamins: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.STRING },
                        description: { type: Type.STRING },
                        risk: { type: Type.STRING }
                      },
                      required: ["name", "description", "risk"]
                    }
                  }
                },
                required: ["category", "risk_level", "verdict", "reasoning", "ingredients"]
              }
            }
          }
        }
      },
      contents: [{ parts: parts }]
    });

    const text = response.text;
    console.log("Gemini Raw Response:", text);

    if (!text) throw new Error("No response from Gemini");

    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    if (!parsed.results || !Array.isArray(parsed.results)) {
        throw new Error("Invalid response format: missing results array");
    }

    let processedResults = parsed.results;

    if (processedResults.length < imageCount) {
        console.warn(`Mismatch: Sent ${imageCount} images, got ${processedResults.length} results.`);
        const missingCount = imageCount - processedResults.length;
        for (let i = 0; i < missingCount; i++) {
            processedResults.push({
                category: ProductCategory.OTHER,
                risk_level: RiskLevel.UNKNOWN,
                verdict: "Analysis Skipped",
                reasoning: "The AI did not return a result.",
                legal_issues: null,
                ingredients: []
            });
        }
    }
    if (processedResults.length > imageCount) {
        processedResults = processedResults.slice(0, imageCount);
    }

    return processedResults.map((result: any) => {
        const normalizeRisk = (r: string): RiskLevel => {
          const lower = r ? r.toLowerCase() : '';
          if (lower.includes('toxic') || lower.includes('unhealthy')) return RiskLevel.TOXIC;
          if (lower.includes('caution') || lower.includes('warn')) return RiskLevel.CAUTION;
          if (lower.includes('safe') || lower.includes('healthy')) return RiskLevel.SAFE;
          return RiskLevel.UNKNOWN;
        };

        const risk_level = normalizeRisk(result.risk_level);
        
        let legal_issues = result.legal_issues;
        if (legal_issues === "None" || legal_issues === "") {
            legal_issues = null;
        }

        let ingredients = [];
        if (result.ingredients && Array.isArray(result.ingredients)) {
          ingredients = result.ingredients.map((ing: any) => ({
            ...ing,
            quantity: ing.quantity || null,
            risk: normalizeRisk(ing.risk)
          }));
        }
        
        return {
            category: result.category || ProductCategory.OTHER,
            risk_level,
            verdict: result.verdict || "Unknown Item",
            reasoning: result.reasoning || "No details provided.",
            legal_issues,
            estimated_weight: result.estimated_weight || null,
            nutrition: result.nutrition || null,
            search_query: result.search_query || result.verdict,
            ingredients
        };
    });

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    let errorMessage = "Could not process image.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return base64Images.map(() => ({
      category: ProductCategory.OTHER,
      risk_level: RiskLevel.UNKNOWN,
      verdict: "Analysis Failed",
      reasoning: `The scan failed. Details: ${errorMessage}`,
      legal_issues: null,
      ingredients: [],
      estimated_weight: null,
      nutrition: null,
      search_query: null
    }));
  }
};
