package com.ssunen.backend.util;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.ssunen.backend.exception.BadRequestException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public final class RequestUtils {
    private static final Type MAP_TYPE = new TypeToken<Map<String, Object>>() {}.getType();
    private static final Gson gson = new Gson();

    private RequestUtils() {}

    public static Map<String, Object> readJson(HttpServletRequest req) throws IOException, BadRequestException {
        StringBuilder body = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
        }
        if (body.length() == 0) {
            return Collections.emptyMap();
        }
        try {
            Map<String, Object> data = gson.fromJson(body.toString(), MAP_TYPE);
            return data == null ? Collections.emptyMap() : data;
        } catch (RuntimeException ex) {
            throw new BadRequestException("JSON inválido");
        }
    }

    public static String path(HttpServletRequest req) {
        String path = req.getPathInfo();
        return path == null || path.isBlank() ? "/" : path;
    }

    public static Integer intParam(HttpServletRequest req, String name) throws BadRequestException {
        String value = req.getParameter(name);
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Parámetro " + name + " inválido");
        }
    }

    public static int pathId(String path, String prefix) throws BadRequestException {
        String rest = path.substring(prefix.length());
        int slash = rest.indexOf('/');
        String id = slash >= 0 ? rest.substring(0, slash) : rest;
        try {
            int parsed = Integer.parseInt(id);
            if (parsed <= 0) {
                throw new NumberFormatException();
            }
            return parsed;
        } catch (NumberFormatException ex) {
            throw new BadRequestException("ID inválido");
        }
    }

    public static String string(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value == null ? null : String.valueOf(value).trim();
    }

    public static String requiredString(Map<String, Object> data, String key, String message) throws BadRequestException {
        String value = string(data, key);
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        return value;
    }

    public static Integer integer(Map<String, Object> data, String key) throws BadRequestException {
        Object value = data.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Campo " + key + " inválido");
        }
    }

    public static BigDecimal decimal(Map<String, Object> data, String key) throws BadRequestException {
        Object value = data.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Campo " + key + " inválido");
        }
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> objectList(Map<String, Object> data, String key) throws BadRequestException {
        Object value = data.get(key);
        if (value instanceof List<?>) {
            return (List<Map<String, Object>>) value;
        }
        throw new BadRequestException("Campo " + key + " inválido");
    }

    public static String bearerToken(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring(7);
        }
        if (req.getCookies() != null) {
            for (Cookie cookie : req.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
