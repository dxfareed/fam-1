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
      //@ts-ignore
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const part = result.candidates?.[0]?.content?.parts?.[0];
    if (part && 'text' in part) {
      //@ts-ignore
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
      //@ts-ignore
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const part = result.candidates?.[0]?.content?.parts?.[0];
    if (part && 'text' in part) {
      //@ts-ignore
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

    const religiousItems: { [key: string]: string } = {
      Muslim: 'the Holy Quran',
      Christian: 'the Holy Bible',
      Jewish: 'a Torah scroll',
      Hindu: 'the Vedas',
      Satanic: 'a book of shadows',
      Buddhist: 'prayer beads',
    };

    const expressions = ['a confident expression', 'a gentle smile', 'an energized expression, like it is ready for action'];
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];

    const baseInstruction = `Given the image of this ${gender} creature, which looks like ${description}, redraw it. The creature's core appearance and species must remain the same.`;
    const expressionInstruction = `It should have ${randomExpression} on its face.`;
    const poseInstruction = `It should be in a cool, dynamic, and interesting pose.`;
    const backgroundInstruction = `The background must be a simple, single solid color that complements the colors of the new outfit.`;
    const finalInstruction = `Return only the final image, with no text or annotations.`;

    let outfitInstruction = '';
    if (religion === 'Christian') {
      const christianStyles = ['modern Catholic priest/nun', 'modern Evangelical pastor', 'modern Christian enjoying a church service'];
      const randomStyle = christianStyles[Math.floor(Math.random() * christianStyles.length)];
      outfitInstruction = `Dress it in unique, ${randomStyle} attire.`;
    } else if (religion === 'Jewish') {
      outfitInstruction = `Dress it in unique, modern religious Jewish attire, making it look like it's in its 40s.`;
    } else {
      outfitInstruction = `Dress it in unique, modern religious ${religion} attire.`;
    }
    outfitInstruction += ` The outfit should be inspired by the creature's original appearance.`;

    let itemInstruction = '';
    if (Math.random() < 0.5 && religiousItems[religion]) {
      itemInstruction = `The creature can be holding ${religiousItems[religion]}.`;
    }

    const prompt = [
      baseInstruction,
      outfitInstruction,
      expressionInstruction,
      poseInstruction,
      itemInstruction,
      backgroundInstruction,
      finalInstruction
    ].filter(Boolean).join(' ');

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
    
    const part = result.candidates?.[0]?.content?.parts?.[0];

    if (part && 'inlineData' in part) {
        const generatedImage = part.inlineData;
        //@ts-ignore
        return `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    }
    
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
