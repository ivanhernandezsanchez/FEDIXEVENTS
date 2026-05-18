-- ============================================================
--  FedixEvents — Actualización de precios realistas (por persona)
--  Ejecutar una sola vez en la base de datos de producción
-- ============================================================

-- Fiesta / Club / Barco
UPDATE activities SET price = 89.00  WHERE id = 1;   -- Catamarán Private Party (Ibiza)
UPDATE activities SET price = 72.00  WHERE id = 5;   -- Sunset Boat & Paella
UPDATE activities SET price = 145.00 WHERE id = 3;   -- Club VIP Ibiza Night
UPDATE activities SET price = 52.00  WHERE id = 13;  -- Rooftop Cocktail Class
UPDATE activities SET price = 175.00 WHERE id = 16;  -- Fiesta en Villa Privada

-- Aventura tierra
UPDATE activities SET price = 26.00  WHERE id = 2;   -- Paintball Pro
UPDATE activities SET price = 29.00  WHERE id = 6;   -- Paintball BCN Extremo
UPDATE activities SET price = 79.00  WHERE id = 9;   -- Quad Tour Montserrat
UPDATE activities SET price = 38.00  WHERE id = 10;  -- Karting Madrid Indoor
UPDATE activities SET price = 19.00  WHERE id = 12;  -- Axe Throwing Madrid
UPDATE activities SET price = 75.00  WHERE id = 20;  -- Buggy 4x4 Sierra Nevada

-- Aventura agua
UPDATE activities SET price = 92.00  WHERE id = 4;   -- Jet Ski & Snorkel Tour
UPDATE activities SET price = 22.00  WHERE id = 14;  -- Kayak Ciudad de las Artes
UPDATE activities SET price = 38.00  WHERE id = 17;  -- Wakeboard & Paddle Málaga

-- Gastro
UPDATE activities SET price = 32.00  WHERE id = 8;   -- Ruta Cerveza Artesanal
UPDATE activities SET price = 68.00  WHERE id = 11;  -- Cena Maridaje Sorpresa
UPDATE activities SET price = 58.00  WHERE id = 15;  -- Paella Master Class
UPDATE activities SET price = 48.00  WHERE id = 18;  -- Ruta de Vinos Axarquía

-- Ocio
UPDATE activities SET price = 18.00  WHERE id = 7;   -- Escape Room Detectives

-- Premium
UPDATE activities SET price = 185.00 WHERE id = 19;  -- Despedida Glamping Sunset

COMMIT;
