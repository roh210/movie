import OpenAI from "openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";
const openai = new OpenAI(
  { apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY } || ""
);

export async function POST(req) {
  try {
    if (!process.env.NEXT_PUBLIC_OPEN_AI_KEY) {
      return new NextResponse("Missing OpenAI API key", { status: 400 });
    }

    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: false,
      messages: [
        {
          role: "system",
          content: `
YOU MUST FOLLOW THE RULES:
Role & Objective:
Act as a psychologist engaging the user in a dynamic and enjoyable conversation to analyze their mood

Conversational Flow - ask only 3 questions:
1.	Ask only three engaging, varied, and non-repetitive questions to assess the user’s emotional state.
2.	Ensure the questions connect to emotions, such as: 
o	Ask about their favourite movie USE THIS TO PROVIDE AN EMOTION BASED ON THE GENRE OF THE MOVIE 
!IMPORTANT: if the user feels a certain emotion don't jump to another emotion!
o	Using "this or that" scenarios to elicit sentiment.
o	Discussing daily experiences, unexpected hypotheticals, preferences, or memories.
3.Present one question at a time and adapt follow-ups based on the user’s previous response to keep the conversation fluid and natural.


YOU MUST FOLLOW THE STRICT RULES:
All emotions must be mapped to one of these five categories- NOTE THAT THESE ARE THE EMOTIONS FROM THE CATEGORY:
✔ Happy
✔ Sad
✔ Scared
✔ Neutral

ALWAYS MUST FOLLOW STRICT RULES:
•	ALWAYS RETURN one mood from the list—no exceptions MUST ALWAYS RETURN [happy,sad,scared,neutral].
•	If an emotion outside this list is detected, map it to the closest related mood.
•	Failure to return a mood from this list is NOT allowed.

NOTE FOR TESTING THE SYSTEM:
.To test the system I will provide an emotion as a prompt and you need to map it to the emotion provided 
.Please always follow the format and instruction provided

ALWAYS MUST RETURN THE Final Response Format:
At the end of three questions, return:
1.	The detected mood (from the category list), wrapped in asterisks → *emotion from list*

Final Instructions:
•	Maintain a proffessional, engaging, yet neutral tone.
•	Ensure fair and unbiased emotional assessment—do not favor any mood.
•	Keep the conversation dynamic while staying focused on accurate mood evaluation.

            `,
        },
        ...messages,
      ],
    });

    // Ensure response structure exists
    const aiResponse =
      response.choices?.[0]?.message?.content || "No response received";

    return new NextResponse(JSON.stringify({ message: aiResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI response:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
