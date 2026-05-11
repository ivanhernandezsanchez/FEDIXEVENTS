package com.ssunen.backend.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.ssunen.backend.exception.ApiException;
import com.ssunen.backend.exception.BadRequestException;
import com.ssunen.backend.util.EnvConfig;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

public class ChatService {
    private static final String SYSTEM_PROMPT = """
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
        """.trim();

    private static final String OPENAI_API_KEY_PLACEHOLDER = "pon_tu_api_key_aqui";
    private static final String GEMINI_API_KEY_PLACEHOLDER = "pon_tu_api_key_aqui";
    private static final int MAX_HISTORY_ITEMS = 12;

    private final Gson gson = new Gson();
    private final HttpClient client = HttpClient.newHttpClient();

    public Map<String, Object> reply(Map<String, Object> body) throws ApiException {
        String message = string(body.get("message")).trim();
        if (message.isBlank()) {
            throw new BadRequestException("El campo message es obligatorio");
        }

        JsonArray input = normalizeHistory(body.get("history"));
        JsonObject userMessage = new JsonObject();
        userMessage.addProperty("role", "user");
        userMessage.addProperty("content", truncate(message, 2000));
        input.add(userMessage);

        String provider = env("AI_PROVIDER", "gemini");
        String systemPrompt = buildContextPrompt(body.get("context"));
        String text = "openai".equalsIgnoreCase(provider)
            ? createOpenAiReply(input, systemPrompt)
            : createGeminiReply(input, systemPrompt);
        return Map.of("reply", text);
    }

    private JsonArray normalizeHistory(Object history) {
        JsonArray input = new JsonArray();
        if (!(history instanceof List<?> items)) {
            return input;
        }
        int start = Math.max(0, items.size() - MAX_HISTORY_ITEMS);
        for (Object raw : items.subList(start, items.size())) {
            if (!(raw instanceof Map<?, ?> item)) {
                continue;
            }
            String role = string(item.get("role"));
            if (!"assistant".equals(role) && !"user".equals(role)) {
                continue;
            }
            String content = string(first(item.get("content"), item.get("message"))).trim();
            if (content.isBlank()) {
                continue;
            }
            JsonObject normalized = new JsonObject();
            normalized.addProperty("role", role);
            normalized.addProperty("content", truncate(content, 2000));
            input.add(normalized);
        }
        return input;
    }

    private String createOpenAiReply(JsonArray input, String systemPrompt) throws ApiException {
        String apiKey = env("OPENAI_API_KEY", "");
        if (apiKey.isBlank() || OPENAI_API_KEY_PLACEHOLDER.equals(apiKey)) {
            throw new ApiException(500, "OPENAI_API_KEY no está configurada en el backend");
        }

        JsonObject payload = new JsonObject();
        payload.addProperty("model", env("OPENAI_MODEL", "gpt-5.2"));
        payload.addProperty("instructions", systemPrompt);
        payload.add("input", input);
        payload.addProperty("max_output_tokens", 450);

        JsonObject data = postJson("https://api.openai.com/v1/responses", payload, Map.of(
            "Authorization", "Bearer " + apiKey
        ));

        if (data.has("output_text") && !data.get("output_text").isJsonNull()) {
            String text = data.get("output_text").getAsString().trim();
            if (!text.isBlank()) {
                return text;
            }
        }
        if (data.has("output") && data.get("output").isJsonArray()) {
            StringBuilder text = new StringBuilder();
            for (JsonElement item : data.getAsJsonArray("output")) {
                JsonArray contents = item.getAsJsonObject().getAsJsonArray("content");
                if (contents == null) {
                    continue;
                }
                for (JsonElement content : contents) {
                    JsonObject contentObject = content.getAsJsonObject();
                    if ("output_text".equals(string(json(contentObject, "type"))) && contentObject.has("text")) {
                        text.append(contentObject.get("text").getAsString()).append('\n');
                    }
                }
            }
            if (!text.toString().trim().isBlank()) {
                return text.toString().trim();
            }
        }
        throw new ApiException(502, "La IA no devolvió texto");
    }

