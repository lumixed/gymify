import { GoogleGenAI } from '@google/genai'

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_api_key_here') {
        return Response.json(
            { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' },
            { status: 500 }
        )
    }

    const { profile, macros } = await request.json()
    if (!profile || !macros) {
        return Response.json({ error: 'Profile and macros data are required' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `You are a certified sports nutritionist. Based on this client profile and macro targets, create a daily meal plan.

CLIENT PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height}cm
- Weight: ${profile.weight}kg
- Fitness Level: ${profile.fitnessLevel}
- Goal: ${profile.goal}

DAILY MACRO TARGETS:
- Calories: ${macros.calories} kcal
- Protein: ${macros.protein}g
- Carbs: ${macros.carbs}g
- Fat: ${macros.fat}g

RULES:
- Create exactly 4 meals: Breakfast, Lunch, Snack, Dinner
- Each meal should have 2-4 food items with portion sizes in grams or common units
- Total macros across all meals should approximately match the daily targets
- Use simple, affordable, commonly available foods
- If the goal is lose-fat, emphasize high-volume low-calorie foods
- If the goal is build-muscle, emphasize protein-rich meals
- Include estimated macros per meal
- Add a brief tip for each meal

Return ONLY valid JSON in this exact format, no markdown, no code blocks:
{
  "overview": "Brief 1-sentence summary of the nutrition strategy",
  "meals": [
    {
      "name": "Breakfast",
      "time": "7:00 AM",
      "items": [
        {
          "food": "Food name",
          "portion": "150g",
          "calories": 200,
          "protein": 15,
          "carbs": 20,
          "fat": 5
        }
      ],
      "totalCalories": 400,
      "totalProtein": 30,
      "totalCarbs": 40,
      "totalFat": 12,
      "tip": "Brief meal prep or nutrition tip"
    }
  ],
  "dailyTip": "One general nutrition tip for their goal"
}`

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        })

        const text = response.text ?? ''

        if (!text) {
            return Response.json(
                { error: 'Empty response from Gemini. Try again.' },
                { status: 500 }
            )
        }

        const nutrition = JSON.parse(text)
        return Response.json({ nutrition })
    } catch (err: any) {
        const message = err?.message || err?.toString() || 'Unknown error'
        console.error('Gemini nutrition error:', message)

        return Response.json(
            { error: 'Failed to generate nutrition plan. Please try again.' },
            { status: 500 }
        )
    }
}
