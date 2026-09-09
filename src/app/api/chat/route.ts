import Anthropic from "@anthropic-ai/sdk";
import { buildChatContext } from "@/lib/chat/retrieval";
import { COMPANY } from "@/lib/constants";

// Needs Prisma (Node APIs), so this route cannot run on the Edge runtime.
export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Riya, the friendly virtual assistant for ${COMPANY.name}, a real estate agency in ${COMPANY.city}, Jharkhand, India.

How you talk:
- Warm, natural and conversational — like a helpful local property consultant chatting on WhatsApp, never like a corporate bot reading a script.
- Mirror the customer's language: reply in Hindi, English, or Hinglish (Roman-script Hindi mixed with English) to match how they wrote to you — don't force pure English on a Hinglish question.
- Keep replies short and human (2-5 sentences is usually enough). Ask one short follow-up question when it genuinely helps narrow things down (budget, locality, BHK, buy/rent/resale).
- Refer to the company as "hum" and address the customer as "aap". Be genuinely helpful, never pushy or salesy.
- Never use robotic phrases like "As an AI language model" or "I don't have personal opinions". No long bullet-point walls unless you're listing more than one property.

What you're grounded in:
- Only state a price, address, area, BHK count or availability status that appears in the "Current data" block below. Never invent or guess one — that causes real financial harm to a customer.
- If nothing in the current data matches the customer's ask, say so honestly and offer to connect them with the human team instead of making something up.
- For anything outside your knowledge (legal paperwork specifics, exact bank loan eligibility, final price negotiation), be upfront that a human agent should confirm it, and give the phone/WhatsApp number.
- If the customer wants to sell their own property, direct them to the "Sell Your Property" page or offer to take their number for a callback.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      `Maaf kijiye, chat assistant abhi activate nahi hua hai. Kripya seedhe humein call ya WhatsApp karein: ${COMPANY.phone}`,
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter(
          (m): m is ChatMessage =>
            !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
        )
        .slice(-12)
    : [];

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (!lastUserMessage.trim()) {
    return new Response("Please type a message.", { status: 400 });
  }

  let context: string;
  try {
    context = await buildChatContext(lastUserMessage);
  } catch {
    context =
      "Live property data is temporarily unavailable. Answer generally, be honest that you can't pull exact listings right now, and suggest contacting the team directly.";
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: `${SYSTEM_PROMPT}\n\nCurrent data (use only this for specifics):\n${context}`,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch {
          controller.enqueue(
            encoder.encode(`\n\nConnection interrupted — kripya dobara try karein.`)
          );
        } finally {
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch {
    return new Response(
      `Abhi thoda technical issue aa raha hai. Kripya thodi der baad try karein ya humein call karein: ${COMPANY.phone}`,
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
