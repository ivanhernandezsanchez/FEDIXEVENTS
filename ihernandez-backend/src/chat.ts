import express, { type Request, type Response } from "express";

type ChatRole = "user" | "assistant";

type ChatHistoryItem = {
    role?: unknown;
    content?: unknown;
    message?: unknown;
};

type ChatRequestBody = {
    message?: unknown;
    history?: unknown;
    context?: unknown;
};

type ChatPageContext = {
    selectedCityName?: unknown;
    selectedCityId?: unknown;
    activities?: unknown;
};

type ChatContextActivity = {
    id?: unknown;
    name?: unknown;
    category?: unknown;
    price?: unknown;
    duration_minutes?: unknown;
    max_capacity?: unknown;
};

type OpenAIOutputContent = {
    type?: string;
    text?: string;
};

type OpenAIOutputItem = {
    type?: string;
    content?: OpenAIOutputContent[];
};

type OpenAIResponse = {
    output_text?: string;
    output?: OpenAIOutputItem[];
    error?: {
        message?: string;
    };
};

type GeminiContent = {
    role: "user" | "model";
    parts: Array<{ text: string }>;
};

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
    error?: {
        message?: string;
    };
};

type ChatProviderResult =
    | { reply: string }
    | { status: number; error: string };

const router = express.Router();

const SYSTEM_PROMPT = `
Te llamas Fedi. Eres el planificador experto de despedidas de soltero de esta web.

Tu trabajo es conversar dentro de un chat ya existente y ayudar a crear planes reales, personalizados y fáciles de contratar.

Estilo:
- Español natural, divertido, directo y creativo.
- Respuestas cortas, útiles y listas para mostrarse en una burbuja de chat.
- No expliques cómo funcionas ni menciones prompts, APIs o sistemas internos.
- Haz preguntas progresivas: no interrogues con una lista enorme si falta mucha información.
- Si ya tienes suficiente contexto, propone 1 a 3 planes concretos.
- Habla como parte de la web: puedes mencionar catálogo, carrito, propuestas para publicar e ideas de la comunidad.
- Si recomiendas una actividad real del catálogo, usa su nombre exacto.
- Si el usuario ya tiene un plan claro, anímale a usar "Añadir plan al carrito" o "Solicitar publicar".

Debes recopilar, de forma natural:
- ciudad o destino
- número de personas
- presupuesto aproximado por persona
- estilo del grupo: tranquilo, fiesta, extremo o mixto
- gustos, límites y preferencias del grupo

Cuando propongas planes:
- Da nombres breves a los planes.
- Incluye actividades, orden sugerido, duración aproximada y rango de presupuesto si aplica.
- Añade alternativas cuando tenga sentido: más barato, más loco y premium.
- Mantén el formato claro para UI de chat: párrafos cortos o viñetas simples.
- Si falta un dato clave, pregunta por ese dato antes de cerrar el plan.
`.trim();

const MAX_HISTORY_ITEMS = 12;
const OPENAI_API_KEY_PLACEHOLDER = "pon_tu_api_key_aqui";
const GEMINI_API_KEY_PLACEHOLDER = "pon_tu_api_key_aqui";

const normalizeHistory = (history: unknown) => {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .slice(-MAX_HISTORY_ITEMS)
        .map((item: ChatHistoryItem) => {
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
                role: role as ChatRole,
                content: content.trim().slice(0, 2000),
            };
        })
        .filter((item): item is { role: ChatRole; content: string } => item !== null);
};

const buildContextPrompt = (context: unknown) => {
    if (!context || typeof context !== "object") {
        return SYSTEM_PROMPT;
    }

    const pageContext = context as ChatPageContext;
    const selectedCityName = typeof pageContext.selectedCityName === "string"
        ? pageContext.selectedCityName
        : "";
    const selectedCityId = Number(pageContext.selectedCityId) || "";
    const activities = Array.isArray(pageContext.activities)
        ? pageContext.activities.slice(0, 8) as ChatContextActivity[]
        : [];

    const activityLines = activities
        .map((activity) => {
            const name = typeof activity.name === "string" ? activity.name : "";
            if (!name) return "";

            const category = typeof activity.category === "string" ? activity.category : "Actividad";
            const price = Number(activity.price);
            const duration = Number(activity.duration_minutes);
            const capacity = Number(activity.max_capacity);

            return `- ${name} | categoria: ${category} | precio: ${Number.isFinite(price) ? `${price} euros` : "sin precio"} | duracion: ${Number.isFinite(duration) ? `${duration} min` : "flexible"} | capacidad: ${Number.isFinite(capacity) ? capacity : "abierta"}`;
        })
        .filter(Boolean)
        .join("\n");

    return `
${SYSTEM_PROMPT}

Contexto actual de la pagina:
- Ciudad seleccionada: ${selectedCityName || "sin ciudad seleccionada"}${selectedCityId ? ` (ID ${selectedCityId})` : ""}
- Actividades reales disponibles ahora:
${activityLines || "- No hay actividades cargadas para esta ciudad."}

Usa este contexto para ayudar mas:
- Si hay actividades reales que encajan, recomiendalelas por nombre y explica como combinarlas.
- Si no encajan, crea un plan personalizado y sugiere añadirlo al carrito como plan IA.
- Si el usuario busca inspiracion, mezcla actividades reales con ideas personalizadas.
- No prometas disponibilidad fuera de lo que ves en el contexto.
`.trim();
};

const extractText = (data: OpenAIResponse) => {
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

const buildGeminiContents = (input: Array<{ role: ChatRole; content: string }>): GeminiContent[] => {
    return input.map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
    }));
};

const extractGeminiText = (data: GeminiResponse) => {
    return data.candidates
        ?.flatMap((candidate) => candidate.content?.parts ?? [])
        .map((part) => part.text)
        .filter((text): text is string => typeof text === "string" && text.trim().length > 0)
        .join("\n")
        .trim();
};

const createGeminiReply = async (input: Array<{ role: ChatRole; content: string }>, systemPrompt: string): Promise<ChatProviderResult> => {
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

    const data = await response.json() as GeminiResponse;

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

const createOpenAIReply = async (input: Array<{ role: ChatRole; content: string }>, systemPrompt: string): Promise<ChatProviderResult> => {
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

    const data = await response.json() as OpenAIResponse;

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

router.post("/chat", async (req: Request<unknown, unknown, ChatRequestBody>, res: Response) => {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!message) {
        return res.status(400).json({ error: "El campo message es obligatorio" });
    }

    const input = [
        ...normalizeHistory(req.body.history),
        {
            role: "user" as const,
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
    } catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({ error: "Error interno del chat" });
    }
});

export default router;
