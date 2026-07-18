import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function interpretUserRequest(userInput: string) {
  if (!openai) {
    return { category: null, location: null };
  }

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

// Falls back to a templated icebreaker when no OpenAI key is configured
function fallbackIcebreaker(interestsA: string[], interestsB: string[]) {
  const shared = interestsA.filter((i) => interestsB.includes(i));
  if (shared.length > 0) {
    return `You both like ${shared[0]} — what got you into it?`;
  }
  return "What brought you to this event today?";
}

// Generates a fun, low-pressure icebreaker question for two matched attendees
export async function generateIcebreaker(interestsA: string[], interestsB: string[]) {
  if (!openai) {
    return fallbackIcebreaker(interestsA, interestsB);
  }

  const shared = interestsA.filter((i) => interestsB.includes(i));

  const prompt = `
    Two people are meeting at a tech event. Person A is interested in: ${interestsA.join(', ') || 'general topics'}.
    Person B is interested in: ${interestsB.join(', ') || 'general topics'}.
    ${shared.length > 0 ? `They both share an interest in: ${shared.join(', ')}.` : ''}
    Write ONE short, fun, low-pressure icebreaker question they could ask each other in person.
    Keep it under 20 words. Return ONLY the question text, no quotes or extra formatting.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content?.trim() ?? fallbackIcebreaker(interestsA, interestsB);
  } catch (err) {
    console.error('Icebreaker Generation Error:', err);
    return fallbackIcebreaker(interestsA, interestsB);
  }
}
