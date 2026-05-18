import express, {} from "express";
const router = express.Router();
const SYSTEM_PROMPT = `
Your name is Fedi. You are the expert celebration planner for this website.

Your job is to chat with users and help them create real, personalised, easy-to-book plans for stag and hen parties.

Style:
- Natural, fun, direct and creative English.
- Short, useful replies that fit neatly inside a chat bubble.
- NEVER use markdown: no asterisks, no hashes, no dashes as bullet points, no bold, no italics, no headers. Plain text only.
- Do not explain how you work or mention prompts, APIs or internal systems.
- Ask progressive questions — do not fire a long list of questions if a lot of information is missing.
- Once you have enough context, suggest 1 to 3 concrete plans.
- Speak as part of the website: you can mention the catalogue, cart, publish ideas and community ideas.
- If you recommend a real catalogue activity, use its exact name.
- If the user already has a clear plan, encourage them to use "Add plan to cart" or "Publish idea".

Collect naturally during the conversation:
- city or destination
- number of people
- approximate budget per person
- group style: relaxed, party, extreme or mixed
- tastes, limits and preferences of the group

When proposing plans:
- Give each plan a short name.
- Include activities, suggested order, approximate duration and budget range if applicable.
- Add alternatives where it makes sense: cheaper, wilder and premium.
- Keep the format clean for a chat UI: short paragraphs only, no bullet symbols.
- If a key detail is missing, ask for it before finalising the plan.
`.trim();
const MAX_HISTORY_ITEMS = 12;
const OPENAI_API_KEY_PLACEHOLDER = "pon_tu_api_key_aqui";
const GEMINI_API_KEY_PLACEHOLDER = "pon_tu_api_key_aqui";
const normalizeHistory = (history) => {
    if (!Array.isArray(history)) {
        return [];
    }
    return history
        .slice(-MAX_HISTORY_ITEMS)
        .map((item) => {
        const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
        const content = typeof item.content === "string"
            ? item.content
            : typeof item.message === "string"
                ? item.message
                : "";
        if (!role || !content.trim()) {
            return null;
        }
        return {
            role: role,
            content: content.trim().slice(0, 2000),
        };
    })
        .filter((item) => item !== null);
};
const buildContextPrompt = (context) => {
    if (!context || typeof context !== "object") {
        return SYSTEM_PROMPT;
    }
    const pageContext = context;
    const selectedCityName = typeof pageContext.selectedCityName === "string"
        ? pageContext.selectedCityName
        : "";
    const selectedCityId = Number(pageContext.selectedCityId) || "";
    const activities = Array.isArray(pageContext.activities)
        ? pageContext.activities.slice(0, 8)
        : [];
    const activityLines = activities
        .map((activity) => {
        const name = typeof activity.name === "string" ? activity.name : "";
        if (!name)
            return "";
        const category = typeof activity.category === "string" ? activity.category : "Activity";
        const price = Number(activity.price);
        const duration = Number(activity.duration_minutes);
        const capacity = Number(activity.max_capacity);
        return `${name} | category: ${category} | price: ${Number.isFinite(price) ? `${price} EUR` : "no price"} | duration: ${Number.isFinite(duration) ? `${duration} min` : "flexible"} | capacity: ${Number.isFinite(capacity) ? capacity : "open"}`;
    })
        .filter(Boolean)
        .join("\n");
    return `
${SYSTEM_PROMPT}

Current page context:
Selected city: ${selectedCityName || "no city selected"}${selectedCityId ? ` (ID ${selectedCityId})` : ""}
Real activities available now:
${activityLines || "No activities loaded for this city."}

Use this context to help further:
If real activities fit, recommend them by name and explain how to combine them.
If they do not fit, create a custom plan and suggest adding it to the cart as an AI plan.
If the user is looking for inspiration, mix real activities with personalised ideas.
Do not promise availability beyond what you see in the context.
`.trim();
};
const extractText = (data) => {
    if (typeof data.output_text === "string" && data.output_text.trim()) {
        return data.output_text.trim();
    }
    return data.output
        ?.flatMap((item) => item.content ?? [])
        .filter((content) => content.type === "output_text" && typeof content.text === "string")
        .map((content) => content.text)
        .join("\n")
        .trim();
};
const buildGeminiContents = (input) => {
    return input.map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
    }));
};
const extractGeminiText = (data) => {
    return data.candidates
        ?.flatMap((candidate) => candidate.content?.parts ?? [])
        .map((part) => part.text)
        .filter((text) => typeof text === "string" && text.trim().length > 0)
        .join("\n")
        .trim();
};
const createGeminiReply = async (input, systemPrompt) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER) {
        return {
            status: 500,
            error: "GEMINI_API_KEY no está configurada en el backend",
        };
    }
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: systemPrompt }],
            },
            contents: buildGeminiContents(input),
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 800,
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        const geminiError = data.error?.message ?? "Error desconocido de Gemini";
        console.error("Gemini chat error:", geminiError);
        return {
            status: response.status === 429 ? 429 : 502,
            error: response.status === 429
                ? "Gemini ha alcanzado el límite gratuito temporal. Espera un poco y vuelve a probar."
                : "No se pudo generar la respuesta con Gemini",
        };
    }
    const reply = extractGeminiText(data);
    if (!reply) {
        return {
            status: 502,
            error: "Gemini no devolvió texto",
        };
    }
    return { reply };
};
const createOpenAIReply = async (input, systemPrompt) => {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === OPENAI_API_KEY_PLACEHOLDER) {
        return {
            status: 500,
            error: "OPENAI_API_KEY no está configurada en el backend",
        };
    }
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL ?? "gpt-5.2",
            instructions: systemPrompt,
            input,
            max_output_tokens: 450,
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        const openAIError = data.error?.message ?? "Error desconocido de OpenAI";
        const isQuotaError = /quota|billing|insufficient_quota/i.test(openAIError);
        console.error("OpenAI chat error:", openAIError);
        return {
            status: isQuotaError ? 402 : 502,
            error: isQuotaError
                ? "La cuenta de OpenAI no tiene cuota o billing activo. Revisa el plan de OpenAI y vuelve a probar."
                : "No se pudo generar la respuesta del chat",
        };
    }
    const reply = extractText(data);
    if (!reply) {
        return {
            status: 502,
            error: "La IA no devolvió texto",
        };
    }
    return { reply };
};
router.post("/chat", async (req, res) => {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!message) {
        return res.status(400).json({ error: "El campo message es obligatorio" });
    }
    const input = [
        ...normalizeHistory(req.body.history),
        {
            role: "user",
            content: message.slice(0, 2000),
        },
    ];
    try {
        const provider = process.env.AI_PROVIDER ?? "gemini";
        const systemPrompt = buildContextPrompt(req.body.context);
        const result = provider === "openai"
            ? await createOpenAIReply(input, systemPrompt)
            : await createGeminiReply(input, systemPrompt);
        if ("error" in result) {
            return res.status(result.status).json({ error: result.error });
        }
        res.json({ reply: result.reply });
    }
    catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({ error: "Error interno del chat" });
    }
});
export default router;
//# sourceMappingURL=chat.js.map