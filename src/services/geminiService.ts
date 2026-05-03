import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface GeneratedConcept {
  title: string;
  content: string;
}

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  hint: string;
}

export const explainTopic = async (topic: string, context: string = "") => {
  const prompt = `You are an expert tutor. Explain the following topic in a clear, concise, and engaging way for a student: "${topic}". ${context ? `Context: ${context}` : ""} Use Markdown for formatting (bolding, lists, headers) to make it information-rich and easy to scan.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
  });
  
  return response.text;
};

export const generateConcepts = async (topic: string, context: string = "") => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Based on the following topic and description, generate 3-5 key concepts that a student should understand. Topic: "${topic}". Description: "${context}".`,
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
  
  return JSON.parse(response.text) as GeneratedConcept[];
};

export const generateFlashcards = async (topic: string, context: string = "") => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Based on the following topic and description, generate 5 study flashcards (question, answer, and a short hint). Topic: "${topic}". Description: "${context}".`,
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
  
  return JSON.parse(response.text) as GeneratedFlashcard[];
};
