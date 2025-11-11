// scripts/test-gai.ts
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { makeCreatureSmile } from "../lib/generative-ai";

dotenv.config();

async function testGenerativeAI() {
  try {
    const imagePath = path.join(process.cwd(), "public", "human98", "baby.png");
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log(`Testing with local image: ${imagePath}`);

    const result = await makeCreatureSmile(imageUrl);

    if (result) {
      // I will save the image to a file to check the result.
      const base64Data = result.replace(/^data:image\/png;base64,/, "");
      const outputPath = path.join(process.cwd(), "public", "generated-image.png");
      fs.writeFileSync(outputPath, base64Data, 'base64');
      console.log("Generated image saved to public/generated-image.png");
    } else {
      console.log("Failed to generate image.");
    }
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

testGenerativeAI();
