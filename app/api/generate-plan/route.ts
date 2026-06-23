import { GoogleGenAI } from '@google/genai'

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
        return Response.json(
            { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' },
            { status: 500 }
        )
    }

    const { profile } = await request.json()
    if (!profile) {
        return Response.json({ error: 'Profile data is required' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `You are a certified personal trainer. Based on this client profile, create a weekly workout plan.

CLIENT PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height}cm
- Weight: ${profile.weight}kg
- Fitness Level: ${profile.fitnessLevel}
- Goal: ${profile.goal}
- Available Days: ${profile.daysPerWeek} days/week
- Equipment: ${profile.equipment}
- Injuries/Limitations: ${profile.injuries || 'None'}

RULES:
- Create exactly ${profile.daysPerWeek} training days
- Each day should have 4-6 exercises
- Adapt complexity to fitness level
- Avoid exercises that conflict with listed injuries
- For bodyweight equipment, only use bodyweight exercises
- For dumbbells, use dumbbell and bodyweight exercises
- For full gym, use any equipment

Return ONLY valid JSON in this exact format, no markdown, no code blocks:
{
  "split": "Name of the split (e.g. Push/Pull/Legs, Upper/Lower, Full Body)",
  "days": [
    {
      "day": 1,
      "name": "Day name (e.g. Push Day, Upper Body A)",
      "focus": "Primary muscle groups",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "8-12",
          "rest": "60s",
          "notes": "Brief form tip"
        }
      ]
    }
  ]
}`

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        })

        const text = response.text ?? ''
        const plan = JSON.parse(text)

        return Response.json({ plan })
    } catch (err: any) {
        console.error('Gemini API error:', err?.message || err)
        return Response.json(
            { error: 'Failed to generate plan. Please try again.' },
            { status: 500 }
        )
    }
}
