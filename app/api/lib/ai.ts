import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function interpretUserRequest(userInput: string) {
  const prompt = `
    Extract event filters from this text: "${userInput}". 
    Return ONLY JSON with these fields: category (null if not mentioned), location (null if not mentioned).
    Example: {"category": "AI", "location": "Kololo"}
  `;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(completion.choices[0].message.content!);
}