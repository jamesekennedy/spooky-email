import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedEmail } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert sales copywriter specializing in high-converting cold email sequences.
Your goal is to write personalized, engaging, and professional emails based on provided contact data and a template context.
Ensure tone is natural, not robotic.

IMPORTANT: Do NOT include any signature lines (e.g., "Best,", "Regards,", "Sincerely,") or placeholder text (e.g., "[Your Name]", "[My Name]", "[Company]") at the end of emails. End the email body with your final sentence or call-to-action.
`;

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      subject: {
        type: Type.STRING,
        description: "The subject line of the email",
      },
      body: {
        type: Type.STRING,
        description: "The body content of the email. Do not include signature placeholders if not in prompt.",
      },
    },
    required: ["subject", "body"],
  },
};

export const generateEmailSequence = async (
  apiKey: string,
  template: string,
  contactData: Record<string, string>,
  variables: string[]
): Promise<GeneratedEmail[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Interpolate the prompt for the model to understand context
  let filledPromptContext = `
TEMPLATE:
"""
${template}
"""

CONTACT DATA:
`;
  
  // We don't replace the {{}} in the prompt sent to Gemini necessarily, 
  // but it's better to give Gemini the specific values to "fill in" the template logically.
  // or we can ask Gemini to "Use the following data to instantiate the template".
  
  Object.entries(contactData).forEach(([key, value]) => {
    filledPromptContext += `- ${key}: ${value}\n`;
  });

  filledPromptContext += `
\nINSTRUCTIONS:
Generate a sequence of emails based on the template and contact data above.
If the template implies multiple steps (follow-ups), generate multiple items in the array.
Return valid JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: filledPromptContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as GeneratedEmail[];
    return data;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};