import { GoogleGenAI, Type } from "@google/genai";

// Initialization should happen once. 
// In AI Studio, process.env.GEMINI_API_KEY is available in the environment.
// For standard Vite/Vercel environments, we may need to handle fallback or provided keys.
const apiKey = (process.env.GEMINI_API_KEY) || "";
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = "gemini-3-flash-preview";

export interface GeneratedConcept {
  title: string;
  content: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  hint: string;
}

export enum AIErrorType {
  CONFIG = "CONFIG",
  RATE_LIMIT = "RATE_LIMIT",
  SAFETY = "SAFETY",
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
  API_ERROR = "API_ERROR",
  UNKNOWN = "UNKNOWN"
}

export class GeminiError extends Error {
  type: AIErrorType;
  originalError: any;

  constructor(type: AIErrorType, message: string, originalError?: any) {
    super(message);
    this.name = "GeminiError";
    this.type = type;
    this.originalError = originalError;
  }
}

const handleGeminiError = (error: any): never => {
  console.error("Gemini SDK Error:", error);
  
  let type = AIErrorType.UNKNOWN;
  let message = "An unexpected error occurred with the AI service.";

  const errorString = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
  const errorObj = typeof error === 'object' ? error : {};

  if (errorString.includes("apiKey") || errorString.includes("API key") || errorString.includes("configured")) {
    type = AIErrorType.CONFIG;
    message = "The Gemini API key is missing or invalid. Please check your setup.";
  } else if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("Rate limit")) {
    type = AIErrorType.RATE_LIMIT;
    message = "You've reached the AI request limit. Please try again in 1 minute.";
  } else if (errorString.includes("404") || errorString.includes("not found")) {
    type = AIErrorType.MODEL_NOT_FOUND;
    message = "The AI model was not found. We might be using an unsupported version.";
  } else if (errorString.includes("400") || errorString.includes("Safety") || errorString.includes("blocked")) {
    type = AIErrorType.SAFETY;
    message = "The request was blocked, possibly due to safety filters or invalid input.";
  } else if (errorObj.status || errorObj.code) {
    type = AIErrorType.API_ERROR;
    message = `AI API Error: ${errorString}`;
  }

  throw new GeminiError(type, message, error);
};

export const explainTopic = async (topic: string, context: string = "") => {
  if (!genAI) {
    throw new GeminiError(AIErrorType.CONFIG, "Gemini AI is not configured. Please check your environment variables.");
  }
  
  try {
    const prompt = `You are an expert tutor. Explain the following topic in a clear, concise, and engaging way for a student: "${topic}". ${context ? `Context: ${context}` : ""} Use Markdown for formatting (bolding, lists, headers) to make it information-rich and easy to scan. Important: Do not end with a question or any prompt for further interaction, as the user cannot reply in this interface.`;
    
    // @ts-ignore - AI Studio SDK has specific types
    const response = await (genAI as any).models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateConcepts = async (topic: string, context: string = "") => {
  if (!genAI) {
    throw new GeminiError(AIErrorType.CONFIG, "Gemini AI is not configured. Please check your environment variables.");
  }

  try {
    const prompt = `Based on the following topic and description, generate 3-5 key concepts that a student should understand. Topic: "${topic}". Description: "${context}".`;

    // @ts-ignore - AI Studio SDK has specific types
    const response = await (genAI as any).models.generateContent({ 
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"],
          },
        },
      },
    });
    
    return JSON.parse(response.text || "[]") as GeneratedConcept[];
  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateFlashcards = async (topic: string, context: string = "") => {
  if (!genAI) {
    throw new GeminiError(AIErrorType.CONFIG, "Gemini AI is not configured. Please check your environment variables.");
  }

  try {
    const prompt = `Based on the following topic and description, generate 5 study flashcards (question, answer, and a short hint). Topic: "${topic}". Description: "${context}".`;

    // @ts-ignore - AI Studio SDK has specific types
    const response = await (genAI as any).models.generateContent({ 
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              hint: { type: Type.STRING },
            },
            required: ["question", "answer", "hint"],
          },
        },
      },
    });
    
    return JSON.parse(response.text || "[]") as GeneratedFlashcard[];
  } catch (error) {
    handleGeminiError(error);
  }
};
