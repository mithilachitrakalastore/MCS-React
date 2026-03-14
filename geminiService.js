import { GoogleGenAI } from "@google/genai";

/**
 * Service to interact with Google's Gemini AI for art advice.
 * @param {string} userPrompt - The question or prompt from the user.
 * @returns {Promise<string>} - The AI generated response.
 */
export const getArtAdvice = async (userPrompt) => {
    // Access the API key from Vite environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is not defined in environment variables.");
        return "The digital oracle is currently unavailable. Please ensure the API key is configured.";
    }

    const genAI = new GoogleGenAI(apiKey); 
    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: `You are an expert art consultant specializing in Mithila (Maithili) art, 
        also known as Madhubani art. You are deeply knowledgeable about its history, 
        symbolism (like the significance of fish, peacocks, elephants, and the lotus), 
        traditional techniques (Kachni and Bharni), and the cultural heritage of the Mithila region.
        
        Your tone should be helpful, culturally rich, poetic, and respectful of the tradition's sacred roots.
        Guide customers in appreciating the art or choosing pieces for their homes based on their needs.
        Keep your responses concise (under 150 words) but impactful.`,
    });

    try {
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "The spirits of Mithila are currently resting. Please try again later for art wisdom.";
    }
};
