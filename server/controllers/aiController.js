import { GoogleGenerativeAI } from "@google/generative-ai";

export const enhanceDescription = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title && !description) {
      return res.status(400).json({ message: "Please provide a title or brief description to enhance." });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
       return res.status(500).json({ message: "AI features are currently unavailable. Please configure the API key in the server .env file." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `You are an expert copywriter for a freelance/task marketplace called Taskmate.
Your goal is to help a client write a professional, clear, and comprehensive task description based on their brief input.
    
Task Title: ${title || "Not provided"}
Initial Description Brief: ${description || "Not provided"}

Please provide ONLY the enhanced, professional description. DO NOT use any Markdown formatting whatsoever (no asterisks, no hashes, no bolding). Use standard text formatting. Use plain dashes "-" for bullet points. Keep it concise but detailed enough for a volunteer to understand the requirements, scope, and expectations.`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const enhancedText = aiResponse.text();

    res.status(200).json({ enhancedDescription: enhancedText });
  } catch (error) {
    console.error("AI Enhance Error:", error);
    res.status(500).json({ message: "Failed to enhance description with AI.", error: error.message });
  }
};
