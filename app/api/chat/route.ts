import { GoogleGenAI } from '@google/genai'

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
        return Response.json(
            { error: 'Gemini API key not configured.' },
            { status: 500 }
        )
    }

    const { message, profile, history: chatHistory } = await request.json()
    if (!message) {
        return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const profileContext = profile
        ? `\nCLIENT PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height}cm
- Weight: ${profile.weight}kg
- Fitness Level: ${profile.fitnessLevel}
- Goal: ${profile.goal}
- Days/week: ${profile.daysPerWeek}
- Equipment: ${profile.equipment}
- Injuries: ${profile.injuries || 'None'}\n`
        : '\nNo client profile available yet.\n'

    const priorMessages = (chatHistory || [])
        .slice(-6)
        .map((m: { role: string; text: string }) =>
            `${m.role === 'user' ? 'User' : 'Coach'}: ${m.text}`
        )
        .join('\n')

    const prompt = `You are a friendly, knowledgeable AI fitness coach inside the Gymify app. You have expertise in exercise science, nutrition, and training programming.
${profileContext}
${priorMessages ? `RECENT CONVERSATION:\n${priorMessages}\n` : ''}
RULES:
- Keep responses concise (2-4 short paragraphs max)
- Be encouraging but evidence-based
- Personalize advice based on the client profile when available
- Use simple language, avoid jargon
- If asked about medical conditions, recommend consulting a doctor
- You can suggest exercises, form tips, nutrition advice, recovery strategies
- Use emoji sparingly for friendliness

User: ${message}

Coach:`

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                maxOutputTokens: 500,
            },
        })

        const text = response.text ?? ''
        if (!text) {
            return Response.json(
                { error: 'Empty response. Try again.' },
                { status: 500 }
            )
        }

        return Response.json({ reply: text.trim() })
    } catch (err: any) {
        const message = err?.message || 'Unknown error'
        console.error('Chat error:', message)
        return Response.json(
            { error: 'Failed to get a response. Please try again.' },
            { status: 500 }
        )
    }
}
