/**
 * Service to interact with Google's Gemini AI for art advice via local Node server.
 * @param {string} userPrompt - The question or prompt from the user.
 * @returns {Promise<string>} - The AI generated response.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getArtAdvice = async (userPrompt) => {
    try {
        const response = await fetch(`${API_BASE_URL}/gemini`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userPrompt })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Gemini AI Server Error:", error);
        return "The spirits of Mithila are currently resting. Please try again later for art wisdom.";
    }
};
