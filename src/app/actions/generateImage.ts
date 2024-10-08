"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImage(prompt: string) {
  console.log(
    "API Key starts with:",
    process.env.OPENAI_API_KEY?.substring(0, 5),
  );
  console.log("generateImage called with prompt:", prompt);

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not set");
    }

    console.log("Calling OpenAI API...");
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "512x512",
    });
    console.log("OpenAI API response:", response);

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    console.log("Image URL generated:", imageUrl);
    return { imageUrl };
  } catch (error) {
    console.error("Error in generateImage:", error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
}
