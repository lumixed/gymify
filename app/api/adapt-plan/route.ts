import { GoogleGenAI, Type, Schema } from '@google/genai'

const exerciseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        sets: { type: Type.INTEGER },
        reps: { type: Type.STRING },
        rest: { type: Type.STRING },
        notes: { type: Type.STRING },
    },
    required: ['name', 'sets', 'reps', 'rest', 'notes'],
}

const trainingDaySchema: Schema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.INTEGER },
        name: { type: Type.STRING },
        focus: { type: Type.STRING },
        exercises: {
            type: Type.ARRAY,
            items: exerciseSchema,
        },
    },
    required: ['day', 'name', 'focus', 'exercises'],
}

const planSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        split: { type: Type.STRING },
        days: {
            type: Type.ARRAY,
            items: trainingDaySchema,
        },
    },
    required: ['split', 'days'],
}

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
        return Response.json(
            { error: 'Gemini API key not configured.' },
            { status: 500 }
        )
    }

    const { profile, history, measurements, currentPlan } = await request.json()

    if (!profile) {
        return Response.json(
            { error: 'Profile is required to adapt plan.' },
            { status: 400 }
        )
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `You are an expert AI personal trainer. 
Your client has completed a training phase and is checking in for an adapted plan.

CLIENT PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Goal: ${profile.goal}
- Experience: ${profile.fitnessLevel}
- Training Days: ${profile.daysPerWeek}
- Equipment: ${profile.equipment}
- Initial Weight: ${profile.weight} kg

PROGRESS DATA:
- Workouts completed in current phase: ${(history || []).length}
- Average recent workout score: ${
        history?.length 
            ? Math.round(history.reduce((a: any, b: any) => a + b.avgScore, 0) / history.length) 
            : 0
    }/100
- Latest weight: ${measurements?.length ? measurements[0].weight : profile.weight} kg

CURRENT PLAN (For reference):
${currentPlan?.split || 'None'}

TASK:
Based on their goal and progress, generate the NEXT PHASE of their workout plan.
- If they are doing well, increase volume or intensity (progressive overload).
- If they are a beginner, maybe introduce slightly more complex movements.
- Keep the number of training days equal to their preference (${profile.daysPerWeek}).
- Provide a clear, structured JSON response.

Ensure exercises have sets, rep ranges (e.g. "8-12"), rest times (e.g. "90s"), and a form note.`

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
                responseSchema: planSchema,
            },
        })

        const text = response.text ?? ''
        const data = JSON.parse(text)
        
        // Add generated timestamp
        data.generatedAt = new Date().toISOString()

        return Response.json(data)
    } catch (err: any) {
        console.error('Adapt plan error:', err)
        return Response.json(
            { error: 'Failed to adapt plan. Please try again.' },
            { status: 500 }
        )
    }
}