    private String createGeminiReply(JsonArray input, String systemPrompt) throws ApiException {
        String apiKey = env("GEMINI_API_KEY", "");
        if (apiKey.isBlank() || GEMINI_API_KEY_PLACEHOLDER.equals(apiKey)) {
            throw new ApiException(500, "GEMINI_API_KEY no está configurada en el backend");
        }

        JsonObject payload = new JsonObject();
        JsonObject instruction = new JsonObject();
        JsonArray instructionParts = new JsonArray();
        JsonObject instructionText = new JsonObject();
        instructionText.addProperty("text", systemPrompt);
        instructionParts.add(instructionText);
        instruction.add("parts", instructionParts);
        payload.add("system_instruction", instruction);

        JsonArray contents = new JsonArray();
        for (JsonElement item : input) {
            JsonObject inputItem = item.getAsJsonObject();
            JsonObject content = new JsonObject();
            content.addProperty("role", "assistant".equals(inputItem.get("role").getAsString()) ? "model" : "user");
            JsonArray parts = new JsonArray();
            JsonObject part = new JsonObject();
            part.addProperty("text", inputItem.get("content").getAsString());
            parts.add(part);
            content.add("parts", parts);
            contents.add(content);
        }
        payload.add("contents", contents);

        JsonObject config = new JsonObject();
        config.addProperty("temperature", 0.8);
        config.addProperty("maxOutputTokens", 800);
        JsonObject thinking = new JsonObject();
        thinking.addProperty("thinkingBudget", 0);
        config.add("thinkingConfig", thinking);
        payload.add("generationConfig", config);

        String model = env("GEMINI_MODEL", "gemini-2.5-flash");
        JsonObject data = postJson(
            "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
            payload,
            Map.of("x-goog-api-key", apiKey));

        StringBuilder text = new StringBuilder();
        JsonArray candidates = data.getAsJsonArray("candidates");
        if (candidates != null) {
            for (JsonElement candidate : candidates) {
                JsonObject content = candidate.getAsJsonObject().getAsJsonObject("content");
                if (content == null) {
                    continue;
                }
                JsonArray parts = content.getAsJsonArray("parts");
                if (parts == null) {
                    continue;
                }
                for (JsonElement part : parts) {
                    JsonObject partObject = part.getAsJsonObject();
                    if (partObject.has("text")) {
                        text.append(partObject.get("text").getAsString()).append('\n');
                    }
                }
            }
        }
        if (text.toString().trim().isBlank()) {
            throw new ApiException(502, "Gemini no devolvió texto");
        }
        return text.toString().trim();
    }

    private JsonObject postJson(String url, JsonObject payload, Map<String, String> headers) throws ApiException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)));
        headers.forEach(builder::header);
        try {
            HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            JsonObject data = gson.fromJson(response.body(), JsonObject.class);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String error = data != null && data.has("error")
                    ? data.getAsJsonObject("error").get("message").getAsString()
                    : "Error desconocido de IA";
                throw new ApiException(response.statusCode() == 429 ? 429 : 502, error);
            }
            return data == null ? new JsonObject() : data;
        } catch (IOException ex) {
            throw new ApiException(502, "No se pudo conectar con el proveedor de IA");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(500, "La petición del chat fue interrumpida");
        }
    }

    private String buildContextPrompt(Object context) {
        if (!(context instanceof Map<?, ?> pageContext)) {
            return SYSTEM_PROMPT;
        }
        String city = string(pageContext.get("selectedCityName"));
        String cityId = string(pageContext.get("selectedCityId"));
        StringBuilder activities = new StringBuilder();
        Object rawActivities = pageContext.get("activities");
        if (rawActivities instanceof List<?> list) {
            for (Object raw : list.subList(0, Math.min(8, list.size()))) {
                if (raw instanceof Map<?, ?> activity) {
                    activities.append("- ")
                        .append(string(activity.get("name")))
                        .append(" | categoria: ")
                        .append(string(activity.get("category")))
                        .append(" | precio: ")
                        .append(string(activity.get("price")))
                        .append(" euros | duracion: ")
                        .append(string(activity.get("duration_minutes")))
                        .append(" min | capacidad: ")
                        .append(string(activity.get("max_capacity")))
                        .append('\n');
                }
            }
        }
        return (SYSTEM_PROMPT + "\n\nContexto actual de la pagina:\n"
            + "- Ciudad seleccionada: " + (city.isBlank() ? "sin ciudad seleccionada" : city)
            + (cityId.isBlank() ? "" : " (ID " + cityId + ")")
            + "\n- Actividades reales disponibles ahora:\n"
            + (activities.isEmpty() ? "- No hay actividades cargadas para esta ciudad." : activities)
            + "\nUsa este contexto para ayudar mas:\n"
            + "- Si hay actividades reales que encajan, recomiendalelas por nombre y explica como combinarlas.\n"
            + "- Si no encajan, crea un plan personalizado y sugiere añadirlo al carrito como plan IA.\n"
            + "- Si el usuario busca inspiracion, mezcla actividades reales con ideas personalizadas.\n"
            + "- No prometas disponibilidad fuera de lo que ves en el contexto.").trim();
    }

    private Object first(Object first, Object second) {
        return first == null ? second : first;
    }

    private Object json(JsonObject object, String key) {
        return object.has(key) && !object.get(key).isJsonNull() ? object.get(key).getAsString() : "";
    }

    private String string(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private static String env(String key, String fallback) {
        return EnvConfig.get(key, fallback);
    }
}
