// lib/generative-ai.ts
import genai from "@google/genai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_GENERATIVE_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_GENERATIVE_API_KEY is not set");
}

const genAI = new genai.GoogleGenAI({ apiKey: API_KEY });

async function urlToGenerativePart(url: string, mimeType: string) {
    if (url.startsWith('data:')) {
        const [meta, base64Data] = url.split(',');
        const [_, inferredMimeType] = meta.split(':');
        return {
            inlineData: {
                data: base64Data,
                mimeType: inferredMimeType.split(';')[0],
            },
        };
    }
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType,
      },
    };
  }

export async function getCreatureGender(imageUrl: string): Promise<string> {
  try {
    const imagePart = await urlToGenerativePart(imageUrl, "image/png");
    const prompt = "Analyze the creature in this image. Does it appear male or female? Respond with only one word: 'male', 'female', or 'unknown'.";

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const part = result.candidates?.[0]?.content?.parts?.[0];
    if (part && 'text' in part) {
      const gender = part.text.trim().toLowerCase();
      if (['male', 'female', 'unknown'].includes(gender)) {
        return gender;
      }
    }
    return 'unknown';
  } catch (error) {
    console.error("Error calling Gemini API for gender analysis:", error);
    return 'unknown';
  }
}

export async function getCreatureDescription(imageUrl: string): Promise<string> {
  try {
    const imagePart = await urlToGenerativePart(imageUrl, "image/png");
    const prompt = "Analyze the creature in this image. Describe its key visual features, such as its species, colors, textures, and overall style, in a short phrase.";

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const part = result.candidates?.[0]?.content?.parts?.[0];
    if (part && 'text' in part) {
      return part.text.trim();
    }
    return 'a creature';
  } catch (error) {
    console.error("Error calling Gemini API for description analysis:", error);
    return 'a creature';
  }
}

export async function makeCreatureSmile(imageUrl: string, religion: string, gender: string, description: string): Promise<string | null> {
  try {
    const imagePart = await urlToGenerativePart(imageUrl, "image/png");

    let prompt;
    if (religion === 'Christian') {
      const christianStyles = ['full Catholic', 'modern Christian dressed for church'];
      const randomStyle = christianStyles[Math.floor(Math.random() * christianStyles.length)];
      prompt = `Given the image of this ${gender} creature, which looks like ${description}, dress it in unique ${randomStyle} attire that is inspired by its appearance. The character should remain the same. Return only the image, no text.`;
    } else if (religion === 'Jewish') {
      prompt = `Given the image of this ${gender} creature, which looks like ${description}, dress it as a religious ${religion} in their 40s. The attire should be unique and inspired by the creature's appearance. The character should remain the same. Return only the image, no text.`;
    } else {
      prompt = `Given the image of this ${gender} creature, which looks like ${description}, dress it in unique religious ${religion} attire that is inspired by its appearance. The character should remain the same, but its attire should be changed. Return only the image, no text.`;
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: [{ role: "user", parts: [
        { text: prompt },
        imagePart
      ]}],
      // @ts-ignore
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        }
      ],
    });
    
    console.log("Gemini API result:", JSON.stringify(result, null, 2));
    const part = result.candidates?.[0]?.content?.parts?.[0];

    if (part && 'inlineData' in part) {
        const generatedImage = part.inlineData;
        return `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    }
    
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
