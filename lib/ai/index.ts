import { openai, createOpenAI } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { LanguageModel, ImageModel } from "ai";

export type AIProvider = "openai" | "gemini" | "claude" | "groq";

const groqCustom = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export function getModel(provider: AIProvider | "vision" = "groq"): LanguageModel {
  switch (provider) {
    case "openai":
      return openai("gpt-4o");
    case "gemini":
      return google("models/gemini-1.5-pro-latest");
    case "claude":
      return anthropic("claude-3-5-sonnet-20240620");
    case "vision":
      return groqCustom("llama-3.2-11b-vision-preview");
    case "groq":
      return groqCustom("llama-3.1-8b-instant");
    default:
      return groqCustom("llama-3.1-8b-instant");
  }
}

export function getImageModel(): ImageModel {
  // Use DALL-E 3 as the default image model
  return openai.image("dall-e-3");
}
