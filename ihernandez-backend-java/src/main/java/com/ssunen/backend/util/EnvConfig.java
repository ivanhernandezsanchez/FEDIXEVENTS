package com.ssunen.backend.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class EnvConfig {
    private static final Map<String, String> fileValues = loadEnvFiles();

    private EnvConfig() {}

    public static String get(String key, String fallback) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            value = System.getProperty(key);
        }
        if (value == null || value.isBlank()) {
            value = fileValues.get(key);
        }
        return value == null || value.isBlank() ? fallback : value;
    }

    private static Map<String, String> loadEnvFiles() {
        Map<String, String> values = new LinkedHashMap<>();
        List<Path> candidates = List.of(
            Path.of(".env"),
            Path.of("..", ".env"),
            Path.of("..", "ihernandez-backend", ".env"),
            Path.of("ihernandez-backend", ".env")
        );
        for (Path path : candidates) {
            if (Files.isRegularFile(path)) {
                readEnv(path, values);
            }
        }
        return values;
    }

    private static void readEnv(Path path, Map<String, String> values) {
        try {
            for (String line : Files.readAllLines(path)) {
                String trimmed = line.trim();
                if (trimmed.isBlank() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                    continue;
                }
                int separator = trimmed.indexOf('=');
                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                values.putIfAbsent(key, value);
            }
        } catch (IOException ignored) {
            // Si no se puede leer el .env, se usan variables reales del entorno o valores por defecto.
        }
    }
}
